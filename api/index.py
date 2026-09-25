from pathlib import Path
from functools import lru_cache
from datetime import datetime
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, ConfigDict

MODEL_PATH = Path(__file__).resolve().parent / "model.joblib"
LOCATIONS = {"DHA", "Gulberg", "Bahria Town", "Clifton", "Johar Town", "Model Town"}
app = FastAPI(title="Smart Real Estate Price Estimator", version="1.0.0")

class PropertyInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    location: str
    area_sqft: int = Field(ge=100, le=50000)
    bedrooms: int = Field(ge=1, le=20)
    bathrooms: int = Field(ge=1, le=20)
    parking: bool = False
    pool: bool = False
    year_built: int = Field(ge=1800, le=2026)

@lru_cache(maxsize=1)
def load_model():
    if not MODEL_PATH.exists():
        raise RuntimeError("Model missing. Run `python train_model.py` first.")
    return joblib.load(MODEL_PATH)

@app.get("/api/health")
def health():
    return {"status": "ok", "model_exists": MODEL_PATH.exists()}

@app.post("/api/predict")
def predict_property(prop: PropertyInput):
    if prop.location not in LOCATIONS:
        raise HTTPException(status_code=422, detail="Unsupported location.")
    row = pd.DataFrame([{
        "location": prop.location, "area_sqft": prop.area_sqft,
        "bedrooms": prop.bedrooms, "bathrooms": prop.bathrooms,
        "parking": int(prop.parking), "pool": int(prop.pool),
        "year_built": prop.year_built,
    }])
    try:
        prediction = max(0, float(load_model().predict(row)[0]))
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    # Illustrative values only; not historical market transaction data.
    rates = [.925, .941, .948, .956, .969, .976, .982, .991, .987, 1.0, 1.008, 1.015]
    now = datetime.now()
    trend = []
    for i, rate in enumerate(rates):
        month_number = now.month - (11 - i)
        year = now.year
        while month_number <= 0:
            month_number += 12
            year -= 1
        trend.append({
            "month": datetime(year, month_number, 1).strftime("%b %Y"),
            "price": round(prediction * rate),
        })
    return {
        "estimated_price": round(prediction), "currency": "PKR",
        "location": prop.location, "trend": trend,
        "disclaimer": "Synthetic-model estimate; trend is illustrative, not actual market data."
    }
