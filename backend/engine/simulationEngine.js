const { normalizeAll } = require('./dataProcessor');
const { runCascade } = require('./cascadeEngine');

/**
 * Scenario Simulation Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Accepts policy inputs (e.g., trafficReduction, industrialCut, heatwaveLevel),
 * applies them to baseline environmental data, and returns the updated risk.
 *
 * Policy Input Schema:
 *   trafficReduction : 0–100  (% reduction applied to current traffic)
 *   industrialCut    : 0–100  (% reduction applied to industry_emission)
 *   heatwaveLevel    : 0–5    (external heatwave severity override)
 *   waterConservation: 0–100  (% reduction in water consumption)
 *   greenSpaceExpansion: 0–100 (% increase in urban greenery)
 * }
 */

/**
 * Clamp a value between min and max.
 */
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/**
 * Apply policy parameters to a baseline environmental data snapshot,
 * then compute the resulting cascade risk.
 *
 * @param {Object} baseline    - Raw EnvironmentalData document from MongoDB
 * @param {Object} policyInput - { trafficReduction?, industrialCut?, heatwaveLevel? }
 * @returns {Object} Full simulation result including risk, cascade, and time-to-impact
 */
const runSimulation = (baseline, policyInput = {}) => {
    const {
        trafficReduction = 0,
        industrialCut = 0,
        heatwaveLevel = 0,
        waterConservation = 0,
        greenSpaceExpansion = 0,
    } = policyInput;

    // ── Apply policy reductions to baseline ────────────────────────────────────
    const adjusted = {
        aqi: baseline.aqi,
        traffic: clamp(baseline.traffic * (1 - trafficReduction / 100), 0, 100),
        water_quality: clamp(baseline.water_quality * (1 + (waterConservation / 100) * 0.3), 0, 100), // Improvement up to 30%
        industry_emission: clamp(baseline.industry_emission * (1 - industrialCut / 100), 0, 100),
    };

    // Recalculate AQI estimate
    // AQI reduced by traffic, emissions, AND green space (up to 15% reduction from greenery)
    adjusted.aqi = clamp(
        baseline.aqi * (
            1 -
            (trafficReduction / 100) * 0.40 -
            (industrialCut / 100) * 0.50 -
            (greenSpaceExpansion / 100) * 0.15
        ),
        0,
        500
    );

    // Green space also mitigates heatwave effect (up to 1.0 level reduction)
    const effectiveHeatwave = clamp(heatwaveLevel - (greenSpaceExpansion / 100) * 1.0, 0, 5);

    // ── Run cascade on adjusted data ───────────────────────────────────────────
    const normalized = normalizeAll(adjusted);
    const cascadeResult = runCascade(normalized, effectiveHeatwave);

    return {
        ...cascadeResult,
        adjusted_data: adjusted,
        policy_applied: {
            trafficReduction,
            industrialCut,
            heatwaveLevel,
            waterConservation,
            greenSpaceExpansion,
        },
    };
};

module.exports = { runSimulation };
