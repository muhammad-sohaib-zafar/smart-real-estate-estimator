# EstateIQ — Smart Real Estate Price Estimator

A demo real-estate valuation project using FastAPI, scikit-learn, React, Tailwind CSS, and Chart.js.

> **Important:** The training data and trend chart are synthetic/illustrative. This is a portfolio demo, not a real property appraisal.

## Requirements
- Python 3.11 or 3.12
- Node.js LTS and npm

## Run locally

### 1. Install Python dependencies and train the model
From this project folder:

**Windows PowerShell**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python train_model.py
```

If PowerShell blocks activation, use Command Prompt:
```bat
.venv\Scripts\activate.bat
```

### 2. Start the API
In the project root:
```bash
python -m uvicorn api.index:app --reload --port 8000
```
API docs: http://127.0.0.1:8000/docs

### 3. Start the frontend
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the URL Vite prints, usually http://localhost:5173.

## Deploy
Push this folder to GitHub and import the repository into Vercel. This repository includes a Vercel configuration, but verify that your Vercel build serves both the Vite output and the Python function. Test `/api/health` and `/api/predict` after deployment. If the custom Vite/Python combination is not detected correctly by your Vercel project configuration, deploy the FastAPI API as a separate service and set a frontend API URL.

## API
`POST /api/predict`
```json
{
  "location": "DHA",
  "area_sqft": 2500,
  "bedrooms": 4,
  "bathrooms": 3,
  "parking": true,
  "pool": false,
  "year_built": 2018
}
```
