import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProctorSignInProps {
  onSuccess: (userData: any) => void;
  onSwitchToSignUp: () => void;
}

const ProctorSignIn = ({ onSuccess, onSwitchToSignUp }: ProctorSignInProps) => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // Sign in user with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user && data.session) {
        // Check if user is a proctor
        const { data: proctorData, error: proctorError } = await supabase
          .from('proctors')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (proctorError || !proctorData) {
          setError("This account is not registered as a proctor. Please contact support.");
          await supabase.auth.signOut();
          return;
        }

        // Success - user is a valid proctor
        onSuccess({
          user: data.user,
          session: data.session
        });
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Proctor signin error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Proctor Sign In</CardTitle>
        <CardDescription className="text-center">
          Access your proctor dashboard to review cases and earn coins
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
            variant="hero"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need to become a proctor?{" "}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-primary hover:underline font-medium"
            >
              Apply here
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProctorSignIn;