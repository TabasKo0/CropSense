import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Leaf, User, LogOut } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { Card } from "./ui/card";
import { useState } from "react";
const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isChange, setIsChange] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignIn = () => {
    if (location.pathname === '/auth') {
      // If already on auth page, trigger form switch via URL params
      navigate('/auth?mode=signin');
    } else {
      navigate('/auth?mode=signin');
    }
  };
const handleLanguage = () => {
    setIsChange(!isChange);
}
  const handleGetStarted = () => {
    if (location.pathname === '/auth') {
      // If already on auth page, trigger form switch via URL params
      navigate('/auth?mode=signup');
    } else {
      navigate('/auth?mode=signup');
    }
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };
 const googleTranslateElementInit = () => {
    new window.google.translate.TranslateElement(
      {
        pageLanguage: "en",
        autoDisplay: false,
        layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
      },
      "google_translate_element"
    );
  };
  useEffect(() => {
    var addScript = document.createElement("script");
    addScript.setAttribute(
      "src",
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    );
    document.body.appendChild(addScript);
    window.googleTranslateElementInit = googleTranslateElementInit;
  }, []);
  return (
    <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
            

          <Link to="/" className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">CropSense</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/crop-analysis" className="text-foreground hover:text-primary transition-colors">
              Crop Analysis
            </Link>
            <Link to="/cybersecurity" className="text-foreground hover:text-primary transition-colors">
              Cybersecurity
            </Link>
            <Link to="/soil-map" className="text-foreground hover:text-primary transition-colors">
              Soil Map
            </Link>
            <Link to="/marketplace" className="text-foreground hover:text-primary transition-colors">
              Marketplace
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.username}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem onClick={handleProfile}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
               <Button variant="outline" size="sm" onClick={handleLanguage}>
                  Language
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignIn}>
                  Sign In
                </Button>
                <Button variant="hero" size="sm" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </>
            )}
          </div>
                     
        </div>
      </div>
      <div className={`absolute w-full h-[100vh] flex justify-center items-center ${isChange ? "translate-y-0" : "translate-y-full"} transition-transform duration-300`}>
        <div onClick={handleLanguage} className="cursor-pointer text-2xl font-bold z-50 p-3 bg-red/70 rounded-full hover:bg-red/90 shadow-lg">X</div>
        <Card className="absolute bg-white/80 backdrop-blur-md shadow-lg border border-white/30 p-5 shadow-strong">
          <div id="google_translate_element"></div>
        </Card>
      </div>
    </header>
  );
};

export default Header;