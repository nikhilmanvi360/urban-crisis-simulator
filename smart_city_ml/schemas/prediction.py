from pydantic import BaseModel, Field
from typing import List

# ── AQI ────────────────────────────────────────────────────────
class AQIPredictionRequest(BaseModel):
    days: int = Field(..., ge=1, le=365, description="Number of days to forecast")

class AQIForecastPoint(BaseModel):
    date: str
    prediction: float
    lower_bound: float
    upper_bound: float

class AQIPredictionResponse(BaseModel):
    forecast: List[AQIForecastPoint]

# ── WATER ──────────────────────────────────────────────────────
class WaterPredictionRequest(BaseModel):
    days: int = Field(..., ge=1, le=365, description="Number of days to forecast")

class WaterForecastPoint(BaseModel):
    date: str
    prediction: float
    lower_bound: float
    upper_bound: float

class WaterPredictionResponse(BaseModel):
    forecast: List[WaterForecastPoint]

# ── HEALTH ─────────────────────────────────────────────────────
class HealthPredictionRequest(BaseModel):
    aqi: float
    temperature: float
    humidity: float
    population_density: float
    water_quality_index: float

class HealthPredictionResponse(BaseModel):
    risk_level: str

# ── FOREST ─────────────────────────────────────────────────────
class ForestPredictionRequest(BaseModel):
    rainfall: float
    urban_expansion_rate: float
    previous_forest_area: float

class ForestPredictionResponse(BaseModel):
    predicted_forest_loss: float

# ── TRAFFIC ────────────────────────────────────────────────────
class TrafficPredictionRequest(BaseModel):
    time_of_day: int = Field(..., description="Hour of the day 0-23")
    day_of_week: int = Field(..., description="0=Monday, 6=Sunday")
    vehicle_count: int
    weather: int = Field(..., description="Categorical weather condition code")

class TrafficPredictionResponse(BaseModel):
    traffic_status: str
