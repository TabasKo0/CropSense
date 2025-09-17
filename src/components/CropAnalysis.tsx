import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Thermometer, Droplets, Zap, Calendar, TrendingUp } from "lucide-react";

const CropAnalysis = () => {
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
                <h4 className="font-medium mb-2">Weather API Integration</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="bg-card px-2 py-1 rounded">Temperature</span>
                  <span className="bg-card px-2 py-1 rounded">Humidity</span>
                  <span className="bg-card px-2 py-1 rounded">Rainfall</span>
                </div>
              </div>
              
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-medium mb-2">Satellite Imagery</h4>
                <p className="text-sm text-muted-foreground">Real-time crop monitoring from coordinates</p>
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
                  <Badge variant="secondary">Optimized</Badge>
                </div>
                <p className="text-sm">Every 3 days, 2.5L per plant based on current conditions</p>
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