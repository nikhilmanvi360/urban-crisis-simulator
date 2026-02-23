# CitySentinel AI Dashboard

A comprehensive React-based crisis management dashboard for city administrators to visualize real-time risk assessments, run policy simulations, and make data-driven decisions during urban crises.

## Features

### 🎯 Dashboard (/)
- Real-time city health overview with WebSocket support
- Risk score gauge with confidence intervals
- Cascade effects monitoring (AQI, Water, Health, Traffic)
- Triggered alert systems
- Live sensor readings

### ⚡ Scenario Simulator (/simulate)
- **Single Scenario Testing**: Adjust traffic reduction, industrial cuts, and heatwave levels
- **Compare Scenarios**: Test up to 5 scenarios simultaneously with ranked results
- Before/After comparison with percentage improvements
- Crisis level projections

### 📈 7-Day Forecast (/forecast)
- ML-powered predictions for AQI and Water Stress
- Confidence bands visualization
- Peak risk identification
- Historical trend analysis

### 🎯 Policy Recommendations (/recommendations)
- AI-ranked strategies for crisis mitigation
- Efficiency scores and cost analysis
- Projected risk reduction percentages
- ROI ratings for each strategy

### 🗺️ Zone Risk Map (/zones)
- Geographic zone-based risk monitoring
- Evacuation priority alerts
- Per-zone 7-day forecasts
- Population and threat analysis
- Interactive zone detail sheets

### 📊 Historical Trends (/history)
- 7-day historical data visualization
- Multi-metric area charts
- Trend analysis (WORSENING/IMPROVING)
- Individual metric breakdowns

## Tech Stack

- **Framework**: React 18 with Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **HTTP Client**: Axios
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Real-time**: WebSocket API

## Backend APIs

The dashboard connects to:
- **REST API**: `http://localhost:5000`
- **WebSocket**: `ws://localhost:5000`
- **ML Service**: `http://localhost:8000`

All API endpoints include fallback mock data for development without backend services.

## API Endpoints Used

- `GET /status` - Current city status
- `GET /forecast` - 7-day ML predictions
- `GET /recommendations` - Policy strategies
- `GET /zones` - All zones data
- `GET /zones/:id` - Zone detail
- `GET /history` - Historical trends
- `POST /simulate` - Run single scenario
- `POST /simulate/compare` - Compare multiple scenarios

## Color Coding

Crisis levels follow consistent color coding:
- 🔴 **CRITICAL**: Red (#EF4444)
- 🟠 **HIGH**: Orange (#F97316)
- 🟡 **MODERATE**: Yellow (#EAB308)
- 🟢 **LOW/SAFE**: Green (#22C55E)

## Running the Application

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. (Optional) Start your backend services:
```bash
# Backend REST API + WebSocket
cd backend && npm start

# ML Service
cd ml-service && python app.py
```

The application will work with mock data if backend services are not available.

## Development Features

- **Mock Data Fallback**: Automatic fallback to realistic mock data when backend is offline
- **Real-time Updates**: WebSocket connection with polling fallback
- **Responsive Design**: Mobile-friendly layouts
- **Dark Theme**: Crisis management optimized dark UI
- **Error Handling**: Graceful degradation when services are unavailable

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── RootLayout.tsx      # Main navigation layout
│   │   └── ui/                  # Reusable UI components
│   ├── pages/
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── Simulate.tsx         # Scenario simulator
│   │   ├── Forecast.tsx         # ML forecasts
│   │   ├── Recommendations.tsx  # Policy strategies
│   │   ├── Zones.tsx            # Zone risk map
│   │   └── History.tsx          # Historical trends
│   ├── api.ts                   # API client & mock data
│   ├── config.ts                # API configuration
│   ├── routes.ts                # Router configuration
│   └── App.tsx                  # Root component
└── styles/
    └── theme.css                # Dark theme styles
```

## Browser Support

Modern browsers with ES6+ support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

Proprietary - CitySentinel AI Crisis Management System
