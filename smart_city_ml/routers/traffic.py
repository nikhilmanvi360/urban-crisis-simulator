from fastapi import APIRouter, HTTPException, Depends
import pandas as pd
from schemas.prediction import TrafficPredictionRequest, TrafficPredictionResponse
from services.model_loader import get_registry, ModelRegistry

router = APIRouter(prefix="/predict", tags=["Traffic Pipeline"])

@router.post("/traffic", response_model=TrafficPredictionResponse)
async def predict_traffic(request: TrafficPredictionRequest, registry: ModelRegistry = Depends(get_registry)):
    """
    Predict traffic congestion status using XGBoost/RandomForest classifier.
    """
    model = registry.traffic_model
    
    if model is None:
        # Mock logic
        status = "NORMAL"
        if request.vehicle_count > 1000 or request.weather > 2:
            status = "CONGESTED"
        elif request.vehicle_count < 200:
            status = "CLEAR"
        return TrafficPredictionResponse(traffic_status=status)

    try:
        features = pd.DataFrame([{
            "time_of_day": request.time_of_day,
            "day_of_week": request.day_of_week,
            "vehicle_count": request.vehicle_count,
            "weather": request.weather
        }])
        
        prediction = model.predict(features)[0]
        
        # Assume status string or ints that map to labels
        status_map = {0: "CLEAR", 1: "NORMAL", 2: "CONGESTED", 3: "GRIDLOCK"}
        status_level = status_map.get(prediction, str(prediction)) if isinstance(prediction, (int, float)) else str(prediction)
        
        return TrafficPredictionResponse(traffic_status=status_level)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Traffic prediction failed: {str(e)}")
