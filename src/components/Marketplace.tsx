import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, MapPin, Truck, Shield, Users } from "lucide-react";

const Marketplace = () => {
  const recommendedSellers = [
    {
      name: "GreenHarvest Supplies",
      rating: 4.9,
      location: "Iowa, USA",
      speciality: "Organic Fertilizers",
      verified: true,
      products: ["NPK Blends", "Compost", "Bio-stimulants"]
    },
    {
      name: "PrecisionAg Tools",
      rating: 4.8,
      location: "Nebraska, USA",
      speciality: "Smart Equipment",
      verified: true,
      products: ["Soil Sensors", "Irrigation Systems", "Drones"]
    },
    {
      name: "Heritage Seeds Co.",
      rating: 4.7,
      location: "Kansas, USA",
      speciality: "Premium Seeds",
      verified: true,
      products: ["Corn Seeds", "Soybean Seeds", "Cover Crops"]
    }
  ];

  return (
    <section id="marketplace" className="relative top-[-10vh] h-[105vh] py-20 bg-gradient-sky bottom-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4" style={{transform:"translateY(5vh)",marginBottom:"6vh"}}>
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Agricultural Marketplace
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with verified suppliers recommended by our AI based on your crop analysis
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {recommendedSellers.map((seller, index) => (
            <Card key={index} className="shadow-strong hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2">{seller.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{seller.rating}</span>
                      </div>
                      {seller.verified && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {seller.location}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge variant="outline" className="mb-3">
                    {seller.speciality}
                  </Badge>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Popular Products:</h4>
                    <div className="flex flex-wrap gap-1">
                      {seller.products.map((product, idx) => (
                        <span
                          key={idx}
                          className="bg-primary/10 text-primary px-2 py-1 rounded text-xs"
                        >
                          {product}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Truck className="h-4 w-4 mr-1" />
                    Get Quote
                  </Button>
                  <Button variant="default" size="sm" className="flex-1">
                    View Store
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Marketplace Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center shadow-soft">
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Secure Transactions</h3>
              <p className="text-sm text-muted-foreground">
                All payments protected with enterprise-grade security
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center shadow-soft">
            <CardContent className="pt-6">
              <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Fast Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Quick shipping from local and regional suppliers
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center shadow-soft">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Verified Sellers</h3>
              <p className="text-sm text-muted-foreground">
                Only authenticated agricultural suppliers
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center">
          <Button variant="hero" size="lg" className="px-8">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Connect Supabase for Full Marketplace
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Marketplace;