require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { globalLimiter, simulationLimiter, dataIngestLimiter } = require('./middleware/rateLimiter');
const { initWebSocket } = require('./services/websocketService');

// ── Route imports ─────────────────────────────────────────────────────────────
const statusRoute = require('./routes/status');
const simulateRoute = require('./routes/simulate');
const forecastRoute = require('./routes/forecast');
const recommendationsRoute = require('./routes/recommendations');
const zonesRoute = require('./routes/zones');
const dataRoute = require('./routes/data');
const historyRoute = require('./routes/history');
const deforestationRoute = require('./routes/deforestation');

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

// ── Express App ───────────────────────────────────────────────────────────────
const app = express();

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false, // allow Swagger UI to load
}));
app.use(cors());
app.use(globalLimiter);         // 200 req/15min per IP across all routes

// ── General Middleware ────────────────────────────────────────────────────────
app.use(express.json());
app.use(morgan('dev'));

// ── Health Ping ───────────────────────────────────────────────────────────────
app.get('/ping', (req, res) => res.json({
    ok: true,
    service: 'CitySentinel AI Engine',
    timestamp: new Date().toISOString(),
    ml_mode: process.env.ML_ENABLED === 'true' ? 'ml_service' : 'mock',
}));

// ── Swagger Docs ──────────────────────────────────────────────────────────────
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'CitySentinel AI – API Docs',
    customCss: '.swagger-ui .topbar { background-color: #1a1a2e; }',
}));
// Raw OpenAPI JSON
app.get('/docs.json', (req, res) => res.json(swaggerSpec));

// ── API Routes ────────────────────────────────────────────────────────────────
/**
 * GET  /status               → Current crisis metrics
 * POST /simulate             → Policy scenario simulation
 * POST /simulate/compare     → Multi-scenario comparison (NEW)
 * GET  /simulate/history     → Past simulation records
 * GET  /forecast             → 7-day AQI + water forecast
 * GET  /recommendations      → Ranked mitigation strategies
 * GET  /zones                → Per-zone affected area forecast
 * GET  /zones/:id            → Single zone detail
 * POST /data                 → Real-time environmental data ingestion (NEW)
 * GET  /data                 → Paginated data records (NEW)
 * GET  /history              → 7-day trend data for charts (NEW)
 * GET  /docs                 → Swagger interactive API docs (NEW)
 */
app.use('/status', statusRoute);
app.use('/simulate', simulationLimiter, simulateRoute);  // compute-heavy → stricter limit
app.use('/forecast', forecastRoute);
app.use('/recommendations', recommendationsRoute);
app.use('/zones', zonesRoute);
app.use('/data', dataIngestLimiter, dataRoute);      // ingest → dedicated limit
app.use('/history', historyRoute);
app.use('/deforestation', deforestationRoute);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route not found: ${req.method} ${req.originalUrl}`,
        available_routes: [
            'GET  /ping',
            'GET  /docs                  ← Interactive API docs',
            'GET  /status',
            'POST /simulate',
            'POST /simulate/compare',
            'GET  /simulate/history',
            'GET  /forecast',
            'GET  /recommendations',
            'GET  /zones',
            'GET  /zones/:id',
            'POST /data',
            'GET  /data',
            'GET  /history',
            'GET  /deforestation/overview',
            'GET  /deforestation/risk',
            'GET  /deforestation/national',
            'GET  /deforestation/drought',
        ],
    });
});

// ── Centralized Error Handler ─────────────────────────────────────────────────
app.use(errorHandler);

// ── HTTP Server + WebSocket ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Upgrade HTTP server to support WebSocket on the same port
initWebSocket(server, app);

server.listen(PORT, () => {
    console.log(`\n🚀 CitySentinel AI Engine  →  http://localhost:${PORT}`);
    console.log(`📖 Swagger Docs            →  http://localhost:${PORT}/docs`);
    console.log(`📡 WebSocket Feed          →  ws://localhost:${PORT}`);
    console.log(`🔮 ML Mode: ${process.env.ML_ENABLED === 'true' ? '🤖 ML Service' : '🔮 Mock Forecast'}`);
    console.log(`\n   Endpoints:`);
    console.log(`   GET  /status`);
    console.log(`   POST /simulate          (rate: 30/15min)`);
    console.log(`   POST /simulate/compare`);
    console.log(`   GET  /forecast`);
    console.log(`   GET  /recommendations`);
    console.log(`   GET  /zones`);
    console.log(`   POST /data              (rate: 60/15min)`);
    console.log(`   GET  /history`);
    console.log(`   GET  /deforestation/*    (overview, risk, national, drought)`);
    console.log(`   GET  /docs\n`);
});

module.exports = app;
