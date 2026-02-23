# 📘 BACKEND PRD
## Product Name: CitySentinel AI – Simulation Engine

**Type:** REST API + Crisis Modeling Engine  
**Domain:** Smart Cities & Climate Resilience  
**Stack:** Node.js · Express · MongoDB Atlas · WebSocket  
**Status:** ✅ Implemented & Verified (Feb 23 2026)

---

## 1️⃣ Purpose

The backend is the **core intelligence engine** of CitySentinel AI. It:

- Aggregates real-time and historical environmental data
- Executes cascading crisis simulations across interconnected urban systems
- Computes per-system and per-zone crisis probability
- Generates ranked, efficiency-weighted policy recommendations
- Quantifies prediction uncertainty via confidence intervals
- Broadcasts real-time alerts via WebSocket
- Serves an interactive Swagger API explorer

---

## 2️⃣ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Layer (Express)                      │
│  /status  /simulate  /forecast  /recommendations  /zones        │
│  /data    /history   /docs      WebSocket (ws://)               │
├──────────────┬────────────────┬───────────────┬─────────────────┤
│ Cascade      │ Simulation     │ Forecast      │ Recommendation  │
│ Engine       │ Engine         │ Engine        │ Engine          │
│ (graph)      │ (policy apply) │ (ML adapter)  │ (rank algos)    │
├──────────────┴───────┬────────┴───────────────┴─────────────────┤
│    Zone Engine       │    Data Processor                        │
│   (5 city zones)     │   (normalize + validate)                 │
├──────────────────────┴──────────────────────────────────────────┤
│                  MongoDB Atlas (cloud)                           │
│      environmental_data  ·  simulations                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3️⃣ Core Engine Modules

### Module 1 · Data Processor (`engine/dataProcessor.js`)

**Inputs:** AQI · Traffic density · Water quality · Industrial emissions

| Field | Scale | Risk Direction |
|-------|-------|---------------|
| `aqi` | 0–500 | Higher = more risk |
| `traffic` | 0–100% | Higher = more risk |
| `water_quality` | 0–100 | **Inverted** (lower = more risk) |
| `industry_emission` | 0–100 | Higher = more risk |

**Tasks:** Normalize all inputs → 0–1 · Validate ranges · Return flagged errors

---

### Module 2 · Cascade Engine (`engine/cascadeEngine.js`)

Implements a **weighted dependency graph**:

```
Traffic  ──(0.40)──► AQI Risk
Industry ──(0.50)──► AQI Risk
Industry ──(0.60)──► Water Risk
AQI + Heatwave ──(0.70 + 0.30)──► Health Risk
Traffic  ──(0.80)──► Traffic Risk
```

**Formula:** `Risk_total = Σ(weight × normalized_value) / 4`  
**Confidence Interval:** `risk ± (15% × risk)`  
**Crisis Threshold:** `0.65` — systems above this are flagged as "triggered"

**Output fields:**
- `risk_score` (0–1)
- `cascade_effects` → per-system breakdown
- `triggered_systems` → list of systems in alert
- `time_to_impact` → estimated days until critical
- `confidence_interval` → `{ lower, upper }`

---

### Module 3 · Simulation Engine (`engine/simulationEngine.js`)

Accepts policy parameters and applies them to baseline environmental data:

```json
{ "trafficReduction": 20, "industrialCut": 15, "heatwaveLevel": 2 }
```

**AQI adjustment formula:**
```
adjusted_aqi = baseline_aqi × (1 - trafficReduction×0.40 - industrialCut×0.60)
```

**Returns:** Updated risk · Adjusted data snapshot · Delta vs. baseline

---

### Module 4 · Forecast Engine (`engine/forecastEngine.js`) — ML Adapter Pattern

```
forecastEngine
  └── ML_ENABLED=false  →  mockForecast()    ← 7-day trend extrapolation + noise model
  └── ML_ENABLED=true   →  callMLService()   ← POST to ML_SERVICE_URL/predict
```

Both paths return **identical response shape** — zero code changes needed to switch.

**ML Service Contract:**
```json
// Request:  { "aqi_series": [], "water_series": [], "days": 7 }
// Response: { "aqi_forecast": [], "water_stress_forecast": [], "confidence_bands": {} }
```

**Confidence bands widen** per future day: `margin = 15% × (1 + day × 0.05)`

---

### Module 5 · Recommendation Engine (`engine/recommendationEngine.js`)

**Algorithm:**
1. Define 6 policy interventions (traffic cuts, industrial caps, combined, heatwave)
2. For each: run `simulationEngine` and measure `δ risk`
3. Score: `efficiency = δ_risk × cost_weight` (LOW=1.5, MEDIUM=1.0, HIGH=0.7)
4. Return sorted list with rank, projected risk, and cascade impact

---

### Module 6 · Zone Engine (`engine/zoneEngine.js`) ← _Fills hackathon requirement_

**City Zones:**

| Zone ID | Name | Type | Primary Exposure |
|---------|------|------|-----------------|
| `zone_industrial` | Industrial Corridor | INDUSTRIAL | Emissions + AQI |
| `zone_residential` | Residential District | RESIDENTIAL | Health + Water |
| `zone_commercial` | Commercial Hub | COMMERCIAL | Traffic + AQI |
| `zone_waterfront` | Waterfront Zone | ECOLOGICAL | Water (max sensitivity) |
| `zone_transport` | Transport Gateway | TRANSPORT | Traffic (max sensitivity) |

**Alert levels:** SAFE (<0.35) · WATCH (<0.55) · WARNING (<0.70) · CRITICAL (≥0.70)

**Outputs per zone:** `risk_score` · `alert_level` · `primary_threat` · `is_affected` · `evacuation_priority` · `confidence_interval`

---

## 4️⃣ Database Design (MongoDB Atlas)

### Collection: `environmental_data`
```json
{
  "date":               "Date (unique index)",
  "aqi":                "Number  0–500",
  "traffic":            "Number  0–100",
  "water_quality":      "Number  0–100",
  "industry_emission":  "Number  0–100",
  "source":             "String  seed|api|sensor|manual"
}
```

### Collection: `simulations`
```json
{
  "input_parameters":   "{ trafficReduction, industrialCut, heatwaveLevel }",
  "baseline_data":      "{ aqi, traffic, water_quality, industry_emission }",
  "risk_score":         "Number  0–1",
  "confidence_interval":"{ lower, upper }",
  "cascade_effects":    "{ aqi_risk, water_risk, health_risk, traffic_risk }",
  "triggered_systems":  "String[]",
  "time_to_impact":     "Number (days)",
  "timestamp":          "Date"
}
```

---

## 5️⃣ API Specification

### Core

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ping` | Health check + ML mode status |
| `GET` | `/status` | Current crisis metrics from latest data |

### Simulation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/simulate` | Apply policy → get risk delta |
| `POST` | `/simulate/compare` | Compare up to 5 scenarios side-by-side |
| `GET` | `/simulate/history` | Past simulation records (paginated) |

**POST /simulate body:**
```json
{ "trafficReduction": 20, "industrialCut": 15, "heatwaveLevel": 2 }
```

**POST /simulate/compare body:**
```json
{
  "scenarios": [
    { "label": "Traffic Only",  "trafficReduction": 30 },
    { "label": "Industry Only", "industrialCut": 25 },
    { "label": "Combined",      "trafficReduction": 20, "industrialCut": 20 }
  ]
}
```

### Forecast & Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/forecast` | 7-day AQI + water stress forecast with confidence bands |
| `GET` | `/recommendations` | Ranked mitigation strategies |

### Zones

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/zones` | All 5 zones with risk scores + alerts |
| `GET` | `/zones?forecast=true` | + 7-day zone risk forecast |
| `GET` | `/zones/:id` | Single zone deep-dive + forecast |

### Data Ingestion & History

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/data` | Ingest new reading → immediate risk recompute + WS broadcast |
| `GET` | `/data` | All records (paginated) |
| `GET` | `/history` | 7-day trend arrays formatted for charts |

### Docs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/docs` | Interactive Swagger UI |
| `GET` | `/docs.json` | Raw OpenAPI 3.0 JSON spec |

---

## 6️⃣ Real-Time: WebSocket

**Connection:** `ws://localhost:5000`

**Message types:**

| Type | When | Payload |
|------|------|---------|
| `CONNECTED` | On connect | Current status |
| `RISK_UPDATE` | On `POST /data` | New risk score + cascade effects |
| `PING` | Every 30s | Keepalive |

**Browser example:**
```js
const ws = new WebSocket('ws://localhost:5000');
ws.onmessage = e => console.log(JSON.parse(e.data));
// POST /data → RISK_UPDATE fires automatically
```

---

## 7️⃣ Non-Functional Requirements

| Requirement | Implementation |
|-------------|---------------|
| Stateless API | No session state — all data from MongoDB |
| Response < 500ms | All computation is in-memory; single DB query max |
| Modular design | 6 engine modules, fully decoupled |
| Containerized | `Dockerfile` + `docker-compose.yml` with Atlas + local profiles |
| Security | `helmet` headers + 3-tier rate limiting |
| Input validation | `express-validator` on all POST endpoints |
| Error handling | Centralized `middleware/errorHandler.js` |

### Rate Limits

| Tier | Route | Limit |
|------|-------|-------|
| Global | All routes | 200 req / 15 min |
| Simulation | `/simulate` | 30 req / 15 min |
| Data Ingest | `/data` | 60 req / 15 min |

---

## 8️⃣ ML Integration (Future)

Set in `.env` — no code changes required:

```env
ML_ENABLED=true
ML_SERVICE_URL=http://<ml-host>:8000
```

The `forecastEngine` adapter automatically switches from mock to real ML. The adapter in `services/mlServiceClient.js` gracefully falls back to mock if the ML service is unreachable.

---

## 9️⃣ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 (LTS) |
| Framework | Express 4 |
| Database | MongoDB Atlas + Mongoose 8 |
| WebSocket | ws (native, same port as HTTP) |
| Security | Helmet + express-rate-limit |
| Docs | swagger-ui-express + swagger-jsdoc |
| Validation | express-validator |
| HTTP Client | node-fetch (ML adapter) |
| Container | Docker + Docker Compose |
| Dev Server | nodemon |

---

## 🔟 Project File Structure

```
backend/
├── server.js                     ← Entry point (HTTP + WebSocket)
├── .env                          ← Config (MONGO_URI, ML_ENABLED, etc.)
├── Dockerfile                    ← Multi-stage production build
├── docker-compose.yml            ← Atlas + local MongoDB profiles
│
├── config/
│   ├── db.js                     ← Mongoose connection
│   └── swagger.js                ← OpenAPI 3.0 spec
│
├── models/
│   ├── EnvironmentalData.js      ← environmental_data collection
│   └── Simulation.js            ← simulations collection
│
├── engine/
│   ├── dataProcessor.js         ← Normalize + validate inputs
│   ├── cascadeEngine.js         ← Weighted dependency graph
│   ├── simulationEngine.js      ← Policy scenario runner
│   ├── forecastEngine.js        ← ML adapter + mock 7-day forecast
│   ├── recommendationEngine.js  ← Ranked interventions
│   └── zoneEngine.js            ← 5-zone affected area forecast
│
├── services/
│   ├── mlServiceClient.js       ← HTTP adapter for ML microservice
│   └── websocketService.js      ← Real-time WS alert broadcaster
│
├── routes/
│   ├── status.js                ← GET /status
│   ├── simulate.js              ← POST /simulate, /compare, GET /history
│   ├── forecast.js              ← GET /forecast
│   ├── recommendations.js       ← GET /recommendations
│   ├── zones.js                 ← GET /zones, GET /zones/:id
│   ├── data.js                  ← POST /data, GET /data
│   └── history.js               ← GET /history
│
├── middleware/
│   ├── errorHandler.js          ← Centralized JSON error handler
│   ├── rateLimiter.js           ← 3-tier rate limiting
│   └── validator.js             ← express-validator rules
│
└── seed/
    └── seedData.js              ← 7-day mock crisis event data
```

---

## ✅ Success Metrics

| Metric | Status |
|--------|--------|
| Correct cascade propagation | ✅ Verified — CRITICAL (0.851) on Day 7 data |
| All 5 hackathon expected outputs | ✅ Crisis Score · Time-to-Impact · Zone Forecast · Recommendations · Confidence Intervals |
| Stable simulation under scenarios | ✅ 19.15% improvement with combined policy |
| Clear module separation | ✅ 6 independent engine modules |
| ML adapter ready | ✅ Flip `ML_ENABLED=true` → zero code changes |
| Real-time updates | ✅ WebSocket broadcasts on every `POST /data` |
| Interactive docs | ✅ Swagger UI at `/docs` |
