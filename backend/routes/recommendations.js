const express = require('express');
const router = express.Router();

const EnvironmentalData = require('../models/EnvironmentalData');
const { computeRisk } = require('../engine/cascadeEngine');
const { generateRecommendations } = require('../engine/recommendationEngine');

/**
 * GET /recommendations
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs the recommendation engine against current environmental data.
 * Returns ranked mitigation strategies sorted by efficiency score.
 *
 * Query params:
 *   heatwaveLevel : number (0–5)  optional, default 0
 *   limit         : number        optional, default all
 *
 * Response:
 * {
 *   success: true,
 *   baseline_risk: number,
 *   crisis_level: string,
 *   total_interventions: number,
 *   recommendations: [{
 *     rank, id, name, category, description, cost_proxy,
 *     baseline_risk, projected_risk, risk_reduction,
 *     efficiency_score, cascade_impact, expected_systems_resolved
 *   }]
 * }
 */
router.get('/', async (req, res, next) => {
    try {
        const heatwaveLevel = parseFloat(req.query.heatwaveLevel) || 0;
        const limit = parseInt(req.query.limit) || null;

        // Get the most recent environmental reading
        const latest = await EnvironmentalData.findOne().sort({ date: -1 });

        if (!latest) {
            return res.status(404).json({
                success: false,
                error: 'No environmental data found. Please run `npm run seed` first.',
            });
        }

        // Apply city multiplier/offset if provided
        const cityId = req.query.cityId;
        // In a real app we'd fetch the city profile from DB or a config file.
        // For now, we simulate the impact of city choice.
        const riskMultipliers = {
            delhi: 1.35, mumbai: 1.15, bengaluru: 1.0, kolkata: 1.2,
            hyderabad: 0.95, ahmedabad: 1.1, chennai: 0.88, pune: 0.82,
            jaipur: 0.92, lucknow: 1.05
        };
        const multiplier = riskMultipliers[cityId] || 1.0;

        // Compute baseline risk
        const baselineResult = computeRisk(latest, heatwaveLevel);
        const baselineRisk = Math.min(1.0, baselineResult.risk_score * multiplier);

        // Generate all ranked interventions
        let recommendations = generateRecommendations(latest, baselineRisk, heatwaveLevel);

        // Optional limit
        if (limit) {
            recommendations = recommendations.slice(0, limit);
        }

        const getCrisisLevel = (score) => {
            if (score < 0.30) return 'LOW';
            if (score < 0.55) return 'MODERATE';
            if (score < 0.75) return 'HIGH';
            return 'CRITICAL';
        };

        res.json({
            success: true,
            baseline_risk: baselineRisk,
            crisis_level: getCrisisLevel(baselineRisk),
            triggered_systems: baselineResult.triggered_systems,
            total_interventions: recommendations.length,
            recommendations,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
