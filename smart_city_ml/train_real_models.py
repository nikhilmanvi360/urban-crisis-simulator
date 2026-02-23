import os
import pandas as pd
import numpy as np
import joblib
from prophet import Prophet
from xgboost import XGBClassifier, XGBRegressor

# 1. Generate Wide Dataset
print("Generating new wide training dataset...")
np.random.seed(42)
days = 2000
dates = pd.date_range(start='2018-01-01', periods=days)

# Background trends
annual_temp_cycle = np.sin(np.linspace(0, 2 * np.pi * (days/365.25), days)) * 10 + 25
long_term_deforestation = np.linspace(100, 115, days) # +15% over time
population_growth = np.linspace(1000, 1200, days)

# Core features
base_aqi = 100 + (population_growth / 20) + np.random.normal(0, 15, days)
base_water = 80 - (population_growth / 50) + np.random.normal(0, 5, days)

# Introduce correlation
traffic_density = base_aqi * 1.5 + np.random.normal(0, 20, days)
industrial_emission = base_aqi * 0.8 + np.random.normal(0, 10, days)
respiratory_cases = (base_aqi * 0.3) + np.random.normal(0, 5, days)
water_stress_index = 100 - base_water + (annual_temp_cycle * 0.5)

df = pd.DataFrame({
    'date': dates,
    'aqi': np.clip(base_aqi, 0, 500),
    'water_quality': np.clip(base_water, 0, 100),
    'temperature': annual_temp_cycle,
    'humidity': np.random.uniform(30, 90, days),
    'population_density': population_growth,
    'traffic_density': np.clip(traffic_density, 0, 1000),
    'industrial_emission': np.clip(industrial_emission, 0, 500),
    'respiratory_cases': np.clip(respiratory_cases, 0, 200),
    'water_stress_index': np.clip(water_stress_index, 0, 100),
    'rainfall': np.random.gamma(2, 2, days),
    'urban_expansion_rate': np.random.uniform(0.1, 2.5, days),
    'forest_cover_ha': long_term_deforestation * 1000, # Mock scaling
    'day_of_week': dates.dayofweek,
})

# Add derived labels/targets for classification
df['health_risk_label'] = np.random.randint(0, 4, days) # 0: LOW, 1: MODERATE, 2: HIGH, 3: CRITICAL
df['traffic_status_label'] = np.random.randint(0, 3, days) # 0: CLEAR, 1: MODERATE, 2: CONGESTED

os.makedirs('data', exist_ok=True)
df.to_csv('data/wide_training_data.csv', index=False)
print("Saved data/wide_training_data.csv")

# 2. Train Models
os.makedirs("models", exist_ok=True)

print("Training AQI Prophet model...")
df_aqi = df[['date', 'aqi']].rename(columns={'date': 'ds', 'aqi': 'y'})
aqi_model = Prophet(yearly_seasonality=True, weekly_seasonality=True)
aqi_model.fit(df_aqi)
joblib.dump(aqi_model, "models/aqi.pkl")

print("Training Water Prophet model...")
df_water = df[['date', 'water_quality']].rename(columns={'date': 'ds', 'water_quality': 'y'})
water_model = Prophet(yearly_seasonality=True)
water_model.fit(df_water)
joblib.dump(water_model, "models/water.pkl")

print("Training Health XGBoost classifier...")
# Matching HealthPredictionRequest: aqi, temperature, humidity, population_density, water_quality_index
X_health = df[['aqi', 'temperature', 'humidity', 'population_density', 'water_quality']]
y_health = df['health_risk_label']
health_model = XGBClassifier(eval_metric='mlogloss')
health_model.fit(X_health, y_health)
joblib.dump(health_model, "models/health.pkl")

print("Training Forest XGBoost regressor...")
# Matching ForestPredictionRequest: rainfall, urban_expansion_rate, previous_forest_area
X_forest = df[['rainfall', 'urban_expansion_rate', 'forest_cover_ha']].shift(1).dropna()
y_forest = df['forest_cover_ha'].iloc[1:]
forest_model = XGBRegressor()
forest_model.fit(X_forest, y_forest)
joblib.dump(forest_model, "models/forest.pkl")

print("Training Traffic XGBoost classifier...")
# Matching TrafficPredictionRequest: time_of_day (mocked as constant hour for demo), day_of_week, vehicle_count (traffic_density), weather (temp)
# Note: In a real app we'd have hour-level data, but for this daily dataset we'll mock hour = 12
df['time_of_day'] = 12 
X_traffic = df[['time_of_day', 'day_of_week', 'traffic_density', 'temperature']]
y_traffic = df['traffic_status_label']
traffic_model = XGBClassifier(eval_metric='mlogloss')
traffic_model.fit(X_traffic, y_traffic)
joblib.dump(traffic_model, "models/traffic.pkl")

print("Successfully built and saved all 5 models based on wide dataset!")
