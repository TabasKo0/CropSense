import type { 
  ApiResponse, 
  CropAnalysis, 
  CurrentWeather, 
  WeatherForecast,
  Seller,
  Product,
  Quote,
  ApiFilters 
} from '../types/index.js';

/**
 * Base API client configuration
 */
export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Default API configuration
 */
export const defaultConfig: ApiConfig = {
  baseUrl: 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Generic fetch wrapper with error handling
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  config: ApiConfig = defaultConfig
): Promise<ApiResponse<T>> {
  const url = `${config.baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...config.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

/**
 * Build query string from filters object
 */
export function buildQueryString(filters: ApiFilters): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Crop Analysis API utilities
 */
export class CropAnalysisAPI {
  static async getAll(filters?: ApiFilters): Promise<ApiResponse<CropAnalysis[]>> {
    const queryString = filters ? buildQueryString(filters) : '';
    return apiRequest<CropAnalysis[]>(`/api/crop-analysis${queryString}`);
  }

  static async getById(id: string): Promise<ApiResponse<CropAnalysis>> {
    return apiRequest<CropAnalysis>(`/api/crop-analysis/${id}`);
  }

  static async create(data: Partial<CropAnalysis>): Promise<ApiResponse<CropAnalysis>> {
    return apiRequest<CropAnalysis>('/api/crop-analysis', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getRecommendations(id: string) {
    return apiRequest(`/api/crop-analysis/${id}/recommendations`);
  }
}

/**
 * Weather API utilities
 */
export class WeatherAPI {
  static async getCurrent(lat?: number, lng?: number): Promise<ApiResponse<CurrentWeather>> {
    const queryString = lat && lng ? buildQueryString({ lat, lng }) : '';
    return apiRequest<CurrentWeather>(`/api/weather/current${queryString}`);
  }

  static async getForecast(days?: number, lat?: number, lng?: number) {
    const filters: ApiFilters = {};
    if (days) filters.days = days;
    if (lat) filters.lat = lat;
    if (lng) filters.lng = lng;
    
    const queryString = buildQueryString(filters);
    return apiRequest(`/api/weather/forecast${queryString}`);
  }

  static async getAgricultural() {
    return apiRequest('/api/weather/agricultural');
  }

  static async getZones() {
    return apiRequest('/api/weather/zones');
  }

  static async getAlerts(filters?: ApiFilters) {
    const queryString = filters ? buildQueryString(filters) : '';
    return apiRequest(`/api/weather/alerts${queryString}`);
  }
}

/**
 * Marketplace API utilities
 */
export class MarketplaceAPI {
  static async getSellers(filters?: ApiFilters): Promise<ApiResponse<Seller[]>> {
    const queryString = filters ? buildQueryString(filters) : '';
    return apiRequest<Seller[]>(`/api/marketplace/sellers${queryString}`);
  }

  static async getSellerById(id: string): Promise<ApiResponse<Seller>> {
    return apiRequest<Seller>(`/api/marketplace/sellers/${id}`);
  }

  static async getProducts(filters?: ApiFilters): Promise<ApiResponse<Product[]>> {
    const queryString = filters ? buildQueryString(filters) : '';
    return apiRequest<Product[]>(`/api/marketplace/products${queryString}`);
  }

  static async getProductById(id: string): Promise<ApiResponse<Product>> {
    return apiRequest<Product>(`/api/marketplace/products/${id}`);
  }

  static async requestQuote(quoteData: Partial<Quote>): Promise<ApiResponse<Quote>> {
    return apiRequest<Quote>('/api/marketplace/quote', {
      method: 'POST',
      body: JSON.stringify(quoteData),
    });
  }

  static async getCategories() {
    return apiRequest('/api/marketplace/categories');
  }
}

/**
 * Authentication API utilities
 */
export class AuthAPI {
  static async signup(username: string, email: string, password: string) {
    return apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  static async signin(username: string, password: string) {
    return apiRequest('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  static async getProfile(token: string) {
    return apiRequest('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  static async logout(token: string) {
    return apiRequest('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

/**
 * Error handling utility
 */
export function handleApiError(error: any): string {
  if (error.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Response validation utility
 */
export function isValidApiResponse<T>(response: any): response is ApiResponse<T> {
  return (
    response &&
    typeof response === 'object' &&
    typeof response.success === 'boolean' &&
    typeof response.timestamp === 'string'
  );
}

/**
 * Data formatting utilities
 */
export const formatters = {
  currency: (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  },

  percentage: (value: number): string => {
    return `${Math.round(value * 100)}%`;
  },

  date: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  temperature: (temp: number): string => {
    return `${Math.round(temp)}°F`;
  },

  weight: (weight: number, unit: string = 'lbs'): string => {
    return `${weight.toLocaleString()} ${unit}`;
  },

  area: (area: number, unit: string = 'acres'): string => {
    return `${area.toFixed(1)} ${unit}`;
  },
};

export default {
  CropAnalysisAPI,
  WeatherAPI,
  MarketplaceAPI,
  AuthAPI,
  buildQueryString,
  handleApiError,
  isValidApiResponse,
  formatters,
};