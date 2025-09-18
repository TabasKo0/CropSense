import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SignIn from "@/components/SignIn";
import SignUp from "@/components/SignUp";
import { Leaf } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Check URL params to determine which form to show
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsSignUp(true);
    } else if (mode === 'signin') {
      setIsSignUp(false);
    }
  }, [searchParams]);

  const handleAuthSuccess = (userData: any) => {
    //console.log('Auth successful:', userData);
    // Use AuthContext login method
    login(userData);
    // Redirect to home page
    navigate('/');
  };

  const switchToSignUp = () => setIsSignUp(true);
  const switchToSignIn = () => setIsSignUp(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold text-primary">CropSense</span>
          </div>
          <p className="text-muted-foreground">
            Advanced Agricultural Intelligence Platform
          </p>
        </div>

        {/* Auth Form */}
        {isSignUp ? (
          <SignUp 
            onSuccess={handleAuthSuccess}
            onSwitchToSignIn={switchToSignIn}
          />
        ) : (
          <SignIn 
            onSuccess={handleAuthSuccess}
            onSwitchToSignUp={switchToSignUp}
          />
        )}
      </div>
    </div>
  );
};

export default Auth;