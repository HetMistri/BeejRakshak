import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Configure Paths so sub-modules can be imported
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))
sys.path.append(str(BASE_DIR / "mandi_intelligence"))
sys.path.append(str(BASE_DIR / "scrapbot" / "src"))

# Clean up potential duplicate imports or conflicts if necessary
# (Optional, but good practice if modules have same names)

# Import the sub-applications
# Note: We import them AFTER modifying sys.path
from mandi_intelligence.api.main import app as mandi_app
from mandi_intelligence.api.main import (
    list_mandis as mandi_list_mandis,
    get_response as mandi_get_response,
    submit_response as mandi_submit_response,
    health_check as mandi_health_check,
    RecommendRequest,
    RespondRequest,
)
from scrapbot.src.main import app as scrapbot_app

# Create the Master App
app = FastAPI(
    title="BeejRakshak Unified API",
    description="Unified API for Mandi Intelligence and Government Scheme Assistance",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://beej-rakshak.vercel.app",
        "http://localhost:3000",
        "http://localhost:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the sub-applications
app.mount("/mandi", mandi_app)
app.mount("/schemes", scrapbot_app)

@app.on_event("startup")
async def startup_event():
    """Trigger startup events for mounted sub-applications"""
    print("🚀 Starting BeejRakshak Unified API...")
    
    # Manually trigger mandi_app startup
    # FastAPI mounted apps don't auto-run their startup events
    from mandi_intelligence.api.main import startup_event as mandi_startup
    await mandi_startup()
    
    print("✅ All services initialized!")

@app.get("/")
def root():
    return {
        "message": "Welcome to BeejRakshak Unified API",
        "modules": {
            "mandi_intelligence": "/mandi/docs",
            "scheme_assistant": "/schemes/docs"
        },
        "status": "operational"
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/mandis")
async def mandis_root_alias():
    return await mandi_list_mandis()


@app.post("/response")
async def response_root_alias(request: dict):
    return await mandi_get_response(RecommendRequest(**request))


@app.post("/respond")
async def respond_root_alias(request: dict):
    return await mandi_submit_response(RespondRequest(**request))


@app.get("/mandi-health")
async def mandi_health_root_alias():
    return await mandi_health_check()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
