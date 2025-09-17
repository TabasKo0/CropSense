import { useState, useEffect, useCallback } from 'react';
import { weatherService, WeatherData, WEATHER_CONFIG } from '@/services/weatherService';

interface UseWeatherOptions {
  lat?: number;
  lon?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseWeatherReturn {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

/**
 * Custom hook for fetching and managing weather data
 * 
 * DURATION PARAMETERS:
 * - Uses WEATHER_CONFIG.UPDATE_INTERVAL for auto-refresh (editable in weatherService.ts)
 * - Pass custom refreshInterval to override default
 */
export const useWeather = (options: UseWeatherOptions = {}): UseWeatherReturn => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const {
    lat,
    lon,
    autoRefresh = true,
    refreshInterval = WEATHER_CONFIG.UPDATE_INTERVAL
  } = options;

  const fetchWeatherData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let weatherData: WeatherData;

      if (lat !== undefined && lon !== undefined) {
        // Use provided coordinates
        weatherData = await weatherService.getCompleteWeatherData(lat, lon);
      } else {
        // Use current location
        weatherData = await weatherService.getWeatherForCurrentLocation();
      }

      setData(weatherData);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  // Initial fetch
  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(fetchWeatherData, refreshInterval);
    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, fetchWeatherData]);

  return {
    data,
    loading,
    error,
    refetch: fetchWeatherData,
    lastUpdated
  };
};

/**
 * Hook for current weather only (lighter weight)
 */
export const useCurrentWeather = (lat?: number, lon?: number) => {
  const [data, setData] = useState<WeatherData['current'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentWeather = useCallback(async () => {
    if (lat === undefined || lon === undefined) return;

    setLoading(true);
    setError(null);

    try {
      const currentWeather = await weatherService.getCurrentWeather(lat, lon);
      setData(currentWeather);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch current weather';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    fetchCurrentWeather();
  }, [fetchCurrentWeather]);

  return { data, loading, error, refetch: fetchCurrentWeather };
};