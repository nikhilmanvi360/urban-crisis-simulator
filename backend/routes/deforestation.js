const express = require('express');
const router = express.Router();

const {
    fetchDeforestationData,
    compareDeforestationStates,
} = require('../services/mlServiceClient');

/**
 * Deforestation Routes
 * ─────────────────────────────────────────────────────────────────────────────
 * Proxy layer between the frontend and the ML microservice's deforestation API.
 * All endpoints delegate to the ML service at /deforestation/*.
 *
 * When the ML service is unavailable, mock data is returned so the frontend
 * can still render meaningful UIs.
 */

// ─── Mock fallback data ─────────────────────────────────────────────────────

const MOCK_OVERVIEW = {
    year_range: [2001, 2023],
    total_states: 28,
    total_records: 336,
    years_available: [2001, 2003, 2005, 2007, 2009, 2011, 2013, 2015, 2017, 2019, 2021, 2023],
    latest_year_summary: {
        year: 2023,
        total_forest_cover_sq_km: 713789,
        total_tree_cover_loss_ha: 68420,
        total_reforestation_ha: 52300,
        total_net_change_ha: -16120,
        avg_deforestation_rate_pct: 0.198,
        avg_forest_cover_pct: 21.7,
    },
};

const MOCK_RISK_SCORES = [
    { state: 'Jharkhand', risk_score: 78.2, risk_level: 'Critical', deforestation_rate_pct: 0.45, tree_cover_loss_ha: 12400, net_change_ha: -8200, forest_cover_pct: 29.6 },
    { state: 'Assam', risk_score: 71.5, risk_level: 'Critical', deforestation_rate_pct: 0.38, tree_cover_loss_ha: 9800, net_change_ha: -6500, forest_cover_pct: 34.2 },
    { state: 'Madhya Pradesh', risk_score: 62.4, risk_level: 'High', deforestation_rate_pct: 0.28, tree_cover_loss_ha: 11200, net_change_ha: -4800, forest_cover_pct: 25.1 },
    { state: 'Maharashtra', risk_score: 55.8, risk_level: 'High', deforestation_rate_pct: 0.22, tree_cover_loss_ha: 8500, net_change_ha: -3200, forest_cover_pct: 16.5 },
    { state: 'Karnataka', risk_score: 48.3, risk_level: 'Moderate', deforestation_rate_pct: 0.18, tree_cover_loss_ha: 6200, net_change_ha: -1800, forest_cover_pct: 20.1 },
    { state: 'Odisha', risk_score: 44.1, risk_level: 'Moderate', deforestation_rate_pct: 0.15, tree_cover_loss_ha: 5800, net_change_ha: -1200, forest_cover_pct: 33.2 },
    { state: 'Rajasthan', risk_score: 38.7, risk_level: 'Moderate', deforestation_rate_pct: 0.12, tree_cover_loss_ha: 3200, net_change_ha: 500, forest_cover_pct: 4.9 },
    { state: 'Kerala', risk_score: 25.2, risk_level: 'Low', deforestation_rate_pct: 0.06, tree_cover_loss_ha: 1800, net_change_ha: 2200, forest_cover_pct: 54.4 },
];

const MOCK_NATIONAL = {
    years: [2001, 2005, 2009, 2013, 2017, 2021, 2023],
    total_forest_cover: [678333, 690899, 697898, 701673, 708273, 713789, 713789],
    total_tree_loss: [42000, 48500, 52300, 58100, 62800, 65400, 68420],
    total_reforestation: [35000, 38200, 42100, 45800, 48900, 51200, 52300],
    total_net_change: [-7000, -10300, -10200, -12300, -13900, -14200, -16120],
    avg_deforestation_rate: [0.12, 0.15, 0.16, 0.18, 0.19, 0.19, 0.198],
};

// ─── Drought Mock Data ──────────────────────────────────────────────────────

const MOCK_DROUGHT = {
    national_summary: {
        drought_severity_index: 0.42,
        affected_area_pct: 32.5,
        trend: 'Worsening',
        monitoring_period: '2020-2024',
    },
    regions: [
        { region: 'Marathwada', state: 'Maharashtra', severity: 'Extreme', severity_index: 0.85, rainfall_deficit_pct: -45, groundwater_depletion_m: 3.2, crop_loss_pct: 62 },
        { region: 'Bundelkhand', state: 'Uttar Pradesh', severity: 'Severe', severity_index: 0.72, rainfall_deficit_pct: -38, groundwater_depletion_m: 2.8, crop_loss_pct: 48 },
        { region: 'Rayalaseema', state: 'Andhra Pradesh', severity: 'Severe', severity_index: 0.68, rainfall_deficit_pct: -35, groundwater_depletion_m: 2.1, crop_loss_pct: 42 },
        { region: 'Vidarbha', state: 'Maharashtra', severity: 'Moderate', severity_index: 0.55, rainfall_deficit_pct: -28, groundwater_depletion_m: 1.8, crop_loss_pct: 35 },
        { region: 'Saurashtra', state: 'Gujarat', severity: 'Moderate', severity_index: 0.48, rainfall_deficit_pct: -22, groundwater_depletion_m: 1.5, crop_loss_pct: 28 },
        { region: 'Western Rajasthan', state: 'Rajasthan', severity: 'Moderate', severity_index: 0.45, rainfall_deficit_pct: -20, groundwater_depletion_m: 1.2, crop_loss_pct: 25 },
        { region: 'Telangana Plateau', state: 'Telangana', severity: 'Mild', severity_index: 0.32, rainfall_deficit_pct: -15, groundwater_depletion_m: 0.8, crop_loss_pct: 18 },
        { region: 'North Karnataka', state: 'Karnataka', severity: 'Mild', severity_index: 0.28, rainfall_deficit_pct: -12, groundwater_depletion_m: 0.6, crop_loss_pct: 14 },
    ],
    historical_trend: {
        years: [2020, 2021, 2022, 2023, 2024],
        severity_index: [0.28, 0.35, 0.38, 0.40, 0.42],
        affected_area_pct: [22, 25, 28, 30, 32.5],
    },
};

// ─── Routes ─────────────────────────────────────────────────────────────────

/**
 * GET /deforestation/overview
 * High-level deforestation dataset summary.
 */
router.get('/overview', async (req, res, next) => {
    try {
        const data = await fetchDeforestationData('/overview');
        res.json({ success: true, ...(data || MOCK_OVERVIEW), mode: data ? 'ml_service' : 'mock' });
    } catch (err) { next(err); }
});

/**
 * GET /deforestation/risk
 * State-level deforestation risk scores.
 */
router.get('/risk', async (req, res, next) => {
    try {
        const year = req.query.year ? `?year=${req.query.year}` : '';
        const data = await fetchDeforestationData(`/risk${year}`);
        res.json({
            success: true,
            scores: data?.scores || MOCK_RISK_SCORES,
            year: data?.year || 'latest',
            mode: data ? 'ml_service' : 'mock',
        });
    } catch (err) { next(err); }
});

/**
 * GET /deforestation/national
 * National aggregate deforestation trend.
 */
router.get('/national', async (req, res, next) => {
    try {
        const data = await fetchDeforestationData('/national');
        res.json({ success: true, ...(data || MOCK_NATIONAL), mode: data ? 'ml_service' : 'mock' });
    } catch (err) { next(err); }
});

/**
 * GET /deforestation/states
 * List all available states.
 */
router.get('/states', async (req, res, next) => {
    try {
        const data = await fetchDeforestationData('/states');
        res.json({
            success: true,
            ...(data || { states: MOCK_RISK_SCORES.map((s) => s.state), count: MOCK_RISK_SCORES.length }),
            mode: data ? 'ml_service' : 'mock',
        });
    } catch (err) { next(err); }
});

/**
 * GET /deforestation/state/:name
 * State-specific deforestation trend.
 */
router.get('/state/:name', async (req, res, next) => {
    try {
        const data = await fetchDeforestationData(`/state/${encodeURIComponent(req.params.name)}`);
        if (!data) {
            return res.json({ success: true, state: req.params.name, message: 'ML service unavailable. No mock data for individual state trends.', mode: 'mock' });
        }
        res.json({ success: true, ...data, mode: 'ml_service' });
    } catch (err) { next(err); }
});

/**
 * GET /deforestation/rankings
 * Rank states by a metric.
 */
router.get('/rankings', async (req, res, next) => {
    try {
        const params = new URLSearchParams();
        if (req.query.year) params.set('year', req.query.year);
        if (req.query.metric) params.set('metric', req.query.metric);
        if (req.query.top_n) params.set('top_n', req.query.top_n);
        if (req.query.ascending) params.set('ascending', req.query.ascending);
        const qs = params.toString() ? `?${params.toString()}` : '';

        const data = await fetchDeforestationData(`/rankings${qs}`);
        res.json({ success: true, ...(data || { rankings: [] }), mode: data ? 'ml_service' : 'mock' });
    } catch (err) { next(err); }
});

/**
 * POST /deforestation/compare
 * Compare selected states on a metric.
 */
router.post('/compare', async (req, res, next) => {
    try {
        const data = await compareDeforestationStates(req.body);
        res.json({ success: true, ...(data || { error: 'ML service unavailable' }), mode: data ? 'ml_service' : 'mock' });
    } catch (err) { next(err); }
});

// ─── Drought Routes ─────────────────────────────────────────────────────────

/**
 * GET /deforestation/drought
 * Drought severity data for Indian regions.
 * Uses mock data (expandable to real drought monitoring APIs).
 */
router.get('/drought', async (req, res, next) => {
    try {
        res.json({
            success: true,
            ...MOCK_DROUGHT,
            mode: 'mock',
            note: 'Drought data sourced from India Meteorological Department patterns. Connect real IMD API for live data.',
        });
    } catch (err) { next(err); }
});

module.exports = router;
