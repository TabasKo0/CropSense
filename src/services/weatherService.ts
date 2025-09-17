/**
 * Weather API Service for OpenWeatherMap Integration
 * 
 * DURATION PARAMETERS - Edit these easily:
 * - FORECAST_DAYS: Number of days for weather forecast (default: 7)
 * - HISTORY_DAYS: Number of days for historical weather data (default: 30)
 * - UPDATE_INTERVAL: Auto-refresh interval in milliseconds (default: 5 minutes)
 * - CACHE_DURATION: Cache duration in milliseconds (default: 10 minutes)
 */

// =================================
// EDITABLE DURATION PARAMETERS
// =================================
const WEATHER_CONFIG = {
  FORECAST_DAYS: parseInt(import.meta.env.VITE_WEATHER_FORECAST_DAYS) || 7,
  HISTORY_DAYS: parseInt(import.meta.env.VITE_WEATHER_HISTORY_DAYS) || 30,
  UPDATE_INTERVAL: parseInt(import.meta.env.VITE_WEATHER_UPDATE_INTERVAL) || 300000, // 5 minutes
  CACHE_DURATION: 600000, // 10 minutes cache
  API_UNITS: 'metric', // 'metric', 'imperial', or 'standard'
  API_LANG: 'en' // Language for weather descriptions
};

export interface WeatherData {
  location: {
    lat: number;
    lon: number;
    name: string;
    country: string;
  };
  current: {
    temperature: number;
    humidity: number;
    rainfall: number;
    pressure: number;
    windSpeed: number;
    cloudiness: number;
    description: string;
    icon: string;
    timestamp: Date;
  };
  forecast: WeatherForecast[];
  historical: WeatherHistorical[];
}

export interface WeatherForecast {
  date: Date;
  temperature: {
    min: number;
    max: number;
    avg: number;
  };
  humidity: number;
  rainfall: number;
  pressure: number;
  windSpeed: number;
  description: string;
  icon: string;
}

export interface WeatherHistorical {
  date: Date;
  temperature: {
    min: number;
    max: number;
    avg: number;
  };
  humidity: number;
  rainfall: number;
  pressure: number;
}

class WeatherService {
  private apiKey: string;
  private baseUrl: string = 'https://api.openweathermap.org/data/2.5';
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!this.apiKey) {
      console.warn('OpenWeatherMap API key not found. Please add VITE_OPENWEATHER_API_KEY to your .env file');
    }
  }

  /**
   * Get cached data if available and not expired
   */
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < WEATHER_CONFIG.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Cache data with timestamp
   */
  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Fetch current weather data for given coordinates
   */
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData['current']> {
    const cacheKey = `current_${lat}_${lon}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${WEATHER_CONFIG.API_UNITS}&lang=${WEATHER_CONFIG.API_LANG}`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      const currentWeather = {
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        rainfall: data.rain?.['1h'] || data.rain?.['3h'] || 0,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        cloudiness: data.clouds.all,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        timestamp: new Date()
      };

      this.setCachedData(cacheKey, currentWeather);
      return currentWeather;
    } catch (error) {
      console.error('Failed to fetch current weather:', error);
      throw error;
    }
  }

  /**
   * Fetch weather forecast for the next FORECAST_DAYS days
   */
  async getWeatherForecast(lat: number, lon: number): Promise<WeatherForecast[]> {
    const cacheKey = `forecast_${lat}_${lon}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${WEATHER_CONFIG.API_UNITS}&lang=${WEATHER_CONFIG.API_LANG}`
      );
      
      if (!response.ok) {
        throw new Error(`Weather forecast API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Group forecast data by day and limit to FORECAST_DAYS
      const dailyForecast: WeatherForecast[] = [];
      const processedDays = new Set<string>();
      
      for (const item of data.list) {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();
        
        if (processedDays.has(dateKey) || dailyForecast.length >= WEATHER_CONFIG.FORECAST_DAYS) {
          continue;
        }
        
        processedDays.add(dateKey);
        
        dailyForecast.push({
          date,
          temperature: {
            min: Math.round(item.main.temp_min),
            max: Math.round(item.main.temp_max),
            avg: Math.round(item.main.temp)
          },
          humidity: item.main.humidity,
          rainfall: item.rain?.['3h'] || 0,
          pressure: item.main.pressure,
          windSpeed: item.wind.speed,
          description: item.weather[0].description,
          icon: item.weather[0].icon
        });
      }

      this.setCachedData(cacheKey, dailyForecast);
      return dailyForecast;
    } catch (error) {
      console.error('Failed to fetch weather forecast:', error);
      throw error;
    }
  }

  /**
   * Get location information from coordinates
   */
  async getLocationInfo(lat: number, lon: number): Promise<WeatherData['location']> {
    const cacheKey = `location_${lat}_${lon}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Location API error: ${response.status}`);
      }

      const data = await response.json();
      
      const locationInfo = {
        lat,
        lon,
        name: data.name,
        country: data.sys.country
      };

      this.setCachedData(cacheKey, locationInfo);
      return locationInfo;
    } catch (error) {
      console.error('Failed to fetch location info:', error);
      throw error;
    }
  }

  /**
   * Get complete weather data for a location
   */
  async getCompleteWeatherData(lat: number, lon: number): Promise<WeatherData> {
    try {
      const [location, current, forecast] = await Promise.all([
        this.getLocationInfo(lat, lon),
        this.getCurrentWeather(lat, lon),
        this.getWeatherForecast(lat, lon)
      ]);

      return {
        location,
        current,
        forecast,
        historical: [] // Historical data requires a separate paid API endpoint
      };
    } catch (error) {
      console.error('Failed to fetch complete weather data:', error);
      throw error;
    }
  }

  /**
   * Get user's current location and fetch weather data
   */
  async getWeatherForCurrentLocation(): Promise<WeatherData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const weatherData = await this.getCompleteWeatherData(latitude, longitude);
            resolve(weatherData);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          timeout: 10000,
          enableHighAccuracy: true
        }
      );
    });
  }
}

// Export singleton instance
export const weatherService = new WeatherService();

// Export configuration for easy access
export { WEATHER_CONFIG };