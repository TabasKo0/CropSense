import { Button } from "@/components/ui/button";
import { Leaf, Shield, ShoppingCart, BarChart3 } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">AgriAI</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#analysis" className="text-foreground hover:text-primary transition-colors">
              Crop Analysis
            </a>
            <a href="#security" className="text-foreground hover:text-primary transition-colors">
              Cybersecurity
            </a>
            <a href="#marketplace" className="text-foreground hover:text-primary transition-colors">
              Marketplace
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button variant="hero" size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;