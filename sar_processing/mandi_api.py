"""FastAPI for mandi AI/ML integration.

Endpoints:
- POST /api/mandi/push
- GET  /api/mandi/recommend
- POST /api/mandi/location
"""

from __future__ import annotations

import json
import os
import time
import uuid
from typing import Any, Dict, List, Optional, Tuple
from urllib import request, error

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse


app = FastAPI()

AIML_PUSH_URL = os.getenv("AIML_PUSH_URL", "").strip()
AIML_RECOMMEND_URL = os.getenv("AIML_RECOMMEND_URL", "").strip()
AIML_LOCATION_URL = os.getenv("AIML_LOCATION_URL", "").strip()

# In-memory fallback store for payloads when AIML service is not configured.
_FALLBACK_PAYLOADS: List[Dict[str, Any]] = []
_FALLBACK_LOCATIONS: List[Dict[str, Any]] = []


# -------------------------
# Helpers
# -------------------------

def _parse_location(body: Dict[str, Any]) -> Tuple[Optional[float], Optional[float], Dict[str, Any]]:
    loc = body.get("location") or {}
    lat = body.get("lat") if body.get("lat") is not None else loc.get("lat")
    lng = body.get("lng") if body.get("lng") is not None else loc.get("lng")
    meta = {
        "city": body.get("city") or loc.get("city"),
        "district": body.get("district") or loc.get("district"),
        "state": body.get("state") or loc.get("state"),
    }
    return _to_float(lat), _to_float(lng), meta


def _to_float(value: Any) -> Optional[float]:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _http_json(url: str, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    if payload is None:
        req = request.Request(url, method="GET")
    else:
        data = json.dumps(payload).encode("utf-8")
        req = request.Request(url, data=data, method="POST", headers={"Content-Type": "application/json"})

    try:
        with request.urlopen(req, timeout=12) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except error.URLError as exc:
        return {"ok": False, "error": f"AIML request failed: {exc}"}


def _fallback_recommendations(lat: Optional[float], lng: Optional[float], crop: str, quantity: float) -> Dict[str, Any]:
    # Use a reasonable default set of mandis (user asked to pick an appropriate location).
    recommendations = [
        {
            "location": "Ahmedabad APMC",
            "price_per_kg": 24.5,
            "currency": "INR",
            "trend": "up",
            "distance_km": 18.4,
            "expected_net_profit": round(24.5 * quantity * 0.88, 2),
            "alternate": "Rajkot Market",
            "alternate_price_per_kg": 23.8,
            "demand_level": "high",
        },
        {
            "location": "Surat Mandi",
            "price_per_kg": 25.1,
            "currency": "INR",
            "trend": "stable",
            "distance_km": 42.7,
            "expected_net_profit": round(25.1 * quantity * 0.84, 2),
            "alternate": "Vadodara APMC",
            "alternate_price_per_kg": 24.2,
            "demand_level": "medium",
        },
    ]

    return {
        "ok": True,
        "source": "fallback",
        "query": {
            "lat": lat,
            "lng": lng,
            "crop": crop,
            "quantity": quantity,
        },
        "recommendations": recommendations,
        "notes": "AIML service not configured. Returning default mandi insights.",
    }


# -------------------------
# Routes
# -------------------------


@app.get("/api/health")
def health():
    return {"ok": True, "service": "mandi-fastapi"}


@app.post("/api/mandi/push")
async def mandi_push(body: Dict[str, Any]):
    body = body or {}

    lat, lng, meta = _parse_location(body)
    crops = body.get("available_crops") or body.get("crops") or []
    quantity = _to_float(body.get("quantity"))

    if lat is None or lng is None:
        raise HTTPException(status_code=400, detail="lat/lng required")
    if not isinstance(crops, list) or not crops:
        raise HTTPException(status_code=400, detail="available_crops must be a non-empty list")
    if quantity is None or quantity <= 0:
        raise HTTPException(status_code=400, detail="quantity must be a positive number")

    payload = {
        "id": str(uuid.uuid4()),
        "timestamp": int(time.time()),
        "location": {"lat": lat, "lng": lng, **{k: v for k, v in meta.items() if v}},
        "available_crops": crops,
        "quantity": quantity,
    }

    if AIML_PUSH_URL:
        result = _http_json(AIML_PUSH_URL, payload)
        return {"ok": True, "source": "aiml", "payload": payload, "aiml": result}

    _FALLBACK_PAYLOADS.append(payload)
    return {"ok": True, "source": "fallback", "payload": payload}


@app.get("/api/mandi/recommend")
def mandi_recommend(lat: float, lng: float, crop: str = "wheat", quantity: float = 1.0):

    if AIML_RECOMMEND_URL:
        url = f"{AIML_RECOMMEND_URL}?lat={lat}&lng={lng}&crop={crop}&quantity={quantity}"
        result = _http_json(url)
        return {"ok": True, "source": "aiml", "data": result}

    return JSONResponse(_fallback_recommendations(lat, lng, crop, quantity))


@app.post("/api/mandi/location")
async def push_location(body: Dict[str, Any]):
    """Push latitude and longitude to AI/ML for processing."""
    body = body or {}

    lat = _to_float(body.get("lat") or body.get("latitude"))
    lng = _to_float(body.get("lng") or body.get("longitude"))

    if lat is None or lng is None:
        raise HTTPException(status_code=400, detail="lat/lng (or latitude/longitude) required")

    # Optional metadata
    meta = {
        "city": body.get("city"),
        "district": body.get("district"),
        "state": body.get("state"),
        "farmer_id": body.get("farmer_id"),
        "field_id": body.get("field_id"),
    }

    payload = {
        "id": str(uuid.uuid4()),
        "timestamp": int(time.time()),
        "latitude": lat,
        "longitude": lng,
        "metadata": {k: v for k, v in meta.items() if v},
    }

    if AIML_LOCATION_URL:
        result = _http_json(AIML_LOCATION_URL, payload)
        return {"ok": True, "source": "aiml", "payload": payload, "aiml_response": result}

    _FALLBACK_LOCATIONS.append(payload)
    return {
        "ok": True,
        "source": "fallback",
        "payload": payload,
        "message": "Location stored locally. AIML service not configured.",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("MANDI_API_PORT", 5050)))
