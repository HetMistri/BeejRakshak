import os
from dotenv import load_dotenv

load_dotenv()

# -------------------------
# Database
# -------------------------
DB_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://agri_v0hw_user:8qBjxOpifu4vDs8isjAqNNJg4pFpkTWY@dpg-d635ad24d50c73ab0uk0-a.singapore-postgres.render.com/agri_v0hw?sslmode=require",
)
DB_SSLMODE = os.getenv("DB_SSLMODE", "require")

# -------------------------
# SAR parameters
# -------------------------
SAR_LOOKBACK_DAYS = int(os.getenv("SAR_LOOKBACK_DAYS", 90))
SAR_SCALE_METERS = int(os.getenv("SAR_SCALE_METERS", 10))
MOISTURE_DELTA_THRESHOLD = float(
    os.getenv("MOISTURE_DELTA_THRESHOLD", 1.5)
)

# -------------------------
# GEE
# -------------------------
ENABLE_GEE = os.getenv("ENABLE_GEE", "false").lower() == "true"

# -------------------------
# Runtime
# -------------------------
ENV = os.getenv("ENV", "dev")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")