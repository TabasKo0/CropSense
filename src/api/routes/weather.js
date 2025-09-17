import express from 'express';

const router = express.Router();

// Mock weather data
const mockWeatherData = {
  current: {
    location: 'Iowa, USA',
    temperature: 72,
    humidity: 65,
    windSpeed: 8.5,
    windDirection: 'SW',
    pressure: 30.15,
    visibility: 10,
    uvIndex: 6,
    precipitation: 0,
    conditions: 'Partly Cloudy',
    timestamp: new Date().toISOString()
  },
  forecast: [
    {
      date: '2024-09-18',
      day: 'Today',
      high: 78,
      low: 58,
      humidity: 70,
      precipitation: 15,
      windSpeed: 12,
      conditions: 'Scattered Showers',
      agricultural: {
        soilMoisture: 'Adequate',
        fieldConditions: 'Good for planting',
        pestRisk: 'Low',
        diseaseRisk: 'Medium'
      }
    },
    {
      date: '2024-09-19',
      day: 'Tomorrow',
      high: 75,
      low: 55,
      humidity: 60,
      precipitation: 5,
      windSpeed: 8,
      conditions: 'Mostly Sunny',
      agricultural: {
        soilMoisture: 'Good',
        fieldConditions: 'Excellent for fieldwork',
        pestRisk: 'Low',
        diseaseRisk: 'Low'
      }
    },
    {
      date: '2024-09-20',
      day: 'Friday',
      high: 80,
      low: 62,
      humidity: 55,
      precipitation: 0,
      windSpeed: 6,
      conditions: 'Sunny',
      agricultural: {
        soilMoisture: 'Declining',
        fieldConditions: 'Perfect for harvest',
        pestRisk: 'Medium',
        diseaseRisk: 'Low'
      }
    },
    {
      date: '2024-09-21',
      day: 'Saturday',
      high: 82,
      low: 65,
      humidity: 50,
      precipitation: 0,
      windSpeed: 5,
      conditions: 'Sunny',
      agricultural: {
        soilMoisture: 'Low',
        fieldConditions: 'Consider irrigation',
        pestRisk: 'Medium',
        diseaseRisk: 'Low'
      }
    },
    {
      date: '2024-09-22',
      day: 'Sunday',
      high: 79,
      low: 60,
      humidity: 65,
      precipitation: 25,
      windSpeed: 10,
      conditions: 'Thunderstorms',
      agricultural: {
        soilMoisture: 'Increasing',
        fieldConditions: 'Avoid heavy machinery',
        pestRisk: 'Low',
        diseaseRisk: 'High'
      }
    }
  ],
  alerts: [
    {
      id: 'alert-001',
      type: 'Agricultural Advisory',
      severity: 'Medium',
      title: 'Optimal Harvest Window',
      message: 'Conditions favorable for corn harvest over next 3 days',
      startDate: '2024-09-19',
      endDate: '2024-09-21',
      recommendations: [
        'Begin harvest operations Friday morning',
        'Complete critical fields before Sunday storms',
        'Monitor grain moisture levels'
      ]
    }
  ]
};

// Agricultural zones data
const mockZones = [
  {
    id: 'zone-001',
    name: 'Corn Belt - Iowa',
    coordinates: { lat: 41.878, lng: -93.097 },
    cropZones: ['5a', '5b', '6a'],
    primaryCrops: ['Corn', 'Soybeans', 'Hay'],
    soilTypes: ['Mollisols', 'Alfisols'],
    averageRainfall: 36.5,
    growingSeason: { start: 'April 15', end: 'October 15' }
  },
  {
    id: 'zone-002',
    name: 'Great Plains - Nebraska',
    coordinates: { lat: 40.809, lng: -96.675 },
    cropZones: ['5a', '5b'],
    primaryCrops: ['Wheat', 'Corn', 'Sorghum'],
    soilTypes: ['Mollisols', 'Entisols'],
    averageRainfall: 28.8,
    growingSeason: { start: 'April 1', end: 'October 31' }
  }
];

// GET /api/weather/current - Get current weather conditions
router.get('/current', (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    // Simulate different locations
    let weatherData = { ...mockWeatherData.current };
    if (lat && lng) {
      weatherData.location = `${lat}, ${lng}`;
      // Slightly randomize data based on location
      weatherData.temperature += Math.floor(Math.random() * 10 - 5);
      weatherData.humidity += Math.floor(Math.random() * 20 - 10);
    }
    
    res.json({
      success: true,
      data: weatherData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current weather',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/weather/forecast - Get weather forecast
router.get('/forecast', (req, res) => {
  try {
    const { days = 5, lat, lng } = req.query;
    const numDays = Math.min(parseInt(days), 7);
    
    let forecastData = mockWeatherData.forecast.slice(0, numDays);
    
    if (lat && lng) {
      // Adjust forecast data based on location
      forecastData = forecastData.map(day => ({
        ...day,
        high: day.high + Math.floor(Math.random() * 10 - 5),
        low: day.low + Math.floor(Math.random() * 8 - 4)
      }));
    }
    
    res.json({
      success: true,
      data: {
        location: lat && lng ? `${lat}, ${lng}` : mockWeatherData.current.location,
        forecast: forecastData,
        alerts: mockWeatherData.alerts
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather forecast',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/weather/agricultural - Get agricultural weather insights
router.get('/agricultural', (req, res) => {
  try {
    const insights = {
      growingDegreeDays: {
        accumulated: 2847,
        target: 3200,
        percentage: 89,
        crop: 'Corn',
        maturityPrediction: '2024-09-25'
      },
      soilConditions: {
        temperature: 65,
        moisture: 22,
        status: 'Good',
        recommendation: 'Optimal for planting cool season crops'
      },
      farmingTasks: {
        recommended: [
          {
            task: 'Harvest corn',
            priority: 'High',
            window: '2024-09-19 to 2024-09-21',
            reason: 'Optimal moisture and weather conditions'
          },
          {
            task: 'Plant winter wheat',
            priority: 'Medium',
            window: '2024-09-22 to 2024-09-28',
            reason: 'After rain, good soil moisture for germination'
          }
        ],
        avoid: [
          {
            task: 'Heavy field work',
            period: '2024-09-22',
            reason: 'Thunderstorms expected, soil will be too wet'
          }
        ]
      },
      pestAndDisease: {
        risk: 'Medium',
        threats: [
          {
            pest: 'Corn Borer',
            probability: 35,
            action: 'Monitor adult moth activity'
          },
          {
            disease: 'Gray Leaf Spot',
            probability: 60,
            action: 'Apply fungicide if threshold exceeded'
          }
        ]
      }
    };
    
    res.json({
      success: true,
      data: insights,
      validFor: '24 hours',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agricultural insights',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/weather/zones - Get agricultural zones
router.get('/zones', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockZones,
      total: mockZones.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agricultural zones',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/weather/alerts - Get weather alerts
router.get('/alerts', (req, res) => {
  try {
    const { severity, active } = req.query;
    let alerts = [...mockWeatherData.alerts];
    
    if (severity) {
      alerts = alerts.filter(alert => 
        alert.severity.toLowerCase() === severity.toLowerCase()
      );
    }
    
    if (active === 'true') {
      const now = new Date();
      alerts = alerts.filter(alert => {
        const start = new Date(alert.startDate);
        const end = new Date(alert.endDate);
        return now >= start && now <= end;
      });
    }
    
    res.json({
      success: true,
      data: alerts,
      total: alerts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather alerts',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;