const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

/**
 * Swagger / OpenAPI 3.0 Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * Interactive API docs available at: GET /docs
 */
const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'CitySentinel AI – Simulation Engine',
            version: '1.0.0',
            description: `
## 🏙️ CitySentinel AI – Crisis Modeling REST API

**Domain:** Smart Cities & Climate Resilience  
**Purpose:** Aggregates environmental data, runs cascading crisis simulations, computes risk probability, and generates policy recommendations.

### Key Features
- 🔴 Real-time crisis probability scoring (0–1 scale)
- 🌊 Cascading risk propagation across AQI, Water, Health, Traffic systems  
- 🗺️ Per-zone affected area forecast (5 city zones)
- 📈 7-day AQI + water stress forecast with confidence bands
- 🤖 ML adapter ready — flip \`ML_ENABLED=true\` to connect real ML service
- 📡 WebSocket real-time alerts on new data ingestion

### ML Integration
Set \`ML_ENABLED=true\` in \`.env\` to connect the forecast engine to a real ML microservice.
When \`ML_ENABLED=false\`, the engine uses deterministic trend extrapolation (demo mode).
      `,
            contact: {
                name: 'CitySentinel Team',
            },
        },
        servers: [
            { url: 'http://localhost:5000', description: 'Local Development' },
        ],
        tags: [
            { name: 'Core', description: 'Core crisis metrics and status' },
            { name: 'Simulation', description: 'Policy scenario simulation' },
            { name: 'Forecast', description: '7-day AQI + water forecast' },
            { name: 'Recommendations', description: 'Ranked policy interventions' },
            { name: 'Zones', description: 'Per-zone affected area forecast' },
            { name: 'Data', description: 'Environmental data ingestion & history' },
        ],
        components: {
            schemas: {
                CrisisMetrics: {
                    type: 'object',
                    properties: {
                        risk_score: { type: 'number', minimum: 0, maximum: 1, example: 0.851 },
                        crisis_level: { type: 'string', enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'], example: 'CRITICAL' },
                        confidence_interval: {
                            type: 'object',
                            properties: {
                                lower: { type: 'number', example: 0.7234 },
                                upper: { type: 'number', example: 0.9787 },
                            },
                        },
                        cascade_effects: {
                            type: 'object',
                            properties: {
                                aqi_risk: { type: 'number', example: 1.0 },
                                water_risk: { type: 'number', example: 1.0 },
                                health_risk: { type: 'number', example: 0.7 },
                                traffic_risk: { type: 'number', example: 0.704 },
                            },
                        },
                        triggered_systems: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['AIR_QUALITY', 'WATER_SUPPLY', 'PUBLIC_HEALTH'],
                        },
                        time_to_impact: { type: 'number', example: 0 },
                    },
                },
                PolicyInput: {
                    type: 'object',
                    properties: {
                        trafficReduction: { type: 'number', minimum: 0, maximum: 100, example: 20 },
                        industrialCut: { type: 'number', minimum: 0, maximum: 100, example: 15 },
                        heatwaveLevel: { type: 'number', minimum: 0, maximum: 5, example: 2 },
                    },
                },
                EnvironmentalInput: {
                    type: 'object',
                    required: ['aqi', 'traffic', 'water_quality', 'industry_emission'],
                    properties: {
                        aqi: { type: 'number', minimum: 0, maximum: 500, example: 218 },
                        traffic: { type: 'number', minimum: 0, maximum: 100, example: 88 },
                        water_quality: { type: 'number', minimum: 0, maximum: 100, example: 30 },
                        industry_emission: { type: 'number', minimum: 0, maximum: 100, example: 88 },
                        date: { type: 'string', format: 'date-time', example: '2026-02-23T00:00:00Z' },
                        source: { type: 'string', enum: ['api', 'sensor', 'manual'], example: 'api' },
                    },
                },
            },
        },
    },
    // Explicit file list avoids Windows glob path issues
    apis: [
        path.join(__dirname, '../routes/status.js').replace(/\\/g, '/'),
        path.join(__dirname, '../routes/simulate.js').replace(/\\/g, '/'),
        path.join(__dirname, '../routes/forecast.js').replace(/\\/g, '/'),
        path.join(__dirname, '../routes/recommendations.js').replace(/\\/g, '/'),
        path.join(__dirname, '../routes/zones.js').replace(/\\/g, '/'),
        path.join(__dirname, '../routes/data.js').replace(/\\/g, '/'),
        path.join(__dirname, '../routes/history.js').replace(/\\/g, '/'),
    ],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
