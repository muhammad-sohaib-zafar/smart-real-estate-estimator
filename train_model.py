from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "api" / "model.joblib"
LOCATIONS = {
    "DHA": 1.65, "Gulberg": 1.45, "Bahria Town": 1.30,
    "Clifton": 1.55, "Johar Town": 1.10, "Model Town": 1.20,
}
FEATURES = [
    "location", "area_sqft", "bedrooms", "bathrooms",
    "parking", "pool", "year_built",
]

def generate_dataset(n=5000, seed=42):
    rng = np.random.default_rng(seed)
    locations = rng.choice(list(LOCATIONS), size=n)
    area = rng.integers(500, 6001, size=n)
    bedrooms = np.clip(np.round(area / 650 + rng.normal(1, .8, n)), 1, 8).astype(int)
    bathrooms = np.clip(bedrooms + rng.integers(-1, 2, size=n), 1, 8)
    parking = rng.binomial(1, .65, n)
    pool = rng.binomial(1, .15, n)
    year_built = rng.integers(1980, 2027, size=n)
    age = 2026 - year_built
    multiplier = np.array([LOCATIONS[x] for x in locations])
    price = (
        area * 45000 * multiplier
        * (1 + .08 * (bedrooms - 2))
        * (1 + .035 * (bathrooms - 2))
        * (1 + .08 * parking)
        * (1 + .12 * pool)
        * np.maximum(.65, 1 - age * .003)
    )
    price = np.maximum(price * rng.normal(1, .09, n), 1_000_000)
    return pd.DataFrame({
        "location": locations, "area_sqft": area, "bedrooms": bedrooms,
        "bathrooms": bathrooms, "parking": parking, "pool": pool,
        "year_built": year_built, "price": price.round(0),
    })

def main():
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    df = generate_dataset()
    X_train, X_test, y_train, y_test = train_test_split(
        df[FEATURES], df["price"], test_size=.2, random_state=42
    )
    preprocessor = ColumnTransformer([
        ("location", OneHotEncoder(handle_unknown="ignore"), ["location"]),
        ("numeric", "passthrough", [c for c in FEATURES if c != "location"]),
    ])
    model = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", RandomForestRegressor(
            n_estimators=120, max_depth=18, min_samples_leaf=2,
            n_jobs=-1, random_state=42
        )),
    ])
    model.fit(X_train, y_train)
    pred = model.predict(X_test)
    print(f"MAE: PKR {mean_absolute_error(y_test, pred):,.0f}")
    print(f"R²: {r2_score(y_test, pred):.3f}")
    joblib.dump(model, MODEL_PATH, compress=3)
    print(f"Saved model: {MODEL_PATH}")

if __name__ == "__main__":
    main()
