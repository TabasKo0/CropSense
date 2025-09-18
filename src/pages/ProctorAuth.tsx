import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProctorSignIn from "@/components/ProctorSignIn";
import ProctorSignUp from "@/components/ProctorSignUp";
import { Shield } from "lucide-react";
import { useProctorAuth } from "@/contexts/ProctorAuthContext";

const ProctorAuth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginProctor } = useProctorAuth();

  // Check URL params to determine which form to show
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsSignUp(true);
    } else if (mode === 'signin') {
      setIsSignUp(false);
    }
  }, [searchParams]);

  const handleAuthSuccess = async (userData: any) => {
    console.log('Proctor auth successful:', userData);
    try {
      // Use ProctorAuthContext login method
      await loginProctor(userData);
      // Redirect to proctor dashboard
      navigate('/proctor/dashboard');
    } catch (error) {
      console.error('Proctor login failed:', error);
      // Handle error - this will be shown in the form
    }
  };

  const switchToSignUp = () => setIsSignUp(true);
  const switchToSignIn = () => setIsSignUp(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold text-primary">CropSense</span>
          </div>
          <p className="text-muted-foreground">
            Proctor Portal - Expert Agricultural Support
          </p>
        </div>

        {/* Auth Form */}
        {isSignUp ? (
          <ProctorSignUp 
            onSuccess={handleAuthSuccess}
            onSwitchToSignIn={switchToSignIn}
          />
        ) : (
          <ProctorSignIn 
            onSuccess={handleAuthSuccess}
            onSwitchToSignUp={switchToSignUp}
          />
        )}
      </div>
    </div>
  );
};

export default ProctorAuth;