from pathlib import Path
from functools import lru_cache
from datetime import datetime

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field


CURRENT_DIR = Path(__file__).resolve().parent

MODEL_PATH = CURRENT_DIR / "model.joblib"
ROOT_MODEL_PATH = CURRENT_DIR.parent / "model.joblib"

LOCATIONS = {
    "DHA",
    "Gulberg",
    "Bahria Town",
    "Clifton",
    "Johar Town",
    "Model Town",
}


app = FastAPI(
    title="Smart Real Estate Price Estimator",
    version="1.0.0"
)


class PropertyInput(BaseModel):
    location: str
    area_sqft: int = Field(default=2500, ge=100, le=50000)
    bedrooms: int = Field(default=4, ge=1, le=20)
    bathrooms: int = Field(default=3, ge=1, le=20)
    parking: bool = False
    pool: bool = False
    year_built: int = Field(default=2018, ge=1800, le=2026)


def get_model_file():
    """Checks for model.joblib in both api/ directory and root directory."""
    
    if MODEL_PATH.exists():
        return MODEL_PATH

    elif ROOT_MODEL_PATH.exists():
        return ROOT_MODEL_PATH

    return None


@lru_cache(maxsize=1)
def load_model():
    model_file = get_model_file()

    if not model_file:
        raise RuntimeError(
            "Model file (model.joblib) missing. "
            "Please ensure model.joblib is pushed inside the api/ directory."
        )

    return joblib.load(model_file)


@app.get("/api/health")
def health():
    model_file = get_model_file()

    return {
        "status": "ok",
        "model_exists": model_file is not None,
        "model_path": str(model_file) if model_file else None
    }


@app.post("/api/predict")
def predict_property(prop: PropertyInput):

    if prop.location not in LOCATIONS:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Unsupported location '{prop.location}'. "
                f"Allowed: {', '.join(LOCATIONS)}"
            )
        )

    row = pd.DataFrame([{
        "location": prop.location,
        "area_sqft": prop.area_sqft,
        "bedrooms": prop.bedrooms,
        "bathrooms": prop.bathrooms,
        "parking": int(prop.parking),
        "pool": int(prop.pool),
        "year_built": prop.year_built,
    }])

    try:
        model = load_model()

        prediction = max(
            0,
            float(model.predict(row)[0])
        )

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Prediction error: {str(exc)}"
        ) from exc

    rates = [
        0.925,
        0.941,
        0.948,
        0.956,
        0.969,
        0.976,
        0.982,
        0.991,
        0.987,
        1.0,
        1.008,
        1.015
    ]

    now = datetime.now()

    trend = []

    for i, rate in enumerate(rates):

        month_number = now.month - (11 - i)
        year = now.year

        while month_number <= 0:
            month_number += 12
            year -= 1

        trend.append({
            "month": datetime(
                year,
                month_number,
                1
            ).strftime("%b %Y"),

            "price": round(
                prediction * rate
            ),
        })

    return {
        "estimated_price": round(prediction),
        "currency": "PKR",
        "location": prop.location,
        "trend": trend,
        "disclaimer": (
            "Synthetic-model estimate; trend is illustrative, "
            "not actual market data."
        )
    }