# BeejRakshak Unified

This repository contains the unified codebase for **Mandi Intelligence** and **ScraperBot**, offering a comprehensive solution for agricultural market insights and government scheme information.

## Modules

### 1. Mandi Intelligence
Located in `mandi_intelligence/`.
Core features:
- **Price Prediction**: ML-based forecasting of crop prices.
- **Arbitrage Engine**: Calculates true net profit by factoring in transportation costs.
- **Market Recommendations**: Suggests the best Mandi for farmers to sell their produce.

### 2. ScraperBot (Scheme Assistant)
Located in `scrapbot/`.
Core features:
- **Scheme Scraping**: Extracts government schemes from official sources.
- **Eligibility Matching**: Matches farmers with eligible schemes.
- **Claim Generation**: Generates PDF claim forms for schemes.

## Installation

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Running Mandi Intelligence API
Navigate to `mandi_intelligence` and run the FastAPI server:
```bash
cd mandi_intelligence
uvicorn api.main:app --reload
```

### Running ScraperBot
Navigate to `scrapbot/src` and run the application:
```bash
cd scrapbot/src
python main.py
```
