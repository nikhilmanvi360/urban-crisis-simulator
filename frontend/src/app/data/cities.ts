/**
 * City definitions for CitySentinel AI
 * Each city has: real neighborhood zones, crisis profile, and environmental baselines.
 * Used to drive the city selector and dynamically update all pages.
 */

export interface CityZone {
    id: string;
    name: string;
    type: 'INDUSTRIAL' | 'RESIDENTIAL' | 'COMMERCIAL' | 'ECOLOGICAL' | 'TRANSPORT';
    description: string;
    population: number;
}

export interface CityEcology {
    flora: string[];
    fauna: string[];
    conservation_projects: string[];
}

export interface CityProfile {
    id: string;
    name: string;
    state: string;
    country: string;
    lat: number;
    lng: number;
    population_millions: number;
    /** Multiplier applied to global risk scores to model city-specific conditions */
    riskMultiplier: number;
    /** Baseline AQI for the city */
    baseAqi: number;
    /** A short crisis tagline */
    tagline: string;
    zones: CityZone[];
    ecology: CityEcology;
}

export const INDIAN_CITIES: CityProfile[] = [
    {
        id: 'bengaluru',
        name: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        lat: 12.971,
        lng: 77.594,
        population_millions: 12.7,
        riskMultiplier: 1.0,
        baseAqi: 98,
        tagline: 'From Bellandur Lake pollution to Silk Board gridlock',
        zones: [
            { id: 'zone_industrial', name: 'Peenya Industrial Area', type: 'INDUSTRIAL', description: 'One of Asia\'s largest industrial estates. Primary source of factory emissions.', population: 23000 },
            { id: 'zone_residential', name: 'Banashankari', type: 'RESIDENTIAL', description: 'Dense residential zone in South Bengaluru with high health vulnerability.', population: 67000 },
            { id: 'zone_commercial', name: 'MG Road / CBD', type: 'COMMERCIAL', description: 'Central Business District with peak vehicle congestion and commercial activity.', population: 45000 },
            { id: 'zone_waterfront', name: 'Bellandur Lake Zone', type: 'ECOLOGICAL', description: 'Bengaluru\'s largest lake, critically polluted and foam-prone.', population: 12000 },
            { id: 'zone_transport', name: 'Silk Board Junction', type: 'TRANSPORT', description: 'Most congested traffic hotspot on the Outer Ring Road.', population: 18000 },
        ],
        ecology: {
            flora: ['Silver Oak', 'Jacaranda', 'Gulmohar', 'Indian Cork Tree'],
            fauna: ['Slender Loris', 'Spotted Deer', 'Indian Elephant', 'Paradise Flycatcher'],
            conservation_projects: ['Lalbagh Botanical Preservation', 'Bannerghatta Wildlife Corridor', 'Lake Restoration Drive'],
        },
    },
    {
        id: 'delhi',
        name: 'New Delhi',
        state: 'Delhi NCR',
        country: 'India',
        lat: 28.613,
        lng: 77.209,
        population_millions: 32.9,
        riskMultiplier: 1.35,
        baseAqi: 215,
        tagline: 'Smog season, industrial Yamuna, and perpetual gridlock',
        zones: [
            { id: 'zone_industrial', name: 'Okhla Industrial Area', type: 'INDUSTRIAL', description: 'Major manufacturing belt contributing to Delhi\'s severe AQI.', population: 42000 },
            { id: 'zone_residential', name: 'Shahdara', type: 'RESIDENTIAL', description: 'Densely populated East Delhi residential district with water stress.', population: 95000 },
            { id: 'zone_commercial', name: 'Connaught Place', type: 'COMMERCIAL', description: 'Central business hub with high vehicular and pedestrian footfall.', population: 68000 },
            { id: 'zone_waterfront', name: 'Yamuna Riverbank', type: 'ECOLOGICAL', description: 'The heavily polluted Yamuna — one of the most toxic rivers in Asia.', population: 28000 },
            { id: 'zone_transport', name: 'NH-48 / Delhi–Gurgaon Expressway', type: 'TRANSPORT', description: 'India\'s most congested urban expressway during peak hours.', population: 35000 },
        ],
        ecology: {
            flora: ['Neem', 'Peepal', 'Banyan', 'Amaltas (Laburnum)'],
            fauna: ['Nilgai', 'Rhesus Macaque', 'Indian Peafowl', 'Blackbuck (Asola)'],
            conservation_projects: ['Yamuna Biodiversity Park', 'Ridge Reforestation', 'Green Delhi Action Plan'],
        },
    },
    {
        id: 'mumbai',
        name: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        lat: 19.076,
        lng: 72.877,
        population_millions: 20.7,
        riskMultiplier: 1.15,
        baseAqi: 145,
        tagline: 'Flooding coasts, industrial Dharavi, and Marine Drive smog',
        zones: [
            { id: 'zone_industrial', name: 'Dharavi', type: 'INDUSTRIAL', description: 'Asia\'s largest informal settlement with dense micro-industry and waste exposure.', population: 55000 },
            { id: 'zone_residential', name: 'Kurla West', type: 'RESIDENTIAL', description: 'Dense residential suburb with flooding risk and water contamination.', population: 88000 },
            { id: 'zone_commercial', name: 'Nariman Point / BKC', type: 'COMMERCIAL', description: 'Central financial district facing coastal flooding and heat island effects.', population: 52000 },
            { id: 'zone_waterfront', name: 'Mithi River Basin', type: 'ECOLOGICAL', description: 'Critically encroached and polluted river — key flood risk channel.', population: 22000 },
            { id: 'zone_transport', name: 'Western Express Highway', type: 'TRANSPORT', description: 'Major arterial road handling >1 million vehicles daily through Mumbai.', population: 40000 },
        ],
        ecology: {
            flora: ['Mangroves', 'Flame of the Forest', 'Mast Tree', 'Indian Beech'],
            fauna: ['Leopard (Sanjay Gandhi NP)', 'Loggerhead Turtle', 'Atlas Moth', 'Flamingos (Sewri)'],
            conservation_projects: ['Mithi River Rejuvenation', 'Mangrove Conservation Cell', 'Aarey Forest Protection'],
        },
    },
    {
        id: 'hyderabad',
        name: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        lat: 17.385,
        lng: 78.486,
        population_millions: 10.5,
        riskMultiplier: 0.95,
        baseAqi: 128,
        tagline: 'Shrinking Hussain Sagar and hazardous APIIC zones',
        zones: [
            { id: 'zone_industrial', name: 'APIIC Patancheru Zone', type: 'INDUSTRIAL', description: 'Heavy chemical and pharmaceutical manufacturing hub northwest of Hyderabad.', population: 31000 },
            { id: 'zone_residential', name: 'Kukatpally', type: 'RESIDENTIAL', description: 'High-density residential zone with growing water stress and air quality concerns.', population: 74000 },
            { id: 'zone_commercial', name: 'HITEC City / Gachibowli', type: 'COMMERCIAL', description: 'Tech corridor with peak traffic congestion and urban heat island effect.', population: 58000 },
            { id: 'zone_waterfront', name: 'Hussain Sagar Lake', type: 'ECOLOGICAL', description: 'Iconic lake in the heart of Hyderabad, heavily polluted by untreated effluent.', population: 14000 },
            { id: 'zone_transport', name: 'ORR — Narsingi Junction', type: 'TRANSPORT', description: 'Key intersection on the Outer Ring Road with acute traffic congestion.', population: 25000 },
        ],
        ecology: {
            flora: ['Custard Apple', 'Red Sanders', 'Teak', 'Indian Jujube'],
            fauna: ['Pangolin', 'Spotted Deer', 'Indian Roller', 'Checkered Keelback'],
            conservation_projects: ['Haritha Haram (Greenery Drive)', 'Hussain Sagar Cleanup', 'KBR Park Biodiversity Protection'],
        },
    },
    {
        id: 'chennai',
        name: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        lat: 13.083,
        lng: 80.270,
        population_millions: 10.9,
        riskMultiplier: 0.88,
        baseAqi: 112,
        tagline: 'Day Zero water crisis, Adyar flooding, and SIPCOT emissions',
        zones: [
            { id: 'zone_industrial', name: 'SIPCOT Siruseri', type: 'INDUSTRIAL', description: 'Major IT and manufacturing park on the outskirts with effluent discharge concerns.', population: 27000 },
            { id: 'zone_residential', name: 'Vyasarpadi', type: 'RESIDENTIAL', description: 'North Chennai residential area highly exposed to industrial air and water pollution.', population: 79000 },
            { id: 'zone_commercial', name: 'Anna Salai / T. Nagar', type: 'COMMERCIAL', description: 'Commercial spine of Chennai with high pedestrian and vehicle density.', population: 63000 },
            { id: 'zone_waterfront', name: 'Adyar River Estuary', type: 'ECOLOGICAL', description: 'Critically polluted estuary at the edge of the city — major flood risk zone.', population: 16000 },
            { id: 'zone_transport', name: 'Kathipara Junction', type: 'TRANSPORT', description: 'Asia\'s largest cloverleaf interchange — perpetually congested.', population: 22000 },
        ],
        ecology: {
            flora: ['Copper Pod', 'Indian Beech', 'Tropical Almond', 'Palmyra Palm'],
            fauna: ['Olive Ridley Turtle', 'Blackbuck (Guindy)', 'Jackal', 'Star Tortoise'],
            conservation_projects: ['Adyar Estuary Restoration', 'Pallikaranai Marsh Conservation', 'Sea Turtle Protection Force'],
        },
    },
    {
        id: 'kolkata',
        name: 'Kolkata',
        state: 'West Bengal',
        country: 'India',
        lat: 22.572,
        lng: 88.364,
        population_millions: 14.8,
        riskMultiplier: 1.2,
        baseAqi: 178,
        tagline: 'Hooghly industrial corridor, flooding East Calcutta Wetlands',
        zones: [
            { id: 'zone_industrial', name: 'Howrah Industrial Belt', type: 'INDUSTRIAL', description: 'Heavy engineering and foundry cluster on the west bank of Hooghly.', population: 48000 },
            { id: 'zone_residential', name: 'Garden Reach', type: 'RESIDENTIAL', description: 'Densely populated South Kolkata zone with aging water infrastructure.', population: 82000 },
            { id: 'zone_commercial', name: 'BBD Bagh / Park Street', type: 'COMMERCIAL', description: 'Kolkata\'s central business node with severe pedestrian and vehicular overcrowding.', population: 55000 },
            { id: 'zone_waterfront', name: 'East Kolkata Wetlands', type: 'ECOLOGICAL', description: 'UNESCO-recognized sewage-fed wetlands — under acute encroachment pressure.', population: 19000 },
            { id: 'zone_transport', name: 'Gariahat–Ultadanga Corridor', type: 'TRANSPORT', description: 'North-south arterial corridor with chronic vehicle overloading.', population: 36000 },
        ],
        ecology: {
            flora: ['Sundari (Mangrove)', 'Royal Palm', 'Banyan', 'Ashoka Tree'],
            fauna: ['Fishing Cat', 'Gangetic Dolphin', 'Common Langur', 'Yellow Monitor'],
            conservation_projects: ['East Kolkata Wetlands Protection', 'Hooghly Riverfront Biome', 'Sundarbans Peripheral Support'],
        },
    },
    {
        id: 'pune',
        name: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        lat: 18.520,
        lng: 73.856,
        population_millions: 7.2,
        riskMultiplier: 0.82,
        baseAqi: 95,
        tagline: 'Mula-Mutha sewage crisis and Pimpri-Chinchwad emissions',
        zones: [
            { id: 'zone_industrial', name: 'Pimpri-Chinchwad MIDC', type: 'INDUSTRIAL', description: 'Pune\'s largest industrial township with auto manufacturing and chemical plants.', population: 35000 },
            { id: 'zone_residential', name: 'Hadapsar', type: 'RESIDENTIAL', description: 'Fast-growing residential zone with water scarcity and air quality concerns.', population: 71000 },
            { id: 'zone_commercial', name: 'Shivajinagar / Deccan', type: 'COMMERCIAL', description: 'Pune\'s commercial and educational hub with high traffic gridlock.', population: 48000 },
            { id: 'zone_waterfront', name: 'Mula-Mutha River Confluence', type: 'ECOLOGICAL', description: 'Highly polluted river confluence at the heart of Pune — sewage discharge hotspot.', population: 13000 },
            { id: 'zone_transport', name: 'Swargate Junction', type: 'TRANSPORT', description: 'Central bus and rickshaw hub with maximum road congestion in Pune.', population: 20000 },
        ],
        ecology: {
            flora: ['Banyan', 'Peepal', 'Silver Oak', 'Flame of the Forest'],
            fauna: ['Chinkara', 'Greater Flamingo', 'Indian Giant Squirrel', 'Barking Deer'],
            conservation_projects: ['Mula-Mutha River Restoration', 'Vetal Tekdi Preservation', 'Urban Forest initiative'],
        },
    },
    {
        id: 'ahmedabad',
        name: 'Ahmedabad',
        state: 'Gujarat',
        country: 'India',
        lat: 23.022,
        lng: 72.571,
        population_millions: 8.4,
        riskMultiplier: 1.1,
        baseAqi: 162,
        tagline: 'Sabarmati industrial effluents and textile dye pollution',
        zones: [
            { id: 'zone_industrial', name: 'Vatva Chemical Industrial Zone', type: 'INDUSTRIAL', description: 'One of India\'s most polluted industrial clusters — textile dyes and chemicals.', population: 29000 },
            { id: 'zone_residential', name: 'Bapunagar', type: 'RESIDENTIAL', description: 'Dense north-east residential area adjacent to industrial zones.', population: 66000 },
            { id: 'zone_commercial', name: 'CG Road / Navrangpura', type: 'COMMERCIAL', description: 'Ahmedabad\'s prime commercial corridor with peak vehicle traffic.', population: 44000 },
            { id: 'zone_waterfront', name: 'Sabarmati Riverfront', type: 'ECOLOGICAL', description: 'Revitalized but under-stress riverfront — industrial effluent upstream threatens it.', population: 17000 },
            { id: 'zone_transport', name: 'Sarkhej–Gandhinagar Highway', type: 'TRANSPORT', description: 'The busiest commuter and freight corridor in Gujarat.', population: 26000 },
        ],
        ecology: {
            flora: ['Babul', 'Kala Kikar', 'Rohida', 'Neem'],
            fauna: ['Greater Flamingo', 'Indian Wild Ass', 'Sarus Crane', 'Blackbuck'],
            conservation_projects: ['Sabarmati Riverfront Biodiversity', 'Thol Lake Conservation', 'Green Ahmedabad Mission'],
        },
    },
    {
        id: 'jaipur',
        name: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        lat: 26.912,
        lng: 75.787,
        population_millions: 4.1,
        riskMultiplier: 0.92,
        baseAqi: 143,
        tagline: 'Water scarcity, marble dust, and heritage zone air quality',
        zones: [
            { id: 'zone_industrial', name: 'Sitapura Industrial Area', type: 'INDUSTRIAL', description: 'Jaipur\'s major industrial zone with gems, textiles, and chemical units.', population: 18000 },
            { id: 'zone_residential', name: 'Vaishali Nagar', type: 'RESIDENTIAL', description: 'West Jaipur residential suburb facing groundwater depletion.', population: 54000 },
            { id: 'zone_commercial', name: 'MI Road / Pink City Core', type: 'COMMERCIAL', description: 'Heritage commercial zone heavily frequented by tourists and traders.', population: 38000 },
            { id: 'zone_waterfront', name: 'Man Sagar Lake', type: 'ECOLOGICAL', description: 'Jal Mahal lake — drying under heat waves and groundwater extraction pressure.', population: 8000 },
            { id: 'zone_transport', name: 'Ajmer Road–200 Feet Bypass', type: 'TRANSPORT', description: 'Most congested arterial route from the Pink City to the Western suburbs.', population: 15000 },
        ],
        ecology: {
            flora: ['Dhok', 'Salai', 'Khejri', 'Sickle Bush'],
            fauna: ['Desert Fox', 'Chinkara', 'Leopard (Jhalana)', 'Indian Gazelle'],
            conservation_projects: ['Nahargarh Biological Park', 'Aravalli Reforestation', 'Jhalana Leopard Reserve Program'],
        },
    },
    {
        id: 'lucknow',
        name: 'Lucknow',
        state: 'Uttar Pradesh',
        country: 'India',
        lat: 26.846,
        lng: 80.946,
        population_millions: 4.6,
        riskMultiplier: 1.05,
        baseAqi: 168,
        tagline: 'Gomti pollution, slum flooding, and winter smog',
        zones: [
            { id: 'zone_industrial', name: 'Amausi Export Zone', type: 'INDUSTRIAL', description: 'Industrial and logistics cluster near the airport with emission concerns.', population: 21000 },
            { id: 'zone_residential', name: 'Rajajipuram', type: 'RESIDENTIAL', description: 'Densely populated west Lucknow zone prone to flooding and sewage overflow.', population: 61000 },
            { id: 'zone_commercial', name: 'Hazratganj / Gomtinagar', type: 'COMMERCIAL', description: 'Lucknow\'s prime retail and government zone with high footfall.', population: 46000 },
            { id: 'zone_waterfront', name: 'Gomti Riverfront', type: 'ECOLOGICAL', description: 'The Gomti — heavily burdened with untreated municipal sewage and industrial waste.', population: 11000 },
            { id: 'zone_transport', name: 'Alambagh Bus Terminal Corridor', type: 'TRANSPORT', description: 'Lucknow\'s biggest inter-city and urban transit chokepoint.', population: 19000 },
        ],
        ecology: {
            flora: ['Mango (Dasheri)', 'Mahua', 'Shisham', 'Ashok'],
            fauna: ['Nilgai', 'Golden Jackal', 'Sarus Crane', 'Indian Grey Mongoose'],
            conservation_projects: ['Gomti Riverfront Greening', 'Lucknow Botanical Hub', 'Kukrail Forest Conservation'],
        },
    },
];

export const DEFAULT_CITY_ID = 'bengaluru';

export function getCityById(id: string): CityProfile {
    return INDIAN_CITIES.find((c) => c.id === id) ?? INDIAN_CITIES[0];
}
