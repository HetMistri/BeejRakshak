from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Dict, Any

# Import our modules
from .claim_generator import generate_insurance_claim
from .scheme_matcher import get_recommended_schemes
from .scheme_scraper import scrape_schemes 
import os
from pathlib import Path

app = FastAPI(title="Krishi-Sahayak API")

# Path setup
BASE_DIR = Path(__file__).resolve().parent.parent # BeejRakshak_Unified/scrapbot
STATIC_DIR = BASE_DIR / "static"
DB_PATH = BASE_DIR / "src" / "schemes_db.json"

# Mount 'static' folder so PDFs are accessible via URL
if not STATIC_DIR.exists():
    STATIC_DIR.mkdir(parents=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# --- Models ---
class ClaimRequest(BaseModel):
    farmer: Dict[str, Any]
    crop: Dict[str, Any]
    incident: Dict[str, Any]

class SchemeRequest(BaseModel):
    state: str
    land_size_hectares: float
    category: str # 'small_farmer', 'large_farmer'

# --- Endpoints ---

@app.on_event("startup")
async def startup_event():
    # Run scraper on startup to ensure DB exists
    if not DB_PATH.exists():
        scrape_schemes()

@app.post("/api/v1/claims/generate")
async def create_claim(request: ClaimRequest):
    try:
        # Simple Logic: If rain > 100mm, it's a valid claim
        rain_mm = request.incident.get('detected_rainfall_mm', 0)
        loss_percent = "85%" if rain_mm > 100 else "10%"
        
        damage_report = {
            "type": request.incident.get('type', 'Unknown'),
            "date": request.incident.get('timestamp', 'Today'),
            "loss_percentage": loss_percent,
            "rainfall_mm": rain_mm
        }

        # Generate PDF
        pdf_path = generate_insurance_claim(request.farmer, request.crop, damage_report)
        
        return {
            "status": "success",
            "ai_assessment": {
                "risk_level": "CRITICAL" if rain_mm > 100 else "LOW",
                "loss_percentage": loss_percent
            },
            "pdf_url": f"http://localhost:8000/{pdf_path}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/schemes/recommend")
async def recommend_schemes(request: SchemeRequest):
    profile = {
        "state": request.state,
        "category": request.category
    }
    
    matches = get_recommended_schemes(profile)
    
    return {
        "status": "success",
        "farmer_profile": profile,
        "count": len(matches),
        "schemes": matches
    }