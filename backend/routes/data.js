const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const EnvironmentalData = require('../models/EnvironmentalData');
const { computeRisk } = require('../engine/cascadeEngine');

/**
 * POST /data
 * ─────────────────────────────────────────────────────────────────────────────
 * Real-time data ingestion endpoint.
 * Accepts a new environmental reading, validates it, persists it to MongoDB,
 * immediately computes the updated cascade risk, and broadcasts a WebSocket
 * alert if the crisis level has changed.
 *
 * Request body:
 * {
 *   aqi:               number (0–500)   required
 *   traffic:           number (0–100)   required
 *   water_quality:     number (0–100)   required
 *   industry_emission: number (0–100)   required
 *   date:              ISO string        optional (defaults to now)
 *   source:            string            optional (api/sensor/manual)
 * }
 */

const dataValidation = [
    body('aqi').isFloat({ min: 0, max: 500 }).withMessage('aqi must be 0–500'),
    body('traffic').isFloat({ min: 0, max: 100 }).withMessage('traffic must be 0–100'),
    body('water_quality').isFloat({ min: 0, max: 100 }).withMessage('water_quality must be 0–100'),
    body('industry_emission').isFloat({ min: 0, max: 100 }).withMessage('industry_emission must be 0–100'),
];

router.post('/', dataValidation, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
            });
        }

        const {
            aqi,
            traffic,
            water_quality,
            industry_emission,
            date = new Date(),
            source = 'api',
        } = req.body;

        // Upsert: if a record for this date already exists, update it
        const record = await EnvironmentalData.findOneAndUpdate(
            { date: new Date(new Date(date).setHours(0, 0, 0, 0)) },
            { aqi, traffic, water_quality, industry_emission, source },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Immediately compute updated risk
        const heatwaveLevel = parseFloat(req.body.heatwaveLevel) || 0;
        const riskResult = computeRisk(record, heatwaveLevel);

        // Broadcast via WebSocket if app instance has wss attached
        const wss = req.app.get('wss');
        if (wss) {
            const alert = {
                type: 'RISK_UPDATE',
                timestamp: new Date().toISOString(),
                risk_score: riskResult.risk_score,
                crisis_level: getCrisisLevel(riskResult.risk_score),
                triggered_systems: riskResult.triggered_systems,
                cascade_effects: riskResult.cascade_effects,
                data: { aqi, traffic, water_quality, industry_emission },
            };
            wss.clients.forEach((client) => {
                if (client.readyState === 1) { // OPEN
                    client.send(JSON.stringify(alert));
                }
            });
        }

        res.status(201).json({
            success: true,
            message: 'Environmental data recorded successfully.',
            record_id: record._id,
            date: record.date,
            source: record.source,
            risk_update: {
                risk_score: riskResult.risk_score,
                crisis_level: getCrisisLevel(riskResult.risk_score),
                confidence_interval: riskResult.confidence_interval,
                triggered_systems: riskResult.triggered_systems,
                cascade_effects: riskResult.cascade_effects,
            },
            websocket_broadcast: !!wss,
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /data
 * Returns all stored environmental readings (paginated).
 */
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [records, total] = await Promise.all([
            EnvironmentalData.find().sort({ date: -1 }).skip(skip).limit(limit),
            EnvironmentalData.countDocuments(),
        ]);

        res.json({
            success: true,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            records,
        });
    } catch (err) {
        next(err);
    }
});

const getCrisisLevel = (score) => {
    if (score < 0.30) return 'LOW';
    if (score < 0.55) return 'MODERATE';
    if (score < 0.75) return 'HIGH';
    return 'CRITICAL';
};

module.exports = router;
