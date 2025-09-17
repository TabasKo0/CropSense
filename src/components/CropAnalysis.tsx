import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Thermometer, Droplets, Zap, Calendar, TrendingUp, Cloud, RefreshCw } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { useEffect, useState } from "react";

const CropAnalysis = () => {
  // Weather API Integration
  // DURATION PARAMETERS: Configure in src/services/weatherService.ts
  // - FORECAST_DAYS: Number of forecast days
  // - UPDATE_INTERVAL: Auto-refresh interval
  // - CACHE_DURATION: Cache duration
  const { data: weatherData, loading: weatherLoading, error: weatherError, refetch: refetchWeather } = useWeather({
    autoRefresh: true, // Enable auto-refresh
    // refreshInterval: 300000 // 5 minutes - customize here or use env variable
  });

  const [locationStatus, setLocationStatus] = useState<'requesting' | 'granted' | 'denied'>('requesting');

  useEffect(() => {
    // Check if weather data was fetched successfully
    if (weatherData) {
      setLocationStatus('granted');
    } else if (weatherError?.includes('Geolocation')) {
      setLocationStatus('denied');
    }
  }, [weatherData, weatherError]);

  // Format weather values for display
  const formatWeatherData = () => {
    if (!weatherData?.current) return null;
    
    const { current } = weatherData;
    return {
      temperature: `${current.temperature}°C`,
      humidity: `${current.humidity}%`,
      rainfall: current.rainfall > 0 ? `${current.rainfall}mm` : '0mm',
      location: `${weatherData.location.name}, ${weatherData.location.country}`,
      description: current.description,
      lastUpdated: current.timestamp.toLocaleTimeString()
    };
  };

  const weather = formatWeatherData();
  return (
    <section id="analysis" className="py-20 bg-gradient-earth">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Intelligent Crop Analysis
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect Supabase to unlock AI-powered analysis of your agricultural data
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Input Parameters */}
          <Card className="shadow-strong">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Data Input Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="h-4 w-4 text-accent-foreground" />
                    <span className="font-medium">Soil NPK</span>
                  </div>
                    <p className="text-sm text-muted-foreground">Nitrogen, Phosphorus, Potassium levels</p>
                    <input
                    type="text"
                    placeholder="Enter NPK values (e.g. 10-5-8)"
                    className="mt-2 w-full px-2 py-1 rounded border border-muted-foreground bg-background text-sm"
                    />
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="h-4 w-4 text-accent-foreground" />
                    <span className="font-medium">Moisture</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Soil moisture content analysis</p>
                </div>
              </div>
              
              <div className="p-4 bg-accent/20 rounded-lg border border-accent">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Real-time Weather Data</h4>
                  <div className="flex items-center gap-2">
                    {weatherLoading && <RefreshCw className="h-4 w-4 animate-spin text-primary" />}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={refetchWeather}
                      disabled={weatherLoading}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {weatherError ? (
                  <div className="text-sm text-destructive">
                    <p>⚠️ {weatherError}</p>
                    <p className="text-xs mt-1">Please check your API key in .env file</p>
                  </div>
                ) : weather ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="bg-card px-3 py-2 rounded flex items-center gap-2">
                        <Thermometer className="h-3 w-3 text-red-500" />
                        <span>{weather.temperature}</span>
                      </div>
                      <div className="bg-card px-3 py-2 rounded flex items-center gap-2">
                        <Droplets className="h-3 w-3 text-blue-500" />
                        <span>{weather.humidity}</span>
                      </div>
                      <div className="bg-card px-3 py-2 rounded flex items-center gap-2">
                        <Cloud className="h-3 w-3 text-gray-500" />
                        <span>{weather.rainfall}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 mb-1">
                        <MapPin className="h-3 w-3" />
                        <span>{weather.location}</span>
                      </div>
                      <div>Last updated: {weather.lastUpdated}</div>
                      <div className="capitalize">{weather.description}</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-card px-3 py-2 rounded animate-pulse">Loading...</div>
                    <div className="bg-card px-3 py-2 rounded animate-pulse">Loading...</div>
                    <div className="bg-card px-3 py-2 rounded animate-pulse">Loading...</div>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-medium mb-2">Weather Forecast</h4>
                {weatherData?.forecast && weatherData.forecast.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                      {weatherData.forecast.slice(0, 5).map((day, index) => (
                        <div key={index} className="flex items-center justify-between text-xs bg-card px-2 py-1 rounded">
                          <span className="font-medium">
                            {day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-red-500">{day.temperature.max}°</span>
                            <span className="text-blue-500">{day.temperature.min}°</span>
                            <span className="text-gray-500">{day.rainfall}mm</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {weatherData.forecast.length} day forecast • Updates every 5 minutes
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Forecast data will appear here</p>
                )}
              </div>
              
              <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/30">
                <h4 className="font-medium mb-2">Satellite Imagery</h4>
                <p className="text-sm text-muted-foreground">Real-time crop monitoring from coordinates</p>
                {weather && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Coordinates: {weatherData?.location.lat.toFixed(4)}, {weatherData?.location.lon.toFixed(4)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* AI Recommendations */}
          <Card className="shadow-strong">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-sky rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Watering Cycle</span>
                  <Badge variant="secondary">
                    {weather ? 'Real-time' : 'Static'}
                  </Badge>
                </div>
                <p className="text-sm">
                  {weather ? (
                    `Based on ${weather.humidity} humidity and ${weather.rainfall} rainfall: 
                    ${weatherData?.current.humidity && weatherData.current.humidity > 70 
                      ? 'Reduce watering - high humidity detected' 
                      : weatherData?.current.rainfall && weatherData.current.rainfall > 5
                        ? 'Skip next watering - recent rainfall'
                        : 'Every 3 days, 2.5L per plant'
                    }`
                  ) : (
                    'Every 3 days, 2.5L per plant based on current conditions'
                  )}
                </p>
              </div>
              
              <div className="p-4 bg-secondary rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Recommended Crops</span>
                  <Badge variant="outline">Season: Spring</Badge>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-primary/20 text-primary px-2 py-1 rounded text-sm">Tomatoes</span>
                  <span className="bg-primary/20 text-primary px-2 py-1 rounded text-sm">Corn</span>
                  <span className="bg-primary/20 text-primary px-2 py-1 rounded text-sm">Soybeans</span>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Crop Cycle Timeline</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Planting</span>
                    <span className="text-muted-foreground">March 15-30</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Harvest</span>
                    <span className="text-muted-foreground">August 1-15</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center">
          <Button variant="hero" size="lg" className="px-8">
            <TrendingUp className="mr-2 h-5 w-5" />
            Connect Supabase for AI Analysis
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CropAnalysis;