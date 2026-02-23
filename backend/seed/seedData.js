require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const EnvironmentalData = require('../models/EnvironmentalData');

/**
 * Seed Script – 7-Day Mock Environmental Data
 * ─────────────────────────────────────────────────────────────────────────────
 * Inserts 7 days of realistic environmental data simulating a pollution +
 * drought event in an Indian metro city.
 *
 * Run with: npm run seed
 *
 * Data trends:
 *  - AQI: rising 85→218 (pollution event escalating)
 *  - Traffic: moderate daily variation 55–88%
 *  - Water Quality: declining 82→30 (contamination event)
 *  - Industry Emission: rising with weekend dip
 *  - Temperature: seasonal variation 28–38°C
 *  - Drought Index: worsening 0.15→0.55
 */

const generateSeedData = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return [
        {
            date: new Date(new Date(today).setDate(today.getDate() - 6)),
            aqi: 85,
            traffic: 55,
            water_quality: 82,
            industry_emission: 52,
            temperature: 28,
            drought_index: 0.15,
        },
        {
            date: new Date(new Date(today).setDate(today.getDate() - 5)),
            aqi: 105,
            traffic: 62,
            water_quality: 74,
            industry_emission: 60,
            temperature: 30,
            drought_index: 0.20,
        },
        {
            date: new Date(new Date(today).setDate(today.getDate() - 4)),
            aqi: 130,
            traffic: 70,
            water_quality: 65,
            industry_emission: 68,
            temperature: 32,
            drought_index: 0.28,
        },
        {
            date: new Date(new Date(today).setDate(today.getDate() - 3)),
            aqi: 155,
            traffic: 78,
            water_quality: 54,
            industry_emission: 58, // weekend dip
            temperature: 35,
            drought_index: 0.35,
        },
        {
            date: new Date(new Date(today).setDate(today.getDate() - 2)),
            aqi: 170,
            traffic: 65,
            water_quality: 46,
            industry_emission: 55, // weekend
            temperature: 36,
            drought_index: 0.42,
        },
        {
            date: new Date(new Date(today).setDate(today.getDate() - 1)),
            aqi: 195,
            traffic: 82,
            water_quality: 38,
            industry_emission: 78,
            temperature: 37,
            drought_index: 0.48,
        },
        {
            date: new Date(today),
            aqi: 218,
            traffic: 88,
            water_quality: 30,
            industry_emission: 88,
            temperature: 38,
            drought_index: 0.55,
        },
    ];
};

const seed = async () => {
    await connectDB();

    console.log('🌱 Seeding CitySentinel database...\n');

    // Clear existing data
    const deleted = await EnvironmentalData.deleteMany({});
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing records.`);

    // Insert 7-day mock dataset
    const data = generateSeedData();
    const inserted = await EnvironmentalData.insertMany(data);

    console.log(`✅ Inserted ${inserted.length} days of environmental data:\n`);
    inserted.forEach((d, i) => {
        console.log(
            `   Day ${i + 1} (${d.date.toDateString()}) → AQI: ${d.aqi}, Traffic: ${d.traffic}%, ` +
            `Water: ${d.water_quality}, Emissions: ${d.industry_emission}, ` +
            `Temp: ${d.temperature}°C, Drought: ${d.drought_index}`
        );
    });

    console.log('\n🚀 Database ready. Run `npm run dev` to start the server.\n');
    await mongoose.disconnect();
};

seed().catch((err) => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
