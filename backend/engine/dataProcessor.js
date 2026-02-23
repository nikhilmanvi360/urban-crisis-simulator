/**
 * Data Processing Module
 * ─────────────────────────────────────────────────────────────────────────────
 * Responsible for:
 *  - Normalizing raw environmental inputs to a 0–1 risk scale
 *  - Validating input ranges before any simulation
 *
 * All normalized outputs feed into the Cascade Engine.
 */

const THRESHOLDS = {
    aqi: { min: 0, max: 500 },  // WHO scale
    traffic: { min: 0, max: 100 },  // % congestion
    water_quality: { min: 0, max: 100 },  // 100 = pristine
    industry_emission: { min: 0, max: 100 },  // emission index
};

/**
 * Normalize AQI to 0–1 risk scale (higher AQI = higher risk).
 * @param {number} value - Raw AQI (0–500)
 * @returns {number} Normalized risk 0–1
 */
const normalizeAQI = (value) => {
    return Math.min(Math.max(value / THRESHOLDS.aqi.max, 0), 1);
};

/**
 * Normalize traffic density to 0–1 risk scale.
 * @param {number} value - Traffic density % (0–100)
 * @returns {number} Normalized risk 0–1
 */
const normalizeTraffic = (value) => {
    return Math.min(Math.max(value / THRESHOLDS.traffic.max, 0), 1);
};

/**
 * Normalize water quality to 0–1 risk scale.
 * ⚠ Inverted: lower quality score = higher risk.
 * @param {number} value - Water quality score (0–100)
 * @returns {number} Normalized risk 0–1
 */
const normalizeWater = (value) => {
    const inverted = THRESHOLDS.water_quality.max - value;
    return Math.min(Math.max(inverted / THRESHOLDS.water_quality.max, 0), 1);
};

/**
 * Normalize industrial emissions to 0–1 risk scale.
 * @param {number} value - Emission index (0–100)
 * @returns {number} Normalized risk 0–1
 */
const normalizeEmissions = (value) => {
    return Math.min(Math.max(value / THRESHOLDS.industry_emission.max, 0), 1);
};

/**
 * Validate that all environmental inputs are within acceptable ranges.
 * Throws an error with HTTP 400 status code if any value is out of range.
 * @param {Object} data - { aqi, traffic, water_quality, industry_emission }
 */
const validateInput = (data) => {
    const checks = [
        { field: 'aqi', val: data.aqi, ...THRESHOLDS.aqi },
        { field: 'traffic', val: data.traffic, ...THRESHOLDS.traffic },
        { field: 'water_quality', val: data.water_quality, ...THRESHOLDS.water_quality },
        { field: 'industry_emission', val: data.industry_emission, ...THRESHOLDS.industry_emission },
    ];

    for (const { field, val, min, max } of checks) {
        if (val === undefined || val === null) {
            const err = new Error(`Missing required field: ${field}`);
            err.statusCode = 400;
            throw err;
        }
        if (val < min || val > max) {
            const err = new Error(`${field} must be between ${min} and ${max}, got ${val}`);
            err.statusCode = 400;
            throw err;
        }
    }
};

/**
 * Normalize a full environmental data document.
 * @param {Object} data - Raw environmental data
 * @returns {Object} Fully normalized risk values
 */
const normalizeAll = (data) => {
    return {
        aqi: normalizeAQI(data.aqi),
        traffic: normalizeTraffic(data.traffic),
        water: normalizeWater(data.water_quality),
        emissions: normalizeEmissions(data.industry_emission),
    };
};

module.exports = {
    normalizeAQI,
    normalizeTraffic,
    normalizeWater,
    normalizeEmissions,
    normalizeAll,
    validateInput,
    THRESHOLDS,
};
