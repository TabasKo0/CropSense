import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock data for crop analysis
const mockCropData = [
  {
    id: '1',
    cropType: 'Corn',
    fieldId: 'field-001',
    area: 45.5,
    soilType: 'Loamy',
    plantingDate: '2024-04-15',
    expectedHarvest: '2024-09-20',
    currentStage: 'Vegetative Growth',
    healthScore: 85,
    yieldPrediction: 180.5,
    recommendations: [
      'Increase nitrogen fertilizer by 10%',
      'Monitor for corn borer infestation',
      'Optimal irrigation: 1.5 inches per week'
    ],
    soilAnalysis: {
      ph: 6.8,
      nitrogen: 45,
      phosphorus: 28,
      potassium: 165,
      organicMatter: 3.2,
      moisture: 22
    },
    satelliteData: {
      ndvi: 0.75,
      lastUpdated: '2024-09-15T10:30:00Z',
      cloudCover: 15,
      resolution: '10m'
    }
  },
  {
    id: '2',
    cropType: 'Soybeans',
    fieldId: 'field-002',
    area: 32.0,
    soilType: 'Clay Loam',
    plantingDate: '2024-05-01',
    expectedHarvest: '2024-10-10',
    currentStage: 'Pod Development',
    healthScore: 92,
    yieldPrediction: 55.2,
    recommendations: [
      'Apply potassium supplement',
      'Monitor for aphid activity',
      'Reduce irrigation frequency'
    ],
    soilAnalysis: {
      ph: 7.1,
      nitrogen: 38,
      phosphorus: 35,
      potassium: 142,
      organicMatter: 4.1,
      moisture: 28
    },
    satelliteData: {
      ndvi: 0.82,
      lastUpdated: '2024-09-15T10:30:00Z',
      cloudCover: 8,
      resolution: '10m'
    }
  }
];

// GET /api/crop-analysis - Get all crop analyses
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockCropData,
      total: mockCropData.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crop analysis data',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/crop-analysis/:id - Get specific crop analysis
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const crop = mockCropData.find(c => c.id === id);
    
    if (!crop) {
      return res.status(404).json({
        success: false,
        error: 'Crop analysis not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: crop,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crop analysis',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/crop-analysis - Create new crop analysis
router.post('/', (req, res) => {
  try {
    const { cropType, fieldId, area, soilType, plantingDate } = req.body;
    
    if (!cropType || !fieldId || !area) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: cropType, fieldId, area',
        timestamp: new Date().toISOString()
      });
    }
    
    const newAnalysis = {
      id: uuidv4(),
      cropType,
      fieldId,
      area,
      soilType: soilType || 'Unknown',
      plantingDate: plantingDate || new Date().toISOString().split('T')[0],
      expectedHarvest: null,
      currentStage: 'Newly Planted',
      healthScore: Math.floor(Math.random() * 20) + 70, // Random score 70-90
      yieldPrediction: Math.floor(Math.random() * 50) + 100,
      recommendations: [
        'Initial soil preparation complete',
        'Monitor germination progress',
        'Establish irrigation schedule'
      ],
      soilAnalysis: {
        ph: (Math.random() * 2 + 6).toFixed(1),
        nitrogen: Math.floor(Math.random() * 30) + 30,
        phosphorus: Math.floor(Math.random() * 20) + 20,
        potassium: Math.floor(Math.random() * 50) + 120,
        organicMatter: (Math.random() * 2 + 2).toFixed(1),
        moisture: Math.floor(Math.random() * 15) + 15
      },
      satelliteData: {
        ndvi: (Math.random() * 0.3 + 0.5).toFixed(2),
        lastUpdated: new Date().toISOString(),
        cloudCover: Math.floor(Math.random() * 30),
        resolution: '10m'
      }
    };
    
    res.status(201).json({
      success: true,
      data: newAnalysis,
      message: 'Crop analysis created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create crop analysis',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/crop-analysis/:id/recommendations - Get AI recommendations
router.get('/:id/recommendations', (req, res) => {
  try {
    const { id } = req.params;
    const crop = mockCropData.find(c => c.id === id);
    
    if (!crop) {
      return res.status(404).json({
        success: false,
        error: 'Crop analysis not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const aiRecommendations = {
      fertilizer: {
        type: 'NPK 15-15-15',
        amount: '200 lbs/acre',
        timing: 'Next 2 weeks',
        reason: 'Soil analysis shows balanced nutrient needs'
      },
      irrigation: {
        frequency: '3 times per week',
        amount: '1.2 inches',
        timing: 'Early morning (6-8 AM)',
        reason: 'Optimal moisture retention and reduced evaporation'
      },
      pestControl: {
        treatment: 'Integrated Pest Management',
        monitoring: 'Weekly field scouting',
        threshold: '5% damage threshold',
        reason: 'Preventive approach based on current pest pressure'
      },
      harvest: {
        estimatedDate: crop.expectedHarvest,
        qualityPrediction: 'Premium Grade A',
        yieldConfidence: '85%',
        reason: 'Favorable growing conditions and healthy plant development'
      }
    };
    
    res.json({
      success: true,
      data: aiRecommendations,
      cropId: id,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;