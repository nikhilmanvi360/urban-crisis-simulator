from fastapi import APIRouter, HTTPException, Depends
import pandas as pd
from schemas.prediction import ForestPredictionRequest, ForestPredictionResponse
from services.model_loader import get_registry, ModelRegistry

router = APIRouter(prefix="/predict", tags=["Forest Pipeline"])

@router.post("/forest", response_model=ForestPredictionResponse)
async def predict_forest(request: ForestPredictionRequest, registry: ModelRegistry = Depends(get_registry)):
    """
    Predict forest area loss using XGBoost regressor.
    """
    model = registry.forest_model
    
    if model is None:
        # Mock logic
        loss = request.previous_forest_area * (request.urban_expansion_rate / 100.0)
        return ForestPredictionResponse(predicted_forest_loss=round(loss, 2))

    try:
        features = pd.DataFrame([{
            "rainfall": request.rainfall,
            "urban_expansion_rate": request.urban_expansion_rate,
            "previous_forest_area": request.previous_forest_area
        }])
        
        prediction = model.predict(features)[0]
        
        # Ensure non-negative loss
        predicted_loss = max(0.0, float(prediction))
        
        return ForestPredictionResponse(predicted_forest_loss=round(predicted_loss, 2))
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forest loss prediction failed: {str(e)}")
