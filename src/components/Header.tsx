import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Leaf, User, LogOut, Menu, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { Card } from "./ui/card";
const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isChange, setIsChange] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignIn = () => {
    setIsMobileMenuOpen(false);
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
    setIsMobileMenuOpen(false);
    if (location.pathname === '/auth') {
      // If already on auth page, trigger form switch via URL params
      navigate('/auth?mode=signup');
    } else {
      navigate('/auth?mode=signup');
    }
  };

  const handleProfile = () => {
    setIsMobileMenuOpen(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
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
   const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  return (
    <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
            

          <Link to="/" className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">CropSense</span>
          </Link>
          
          {/* Desktop Navigation */}
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
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
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

          {/* Mobile Menu Button */}
          <div className="md:hidden">
           <Button variant="outline" size="sm" onClick={handleLanguage}>
                  Language
                </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="flex flex-col space-y-1 p-4">
              {/* Navigation Links */}
              <Link 
                to="/crop-analysis" 
                className="px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                onClick={handleNavClick}
              >
                Crop Analysis
              </Link>
              <Link 
                to="/cybersecurity" 
                className="px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                onClick={handleNavClick}
              >
                Cybersecurity
              </Link>
              <Link 
                to="/soil-map" 
                className="px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                onClick={handleNavClick}
              >
                Soil Map
              </Link>
              <Link 
                to="/marketplace" 
                className="px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                onClick={handleNavClick}
              >
                Marketplace
              </Link>
              
              {/* Auth Section */}
              {isAuthenticated ? (
                <>
                  {/* Divider */}
                  <div className="border-t border-border my-2"></div>
                  
                  <div className="space-y-2">
                    <div className="px-3 py-2">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="font-medium text-sm">{user?.username}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start px-3 py-2 h-auto"
                      onClick={handleProfile}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start px-3 py-2 h-auto text-destructive hover:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Divider */}
                  <div className="border-t border-border my-2"></div>
                  
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" onClick={handleSignIn}>
                      Sign In
                    </Button>
                    <Button variant="hero" className="w-full" onClick={handleGetStarted}>
                      Get Started
                    </Button>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
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