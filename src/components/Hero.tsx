import { Button } from "@/components/ui/button";
import { ArrowRight, Satellite, CloudRain, Sprout } from "lucide-react";
import satelliteBackground from "@/assets/satellite-background.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={satelliteBackground}
          alt="Satellite view of agricultural farmland"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/20"></div>
      </div>
      
      {/* Content */}  
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            AI-Powered
            <span className="text-primary block">Agriculture Intelligence</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto" style={{color:"#323332ff"}}>
            Optimize your crop yields with advanced AI analysis of soil, weather, and satellite data. 
            Make informed decisions for sustainable farming.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button variant="hero" size="lg" className="text-lg px-8">
              Start Analysis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Watch Demo
            </Button>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-card/80 backdrop-blur p-6 rounded-lg shadow-soft border border-border">
              <Satellite className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Satellite Imaging</h3>
              <p className="text-muted-foreground">Real-time crop monitoring using advanced satellite imagery analysis</p>
            </div>
            
            <div className="bg-card/80 backdrop-blur p-6 rounded-lg shadow-soft border border-border">
              <CloudRain className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Weather Intelligence</h3>
              <p className="text-muted-foreground">Precise weather data integration for optimal farming decisions</p>
            </div>
            
            <div className="bg-card/80 backdrop-blur p-6 rounded-lg shadow-soft border border-border">
              <Sprout className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Smart Recommendations</h3>
              <p className="text-muted-foreground">AI-driven crop, fertilizer, and irrigation recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;