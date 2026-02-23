const { predictAQI, predictWater, predictHealth } = require('../services/mlServiceClient');

/**
 * Forecast Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages ML integration via an adapter pattern:
 *
 *   ML_ENABLED=false  →  mockForecast()    (7-day trend extrapolation, demo mode)
 *   ML_ENABLED=true   →  callMLService()   (real ML microservice with ARIMAX + crisis)
 *
 * Both paths return the SAME base response shape so the rest of the API
 * is ML-agnostic. When ML is active, extra fields are included:
 *   crisis_probability, crisis_status, uncertainty
 *
 * Base response shape:
 * {
 *   aqi_forecast:          number[7],
 *   water_stress_forecast: number[7],
 *   confidence_bands: {
 *     aqi:   { lower: number[7], upper: number[7] },
 *     water: { lower: number[7], upper: number[7] }
 *   },
 *   mode: "mock" | "ml_service",
 *   crisis_probability?: number,      // ML only
 *   crisis_status?: string,           // ML only
 *   uncertainty?: object,             // ML only
 * }
 */

const DEFAULT_FORECAST_DAYS = parseInt(process.env.FORECAST_DAYS || '7', 10);
const MARGIN = parseFloat(process.env.CONFIDENCE_MARGIN || '0.15');

/**
 * Transform the multi-model responses into the standard forecast shape acceptable by the frontend.
 * Stitches together Prophet time-series data with XGBoost Health labels to simulate the old API response.
 */
const transformNewMLResponse = (aqiResult, waterResult, healthResult) => {
    const aqi_forecast = aqiResult.forecast.map(f => f.prediction);
    const aqi_lower = aqiResult.forecast.map(f => f.lower_bound);
    const aqi_upper = aqiResult.forecast.map(f => f.upper_bound);

    const water_forecast = waterResult.forecast.map(f => f.prediction);
    const water_lower = waterResult.forecast.map(f => f.lower_bound);
    const water_upper = waterResult.forecast.map(f => f.upper_bound);

    let prob = 0.2;
    if (healthResult?.risk_level === 'CRITICAL') prob = 0.95;
    if (healthResult?.risk_level === 'HIGH') prob = 0.75;
    if (healthResult?.risk_level === 'MODERATE') prob = 0.45;

    // Contest Required Outputs Generation
    const maxAqi = Math.max(...aqi_forecast);
    const maxWater = Math.max(...water_forecast);

    // Time-to-Impact Estimate (days until threshold breached)
    let timeToImpact = 'No immediate crisis detected';
    const criticalDayAqi = aqi_forecast.findIndex(val => val > 300);
    const criticalDayWater = water_forecast.findIndex(val => val > 80);

    if (criticalDayAqi !== -1 && criticalDayWater !== -1) {
        timeToImpact = `${Math.min(criticalDayAqi, criticalDayWater)} days (Dual Crisis)`;
    } else if (criticalDayAqi !== -1) {
        timeToImpact = `${criticalDayAqi} days (Severe Smog)`;
    } else if (criticalDayWater !== -1) {
        timeToImpact = `${criticalDayWater} days (Water Shortage)`;
    } else if (prob > 0.5) {
        timeToImpact = `Elevated risk within ${Math.floor(aqi_forecast.length / 2)} days`;
    }

    // Affected Zone Forecast (simulated spatial output based on risk)
    const allZones = ['Industrial Zone North', 'Downtown Core', 'Residential Ring East', 'Waterfront District', 'Tech Park South'];
    let affectedZones = [];
    if (maxAqi > 250) affectedZones.push('Industrial Zone North', 'Downtown Core');
    if (maxWater > 70) affectedZones.push('Residential Ring East', 'Waterfront District');
    if (prob > 0.8) affectedZones.push('Tech Park South');
    if (affectedZones.length === 0) affectedZones = ['Routine Monitoring Across All Zones'];

    // Recommended Policy Actions (Dynamic Rule-Based Engine)
    const policies = [];

    // AQI Based Triggers
    if (maxAqi > 350) {
        policies.push('Declare Public Health Emergency: Total Industrial Halt', 'Emergency Green-Zone Oxygen Hubs deployment');
    } else if (maxAqi > 200) {
        policies.push('Enact Stage 2 Vehicle Rationing', 'Halt non-essential construction');
    } else if (maxAqi > 120) {
        policies.push('Optimize traffic flow via AI-grid signaling', 'Public advisory: N95/FFP2 mask usage');
    }

    // Water Based Triggers
    if (maxWater > 85) {
        policies.push('Category A Water Rationing (Essential services only)', 'Mandatory IoT leak-detection sweep');
    } else if (maxWater > 60) {
        policies.push('Divert emergency reservoir allocations', 'Issue boil-water advisories');
    } else if (maxWater > 40) {
        policies.push('Automated irrigation suspension for public parks', 'Industrial greywater recycle mandate');
    }

    // Health / Probability Based Triggers
    if (prob > 0.85) {
        policies.push('Pre-emptive hospital surge-capacity activation', 'Aloft-drone cooling in dense thermal hotspots');
    } else if (prob > 0.6) {
        policies.push('Deploy mobile health clinics to high-risk zones', 'Senior citizen wellness checks automated via VitalsAPI');
    }

    if (policies.length === 0) {
        policies.push('Maintain standard environmental protocols', 'Ongoing background sensor validation');
    }

    return {
        aqi_forecast,
        water_stress_forecast: water_forecast,
        confidence_bands: {
            aqi: { lower: aqi_lower, upper: aqi_upper },
            water: { lower: water_lower, upper: water_upper },
        },
        mode: 'ml_service',
        note: 'Powered by 5 dedicated modular ML models (Prophet/XGBoost).',
        crisis_probability: prob,
        crisis_status: healthResult?.risk_level || 'UNKNOWN',
        time_to_impact_days: timeToImpact,
        affected_zones: [...new Set(affectedZones)],
        recommended_policies: policies,
    };
};

/**
 * Simple deterministic water stress forecast (used as fallback).
 */
const mockWaterForecast = (historicalData, days = DEFAULT_FORECAST_DAYS) => {
    const waterSeries = historicalData.map((d) => 100 - d.water_quality);
    const n = waterSeries.length;
    const slope = n >= 2 ? (waterSeries[n - 1] - waterSeries[0]) / (n - 1) : 0;
    const lastWater = waterSeries[n - 1] || 50;
    const noise = (i, scale) => Math.sin(i * 1.7 + 0.5) * scale;

    const forecast = [];
    const lower = [];
    const upper = [];

    for (let i = 1; i <= days; i++) {
        const pred = Math.min(Math.max(lastWater + slope * i + noise(i, 3), 0), 100);
        const margin = pred * MARGIN * (1 + i * 0.05);
        forecast.push(parseFloat(pred.toFixed(2)));
        lower.push(parseFloat(Math.max(pred - margin, 0).toFixed(2)));
        upper.push(parseFloat(Math.min(pred + margin, 100).toFixed(2)));
    }

    return { forecast, bands: { lower, upper } };
};

/**
 * Gaussian-noise mock forecast (full demo mode — no ML).
 */
const mockForecast = (historicalData, days = DEFAULT_FORECAST_DAYS) => {
    const n = historicalData.length;

    const computeSlope = (series) => {
        if (series.length < 2) return 0;
        return (series[series.length - 1] - series[0]) / (series.length - 1);
    };

    const noise = (i, scale) => Math.sin(i * 1.7 + 0.5) * scale;

    const aqiSeries = historicalData.map((d) => d.aqi);
    const waterSeries = historicalData.map((d) => 100 - d.water_quality);

    const aqiSlope = computeSlope(aqiSeries);
    const waterSlope = computeSlope(waterSeries);
    const lastAqi = aqiSeries[n - 1];
    const lastWater = waterSeries[n - 1];

    const aqi_forecast = [];
    const water_stress_forecast = [];
    const aqi_lower = [], aqi_upper = [];
    const water_lower = [], water_upper = [];

    for (let i = 1; i <= days; i++) {
        const aqiPred = Math.min(Math.max(lastAqi + aqiSlope * i + noise(i, 8), 0), 500);
        const waterPred = Math.min(Math.max(lastWater + waterSlope * i + noise(i, 3), 0), 100);

        aqi_forecast.push(parseFloat(aqiPred.toFixed(2)));
        water_stress_forecast.push(parseFloat(waterPred.toFixed(2)));

        const aqiMargin = aqiPred * MARGIN * (1 + i * 0.05);
        const waterMargin = waterPred * MARGIN * (1 + i * 0.05);

        aqi_lower.push(parseFloat(Math.max(aqiPred - aqiMargin, 0).toFixed(2)));
        aqi_upper.push(parseFloat(Math.min(aqiPred + aqiMargin, 500).toFixed(2)));
        water_lower.push(parseFloat(Math.max(waterPred - waterMargin, 0).toFixed(2)));
        water_upper.push(parseFloat(Math.min(waterPred + waterMargin, 100).toFixed(2)));
    }

    // Fallback Mock output for Contest Requirements
    const maxAqi = Math.max(...aqi_forecast);
    const maxWater = Math.max(...water_stress_forecast);
    const prob = (maxAqi / 500) * 0.5 + (maxWater / 100) * 0.5;

    return {
        aqi_forecast,
        water_stress_forecast,
        confidence_bands: {
            aqi: { lower: aqi_lower, upper: aqi_upper },
            water: { lower: water_lower, upper: water_upper },
        },
        mode: 'mock',
        note: 'Set ML_ENABLED=true in .env to switch to real ML microservice.',
        crisis_probability: prob,
        time_to_impact_days: maxAqi > 250 ? `${Math.floor(days / 2)} days (Est.)` : 'No immediate crisis',
        affected_zones: maxAqi > 200 ? ['Industrial Zone North', 'Downtown Core'] : ['Routine Monitoring'],
        recommended_policies: maxAqi > 250
            ? ['Mandatory Remote Work (IT/Admin sectors)', 'High-Capacity Air Purifier Installations', 'Halt Heavy Logistics']
            : maxAqi > 150
                ? ['Voluntary traffic reduction', 'Industrial monitoring', 'City-wide sensor recalibration']
                : ['Maintain current protocols', 'Bi-weekly environmental audit'],
    };
};

const generateForecast = async (historicalData, days = DEFAULT_FORECAST_DAYS) => {
    const mlEnabled = process.env.ML_ENABLED === 'true';

    if (mlEnabled) {
        const latest = historicalData[historicalData.length - 1] || {};

        const [aqiResult, waterResult, healthResult] = await Promise.all([
            predictAQI({ days }),
            predictWater({ days }),
            predictHealth({
                aqi: latest.aqi || 100,
                temperature: latest.temperature || 30.0,
                humidity: 60.0,
                population_density: 5000.0,
                water_quality_index: latest.water_quality || 50.0
            })
        ]);

        if (aqiResult && waterResult && healthResult) {
            return transformNewMLResponse(aqiResult, waterResult, healthResult);
        }

        console.warn('Falling back to mock forecast due to partial model service failure.');
    }

    return mockForecast(historicalData, days);
};

module.exports = { generateForecast, mockForecast };
