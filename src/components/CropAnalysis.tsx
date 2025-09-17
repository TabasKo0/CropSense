import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Thermometer, Droplets, Zap, Calendar, TrendingUp, Cloud, RefreshCw, Leaf, Camera, BarChart3 } from "lucide-react";
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

  // Form states for the three models
  const [model1Form, setModel1Form] = useState({
    nitrogen: 100,
    phosphorus: 45,
    potassium: 125,
    temperature: 20,
    humidity: 70,
    ph: 5.75,
    rainfall: 150
  });
  
  const [model2Form, setModel2Form] = useState({
    image: null as File | null
  });
  
  const [model3Form, setModel3Form] = useState({
    state: '',
    crop: '',
    season: '',
    crop_year: 2024,
    area_acres: 0,
    production_bags: 0,
    bag_weight: 75,
    rainfall: 0,
    fertilizer: 0,
    pesticide: 0
  });

  const [results, setResults] = useState({
    model1: 'N/A',
    model2: 'N/A',
    model3: 'N/A'
  });

  const [loading, setLoading] = useState({
    model1: false,
    model2: false,
    model3: false
  });

  useEffect(() => {
    // Check if weather data was fetched successfully
    if (weatherData) {
      setLocationStatus('granted');
      
      // Auto-fill weather data in forms
      if (weatherData.current) {
        setModel1Form(prev => ({
          ...prev,
          temperature: Math.round(weatherData.current.temperature),
          humidity: weatherData.current.humidity,
          rainfall: Math.round(weatherData.current.rainfall || 0)
        }));
        
        setModel3Form(prev => ({
          ...prev,
          rainfall: Math.round(weatherData.current.rainfall || 0)
        }));
      }
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

  // Form submission handlers
  const handleModel1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, model1: true }));
    
    try {
      const response = await fetch('http://127.0.0.1:5000/run_model1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(model1Form)
      });
      
      const result = await response.json();
      setResults(prev => ({ ...prev, model1: result.output || 'No crop returned' }));
    } catch (error) {
      console.error('Model 1 Error:', error);
      setResults(prev => ({ ...prev, model1: 'Error! Check console for details.' }));
    } finally {
      setLoading(prev => ({ ...prev, model1: false }));
    }
  };

  const handleModel2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, model2: true }));
    
    if (!model2Form.image) {
      setResults(prev => ({ ...prev, model2: 'Please select an image' }));
      setLoading(prev => ({ ...prev, model2: false }));
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('image', model2Form.image);
      
      const response = await fetch('http://127.0.0.1:5000/run_model2', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      setResults(prev => ({ ...prev, model2: result.output || 'No output returned' }));
    } catch (error) {
      console.error('Model 2 Error:', error);
      setResults(prev => ({ ...prev, model2: 'Error occurred' }));
    } finally {
      setLoading(prev => ({ ...prev, model2: false }));
    }
  };

  const handleModel3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, model3: true }));
    
    try {
      const response = await fetch('http://127.0.0.1:5000/model3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(model3Form)
      });
      
      const result = await response.json();
      setResults(prev => ({ ...prev, model3: result.prediction || 'No prediction returned' }));
    } catch (error) {
      console.error('Model 3 Error:', error);
      setResults(prev => ({ ...prev, model3: 'Error! Check console for details.' }));
    } finally {
      setLoading(prev => ({ ...prev, model3: false }));
    }
  };
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
        
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis">Current Analysis</TabsTrigger>
            <TabsTrigger value="model1">Crop Recommendation</TabsTrigger>
            <TabsTrigger value="model2">Disease Detection</TabsTrigger>
            <TabsTrigger value="model3">Yield Prediction</TabsTrigger>
          </TabsList>
          
          {/* Current Analysis Tab */}
          <TabsContent value="analysis" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
          </TabsContent>
          
          {/* Model 1: Crop Recommendation */}
          <TabsContent value="model1" className="space-y-6">
            <Card className="shadow-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Crop Recommendation System
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered crop recommendations based on soil and weather conditions
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleModel1Submit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nitrogen">Nitrogen (N)</Label>
                      <Input
                        id="nitrogen"
                        type="number"
                        value={model1Form.nitrogen}
                        onChange={(e) => setModel1Form(prev => ({ ...prev, nitrogen: Number(e.target.value) }))}
                        step="any"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phosphorus">Phosphorus (P)</Label>
                      <Input
                        id="phosphorus"
                        type="number"
                        value={model1Form.phosphorus}
                        onChange={(e) => setModel1Form(prev => ({ ...prev, phosphorus: Number(e.target.value) }))}
                        step="any"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="potassium">Potassium (K)</Label>
                      <Input
                        id="potassium"
                        type="number"
                        value={model1Form.potassium}
                        onChange={(e) => setModel1Form(prev => ({ ...prev, potassium: Number(e.target.value) }))}
                        step="any"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="temperature" className="flex items-center gap-2">
                        Temperature (°C)
                        {weather && <Badge variant="outline" className="text-xs">Auto-filled</Badge>}
                      </Label>
                      <Input
                        id="temperature"
                        type="number"
                        value={model1Form.temperature}
                        onChange={(e) => setModel1Form(prev => ({ ...prev, temperature: Number(e.target.value) }))}
                        step="any"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="humidity" className="flex items-center gap-2">
                        Humidity (%)
                        {weather && <Badge variant="outline" className="text-xs">Auto-filled</Badge>}
                      </Label>
                      <Input
                        id="humidity"
                        type="number"
                        value={model1Form.humidity}
                        onChange={(e) => setModel1Form(prev => ({ ...prev, humidity: Number(e.target.value) }))}
                        step="any"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ph">pH Level</Label>
                      <Input
                        id="ph"
                        type="number"
                        value={model1Form.ph}
                        onChange={(e) => setModel1Form(prev => ({ ...prev, ph: Number(e.target.value) }))}
                        step="0.1"
                        min="0"
                        max="14"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rainfall-model1" className="flex items-center gap-2">
                        Rainfall (mm)
                        {weather && <Badge variant="outline" className="text-xs">Auto-filled</Badge>}
                      </Label>
                      <Input
                        id="rainfall-model1"
                        type="number"
                        value={model1Form.rainfall}
                        onChange={(e) => setModel1Form(prev => ({ ...prev, rainfall: Number(e.target.value) }))}
                        step="any"
                        required
                      />
                    </div>
                  </div>
                  
                  {weather && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        Using data from: {weather.location}
                      </p>
                    </div>
                  )}
                  
                  <Button type="submit" disabled={loading.model1} className="w-full">
                    {loading.model1 ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Leaf className="mr-2 h-4 w-4" />
                        Get Crop Recommendation
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Recommendation Result:</h4>
                  <p className="text-lg font-semibold text-primary">{results.model1}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Model 2: Disease Detection */}
          <TabsContent value="model2" className="space-y-6">
            <Card className="shadow-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-purple-600" />
                  Plant Disease Detection
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload a plant image to detect diseases and get treatment recommendations
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleModel2Submit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="imageInput">Select Plant Image</Label>
                    <Input
                      id="imageInput"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setModel2Form(prev => ({ ...prev, image: file }));
                      }}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Supported formats: JPG, PNG, GIF. Maximum size: 10MB
                    </p>
                  </div>
                  
                  {model2Form.image && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800">
                        Selected: {model2Form.image.name} ({(model2Form.image.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}
                  
                  <Button type="submit" disabled={loading.model2 || !model2Form.image} className="w-full">
                    {loading.model2 ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing Image...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Analyze Plant Health
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Analysis Result:</h4>
                  <p className="text-lg font-semibold text-primary">{results.model2}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Model 3: Yield Prediction */}
          <TabsContent value="model3" className="space-y-6">
            <Card className="shadow-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  Crop Yield Prediction
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Predict crop yield based on agricultural and environmental factors
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleModel3Submit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Select value={model3Form.state} onValueChange={(value) => setModel3Form(prev => ({ ...prev, state: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="West Bengal">West Bengal</SelectItem>
                          <SelectItem value="Nagaland">Nagaland</SelectItem>
                          <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
                          <SelectItem value="Himachal Pradesh">Himachal Pradesh</SelectItem>
                          <SelectItem value="Bihar">Bihar</SelectItem>
                          <SelectItem value="Karnataka">Karnataka</SelectItem>
                          <SelectItem value="Jammu and Kashmir">Jammu and Kashmir</SelectItem>
                          <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                          <SelectItem value="Tripura">Tripura</SelectItem>
                          <SelectItem value="Haryana">Haryana</SelectItem>
                          <SelectItem value="Uttarakhand">Uttarakhand</SelectItem>
                          <SelectItem value="Assam">Assam</SelectItem>
                          <SelectItem value="Manipur">Manipur</SelectItem>
                          <SelectItem value="Odisha">Odisha</SelectItem>
                          <SelectItem value="Punjab">Punjab</SelectItem>
                          <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                          <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                          <SelectItem value="Mizoram">Mizoram</SelectItem>
                          <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                          <SelectItem value="Telangana">Telangana</SelectItem>
                          <SelectItem value="Puducherry">Puducherry</SelectItem>
                          <SelectItem value="Sikkim">Sikkim</SelectItem>
                          <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                          <SelectItem value="Delhi">Delhi</SelectItem>
                          <SelectItem value="Gujarat">Gujarat</SelectItem>
                          <SelectItem value="Arunachal Pradesh">Arunachal Pradesh</SelectItem>
                          <SelectItem value="Kerala">Kerala</SelectItem>
                          <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                          <SelectItem value="Meghalaya">Meghalaya</SelectItem>
                          <SelectItem value="Goa">Goa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="crop">Crop</Label>
                      <Select value={model3Form.crop} onValueChange={(value) => setModel3Form(prev => ({ ...prev, crop: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Crop" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Rice">Rice</SelectItem>
                          <SelectItem value="Wheat">Wheat</SelectItem>
                          <SelectItem value="Maize">Maize</SelectItem>
                          <SelectItem value="Cotton(lint)">Cotton(lint)</SelectItem>
                          <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                          <SelectItem value="Soyabean">Soyabean</SelectItem>
                          <SelectItem value="Groundnut">Groundnut</SelectItem>
                          <SelectItem value="Sesamum">Sesamum</SelectItem>
                          <SelectItem value="Sunflower">Sunflower</SelectItem>
                          <SelectItem value="Rapeseed &Mustard">Rapeseed &Mustard</SelectItem>
                          <SelectItem value="Bajra">Bajra</SelectItem>
                          <SelectItem value="Jowar">Jowar</SelectItem>
                          <SelectItem value="Arhar/Tur">Arhar/Tur</SelectItem>
                          <SelectItem value="Gram">Gram</SelectItem>
                          <SelectItem value="Masoor">Masoor</SelectItem>
                          <SelectItem value="Urad">Urad</SelectItem>
                          <SelectItem value="Moong(Green Gram)">Moong(Green Gram)</SelectItem>
                          <SelectItem value="Other Kharif pulses">Other Kharif pulses</SelectItem>
                          <SelectItem value="Other Rabi pulses">Other Rabi pulses</SelectItem>
                          <SelectItem value="Barley">Barley</SelectItem>
                          <SelectItem value="Small millets">Small millets</SelectItem>
                          <SelectItem value="Ragi">Ragi</SelectItem>
                          <SelectItem value="Peas & beans (Pulses)">Peas & beans (Pulses)</SelectItem>
                          <SelectItem value="Horse-gram">Horse-gram</SelectItem>
                          <SelectItem value="Dry chillies">Dry chillies</SelectItem>
                          <SelectItem value="Castor seed">Castor seed</SelectItem>
                          <SelectItem value="Linseed">Linseed</SelectItem>
                          <SelectItem value="Turmeric">Turmeric</SelectItem>
                          <SelectItem value="Coriander">Coriander</SelectItem>
                          <SelectItem value="Sannhamp">Sannhamp</SelectItem>
                          <SelectItem value="Garlic">Garlic</SelectItem>
                          <SelectItem value="Ginger">Ginger</SelectItem>
                          <SelectItem value="Tobacco">Tobacco</SelectItem>
                          <SelectItem value="Other Cereals">Other Cereals</SelectItem>
                          <SelectItem value="Safflower">Safflower</SelectItem>
                          <SelectItem value="Cowpea(Lobia)">Cowpea(Lobia)</SelectItem>
                          <SelectItem value="Niger seed">Niger seed</SelectItem>
                          <SelectItem value="other oilseeds">other oilseeds</SelectItem>
                          <SelectItem value="Mesta">Mesta</SelectItem>
                          <SelectItem value="Onion">Onion</SelectItem>
                          <SelectItem value="Moth">Moth</SelectItem>
                          <SelectItem value="Black pepper">Black pepper</SelectItem>
                          <SelectItem value="Arecanut">Arecanut</SelectItem>
                          <SelectItem value="Jute">Jute</SelectItem>
                          <SelectItem value="Cardamom">Cardamom</SelectItem>
                          <SelectItem value="Cashewnut">Cashewnut</SelectItem>
                          <SelectItem value="Sweet potato">Sweet potato</SelectItem>
                          <SelectItem value="Guar seed">Guar seed</SelectItem>
                          <SelectItem value="Potato">Potato</SelectItem>
                          <SelectItem value="Other Summer Pulses">Other Summer Pulses</SelectItem>
                          <SelectItem value="Khesari">Khesari</SelectItem>
                          <SelectItem value="Banana">Banana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="season">Season</Label>
                      <Select value={model3Form.season} onValueChange={(value) => setModel3Form(prev => ({ ...prev, season: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Season" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kharif">Kharif</SelectItem>
                          <SelectItem value="Rabi">Rabi</SelectItem>
                          <SelectItem value="Whole Year">Whole Year</SelectItem>
                          <SelectItem value="Summer">Summer</SelectItem>
                          <SelectItem value="Autumn">Autumn</SelectItem>
                          <SelectItem value="Winter">Winter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="crop_year">Crop Year</Label>
                      <Input
                        id="crop_year"
                        type="number"
                        value={model3Form.crop_year}
                        onChange={(e) => setModel3Form(prev => ({ ...prev, crop_year: Number(e.target.value) }))}
                        min="1990"
                        max="2025"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="area_acres">Area (Acres)</Label>
                      <Input
                        id="area_acres"
                        type="number"
                        value={model3Form.area_acres || ''}
                        onChange={(e) => setModel3Form(prev => ({ ...prev, area_acres: Number(e.target.value) }))}
                        min="0.1"
                        step="0.1"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="production_bags">Production (Bags)</Label>
                      <Input
                        id="production_bags"
                        type="number"
                        value={model3Form.production_bags || ''}
                        onChange={(e) => setModel3Form(prev => ({ ...prev, production_bags: Number(e.target.value) }))}
                        min="1"
                        step="1"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bag_weight">Bag Weight (kg)</Label>
                      <Input
                        id="bag_weight"
                        type="number"
                        value={model3Form.bag_weight}
                        onChange={(e) => setModel3Form(prev => ({ ...prev, bag_weight: Number(e.target.value) }))}
                        min="50"
                        max="100"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rainfall-model3" className="flex items-center gap-2">
                        Rainfall (mm)
                        {weather && <Badge variant="outline" className="text-xs">Auto-filled</Badge>}
                      </Label>
                      <Input
                        id="rainfall-model3"
                        type="number"
                        value={model3Form.rainfall || ''}
                        onChange={(e) => setModel3Form(prev => ({ ...prev, rainfall: Number(e.target.value) }))}
                        min="0.0"
                        step="1.0"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fertilizer">Fertilizer (kg/ha)</Label>
                      <Input
                        id="fertilizer"
                        type="number"
                        value={model3Form.fertilizer || ''}
                        onChange={(e) => setModel3Form(prev => ({ ...prev, fertilizer: Number(e.target.value) }))}
                        min="0.0"
                        step="1.0"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pesticide">Pesticide (kg/ha)</Label>
                      <Input
                        id="pesticide"
                        type="number"
                        value={model3Form.pesticide || ''}
                        onChange={(e) => setModel3Form(prev => ({ ...prev, pesticide: Number(e.target.value) }))}
                        min="0.0"
                        step="1.0"
                        required
                      />
                    </div>
                  </div>
                  
                  {weather && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        Using rainfall data from: {weather.location}
                      </p>
                    </div>
                  )}
                  
                  <Button type="submit" disabled={loading.model3} className="w-full">
                    {loading.model3 ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Predicting Yield...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Predict Yield
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Yield Prediction Result:</h4>
                  <p className="text-lg font-semibold text-primary">{results.model3}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            Use the tabs above to access different AI models for crop analysis, disease detection, and yield prediction.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CropAnalysis;