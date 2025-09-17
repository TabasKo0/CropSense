import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock marketplace data
const mockSellers = [
  {
    id: 'seller-001',
    name: 'GreenHarvest Supplies',
    rating: 4.9,
    location: 'Iowa, USA',
    speciality: 'Organic Fertilizers',
    verified: true,
    established: '2018',
    totalSales: 1247,
    products: ['NPK Blends', 'Compost', 'Bio-stimulants'],
    contact: {
      email: 'contact@greenharvest.com',
      phone: '+1-515-555-0123',
      website: 'https://greenharvest.com'
    },
    certifications: ['OMRI Listed', 'USDA Organic', 'ISO 9001'],
    shippingZones: ['Iowa', 'Illinois', 'Minnesota', 'Wisconsin'],
    responseTime: '< 2 hours'
  },
  {
    id: 'seller-002',
    name: 'PrecisionAg Tools',
    rating: 4.8,
    location: 'Nebraska, USA',
    speciality: 'Smart Equipment',
    verified: true,
    established: '2015',
    totalSales: 892,
    products: ['Soil Sensors', 'Irrigation Systems', 'Drones'],
    contact: {
      email: 'sales@precisionag.com',
      phone: '+1-402-555-0198',
      website: 'https://precisionag.com'
    },
    certifications: ['FCC Certified', 'CE Marked', 'RoHS Compliant'],
    shippingZones: ['Nebraska', 'Kansas', 'Oklahoma', 'Colorado'],
    responseTime: '< 4 hours'
  },
  {
    id: 'seller-003',
    name: 'Heritage Seeds Co.',
    rating: 4.7,
    location: 'Kansas, USA',
    speciality: 'Premium Seeds',
    verified: true,
    established: '2012',
    totalSales: 2156,
    products: ['Corn Seeds', 'Soybean Seeds', 'Cover Crops'],
    contact: {
      email: 'orders@heritageseeds.com',
      phone: '+1-620-555-0176',
      website: 'https://heritageseeds.com'
    },
    certifications: ['AOSCA Certified', 'Non-GMO Project', 'Seed Quality Certified'],
    shippingZones: ['Kansas', 'Oklahoma', 'Texas', 'Missouri'],
    responseTime: '< 1 hour'
  }
];

const mockProducts = [
  {
    id: 'prod-001',
    sellerId: 'seller-001',
    name: 'Premium NPK 15-15-15 Fertilizer',
    category: 'Fertilizers',
    subcategory: 'Granular Fertilizers',
    price: 28.99,
    unit: '50 lb bag',
    description: 'Balanced granular fertilizer perfect for corn and soybean production',
    features: ['Slow-release formula', 'Organic certified', 'Weather resistant'],
    specifications: {
      nitrogen: '15%',
      phosphorus: '15%',
      potassium: '15%',
      coverage: '2,500 sq ft',
      applicationRate: '2-3 lbs per 1,000 sq ft'
    },
    inStock: true,
    stockQuantity: 1250,
    minimumOrder: 10,
    bulkPricing: [
      { quantity: 50, pricePerUnit: 26.99 },
      { quantity: 100, pricePerUnit: 24.99 },
      { quantity: 500, pricePerUnit: 22.99 }
    ],
    shipping: {
      cost: 15.99,
      estimatedDays: '3-5',
      freeShippingThreshold: 500
    },
    rating: 4.8,
    reviews: 156,
    tags: ['organic', 'slow-release', 'all-purpose']
  },
  {
    id: 'prod-002',
    sellerId: 'seller-002',
    name: 'SmartSoil Pro Moisture Sensor',
    category: 'Equipment',
    subcategory: 'Monitoring Systems',
    price: 189.99,
    unit: 'per sensor',
    description: 'Wireless soil moisture and temperature monitoring system',
    features: ['Real-time monitoring', 'Mobile app connectivity', '2-year battery life'],
    specifications: {
      range: '300 ft wireless',
      depth: '6-12 inches',
      accuracy: '±3%',
      batteryLife: '24 months',
      connectivity: 'LoRa/WiFi'
    },
    inStock: true,
    stockQuantity: 75,
    minimumOrder: 1,
    bulkPricing: [
      { quantity: 5, pricePerUnit: 179.99 },
      { quantity: 10, pricePerUnit: 169.99 },
      { quantity: 25, pricePerUnit: 159.99 }
    ],
    shipping: {
      cost: 12.99,
      estimatedDays: '2-4',
      freeShippingThreshold: 200
    },
    rating: 4.9,
    reviews: 89,
    tags: ['smart-farming', 'wireless', 'precision-ag']
  },
  {
    id: 'prod-003',
    sellerId: 'seller-003',
    name: 'Elite Corn Seed - Variety XR4820',
    category: 'Seeds',
    subcategory: 'Corn Seeds',
    price: 145.00,
    unit: '50,000 kernel bag',
    description: 'High-yield corn variety optimized for Midwest growing conditions',
    features: ['110-day maturity', 'Disease resistant', 'High yield potential'],
    specifications: {
      maturity: '110 days',
      yieldPotential: '200+ bu/acre',
      plantingRate: '32,000-36,000 seeds/acre',
      germination: '95%+',
      traits: 'Non-GMO'
    },
    inStock: true,
    stockQuantity: 45,
    minimumOrder: 1,
    bulkPricing: [
      { quantity: 5, pricePerUnit: 139.99 },
      { quantity: 10, pricePerUnit: 134.99 },
      { quantity: 20, pricePerUnit: 129.99 }
    ],
    shipping: {
      cost: 25.99,
      estimatedDays: '5-7',
      freeShippingThreshold: 1000
    },
    rating: 4.7,
    reviews: 203,
    tags: ['high-yield', 'disease-resistant', 'non-gmo']
  }
];

// GET /api/marketplace/sellers - Get all sellers
router.get('/sellers', (req, res) => {
  try {
    const { speciality, location, verified, rating } = req.query;
    let filteredSellers = [...mockSellers];
    
    if (speciality) {
      filteredSellers = filteredSellers.filter(seller =>
        seller.speciality.toLowerCase().includes(speciality.toLowerCase())
      );
    }
    
    if (location) {
      filteredSellers = filteredSellers.filter(seller =>
        seller.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    if (verified === 'true') {
      filteredSellers = filteredSellers.filter(seller => seller.verified);
    }
    
    if (rating) {
      const minRating = parseFloat(rating);
      filteredSellers = filteredSellers.filter(seller => seller.rating >= minRating);
    }
    
    res.json({
      success: true,
      data: filteredSellers,
      total: filteredSellers.length,
      filters: { speciality, location, verified, rating },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sellers',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/marketplace/sellers/:id - Get specific seller
router.get('/sellers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const seller = mockSellers.find(s => s.id === id);
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get seller's products
    const sellerProducts = mockProducts.filter(p => p.sellerId === id);
    
    res.json({
      success: true,
      data: {
        ...seller,
        products: sellerProducts
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seller details',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/marketplace/products - Get all products
router.get('/products', (req, res) => {
  try {
    const { category, subcategory, minPrice, maxPrice, inStock, search } = req.query;
    let filteredProducts = [...mockProducts];
    
    if (category) {
      filteredProducts = filteredProducts.filter(product =>
        product.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (subcategory) {
      filteredProducts = filteredProducts.filter(product =>
        product.subcategory.toLowerCase() === subcategory.toLowerCase()
      );
    }
    
    if (minPrice) {
      filteredProducts = filteredProducts.filter(product =>
        product.price >= parseFloat(minPrice)
      );
    }
    
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(product =>
        product.price <= parseFloat(maxPrice)
      );
    }
    
    if (inStock === 'true') {
      filteredProducts = filteredProducts.filter(product => product.inStock);
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    res.json({
      success: true,
      data: filteredProducts,
      total: filteredProducts.length,
      filters: { category, subcategory, minPrice, maxPrice, inStock, search },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/marketplace/products/:id - Get specific product
router.get('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const product = mockProducts.find(p => p.id === id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get seller information
    const seller = mockSellers.find(s => s.id === product.sellerId);
    
    res.json({
      success: true,
      data: {
        ...product,
        seller: seller
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product details',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/marketplace/quote - Request a quote
router.post('/quote', (req, res) => {
  try {
    const { productId, sellerId, quantity, message, contactInfo } = req.body;
    
    if (!productId || !sellerId || !quantity || !contactInfo) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: productId, sellerId, quantity, contactInfo',
        timestamp: new Date().toISOString()
      });
    }
    
    const product = mockProducts.find(p => p.id === productId);
    const seller = mockSellers.find(s => s.id === sellerId);
    
    if (!product || !seller) {
      return res.status(404).json({
        success: false,
        error: 'Product or seller not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Calculate pricing based on quantity
    let unitPrice = product.price;
    if (product.bulkPricing) {
      const applicableTier = product.bulkPricing
        .filter(tier => quantity >= tier.quantity)
        .sort((a, b) => b.quantity - a.quantity)[0];
      
      if (applicableTier) {
        unitPrice = applicableTier.pricePerUnit;
      }
    }
    
    const subtotal = unitPrice * quantity;
    const shipping = quantity * unitPrice >= product.shipping.freeShippingThreshold 
      ? 0 
      : product.shipping.cost;
    const total = subtotal + shipping;
    
    const quote = {
      id: uuidv4(),
      productId,
      sellerId,
      quantity,
      unitPrice,
      subtotal,
      shipping,
      total,
      estimatedDelivery: product.shipping.estimatedDays,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      message,
      contactInfo,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      data: quote,
      message: 'Quote request submitted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create quote request',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/marketplace/categories - Get product categories
router.get('/categories', (req, res) => {
  try {
    const categories = [
      {
        name: 'Fertilizers',
        subcategories: ['Granular Fertilizers', 'Liquid Fertilizers', 'Organic Fertilizers'],
        productCount: 45
      },
      {
        name: 'Seeds',
        subcategories: ['Corn Seeds', 'Soybean Seeds', 'Cover Crops', 'Vegetable Seeds'],
        productCount: 128
      },
      {
        name: 'Equipment',
        subcategories: ['Monitoring Systems', 'Irrigation Equipment', 'Harvest Equipment'],
        productCount: 67
      },
      {
        name: 'Pesticides',
        subcategories: ['Herbicides', 'Insecticides', 'Fungicides', 'Organic Pesticides'],
        productCount: 89
      },
      {
        name: 'Tools',
        subcategories: ['Hand Tools', 'Power Tools', 'Measuring Equipment'],
        productCount: 34
      }
    ];
    
    res.json({
      success: true,
      data: categories,
      total: categories.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;