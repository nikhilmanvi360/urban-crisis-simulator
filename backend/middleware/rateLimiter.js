const rateLimit = require('express-rate-limit');

/**
 * Rate Limiters
 * ─────────────────────────────────────────────────────────────────────────────
 * Three tiers:
 *  - global      : 200 req / 15 min per IP (all routes)
 *  - simulation  : 30 req / 15 min per IP (compute-heavy)
 *  - data ingest : 60 req / 15 min per IP (POST /data)
 */

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests from this IP. Please try again after 15 minutes.',
    },
});

const simulationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Simulation rate limit exceeded (30 per 15min). Please wait.',
    },
});

const dataIngestLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Data ingestion rate limit exceeded (60 per 15min). Please wait.',
    },
});

module.exports = { globalLimiter, simulationLimiter, dataIngestLimiter };
