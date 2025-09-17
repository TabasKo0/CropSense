// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  total?: number;
}

// Crop Analysis Types
export interface CropAnalysis {
  id: string;
  cropType: string;
  fieldId: string;
  area: number;
  soilType: string;
  plantingDate: string;
  expectedHarvest: string | null;
  currentStage: string;
  healthScore: number;
  yieldPrediction: number;
  recommendations: string[];
  soilAnalysis: SoilAnalysis;
  satelliteData: SatelliteData;
}

export interface SoilAnalysis {
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicMatter: number;
  moisture: number;
}

export interface SatelliteData {
  ndvi: number;
  lastUpdated: string;
  cloudCover: number;
  resolution: string;
}

export interface AIRecommendations {
  fertilizer: {
    type: string;
    amount: string;
    timing: string;
    reason: string;
  };
  irrigation: {
    frequency: string;
    amount: string;
    timing: string;
    reason: string;
  };
  pestControl: {
    treatment: string;
    monitoring: string;
    threshold: string;
    reason: string;
  };
  harvest: {
    estimatedDate: string;
    qualityPrediction: string;
    yieldConfidence: string;
    reason: string;
  };
}

// Weather Types
export interface CurrentWeather {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  precipitation: number;
  conditions: string;
  timestamp: string;
}

export interface WeatherForecast {
  date: string;
  day: string;
  high: number;
  low: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  conditions: string;
  agricultural: {
    soilMoisture: string;
    fieldConditions: string;
    pestRisk: string;
    diseaseRisk: string;
  };
}

export interface WeatherAlert {
  id: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  message: string;
  startDate: string;
  endDate: string;
  recommendations: string[];
}

export interface AgriculturalZone {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  cropZones: string[];
  primaryCrops: string[];
  soilTypes: string[];
  averageRainfall: number;
  growingSeason: { start: string; end: string };
}

// Marketplace Types
export interface Seller {
  id: string;
  name: string;
  rating: number;
  location: string;
  speciality: string;
  verified: boolean;
  established: string;
  totalSales: number;
  products: string[];
  contact: {
    email: string;
    phone: string;
    website: string;
  };
  certifications: string[];
  shippingZones: string[];
  responseTime: string;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  unit: string;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  inStock: boolean;
  stockQuantity: number;
  minimumOrder: number;
  bulkPricing: BulkPricing[];
  shipping: ShippingInfo;
  rating: number;
  reviews: number;
  tags: string[];
}

export interface BulkPricing {
  quantity: number;
  pricePerUnit: number;
}

export interface ShippingInfo {
  cost: number;
  estimatedDays: string;
  freeShippingThreshold: number;
}

export interface Quote {
  id: string;
  productId: string;
  sellerId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  shipping: number;
  total: number;
  estimatedDelivery: string;
  validUntil: string;
  message?: string;
  contactInfo: ContactInfo;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
}

export interface ProductCategory {
  name: string;
  subcategories: string[];
  productCount: number;
}

// API Client Types
export interface ApiFilters {
  [key: string]: string | number | boolean | undefined;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}