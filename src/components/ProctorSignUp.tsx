import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, User, GraduationCap } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

interface ProctorSignUpProps {
  onSuccess: (userData: any) => void;
  onSwitchToSignIn: () => void;
}

const ProctorSignUp = ({ onSuccess, onSwitchToSignIn }: ProctorSignUpProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    bio: "",
    specializations: [] as string[],
    agreedToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const availableSpecializations = [
    "crop_diseases",
    "soil_analysis", 
    "pest_management",
    "irrigation",
    "organic_farming",
    "livestock",
    "climate_adaptation",
    "sustainable_agriculture"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSpecializationToggle = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("All required fields must be filled");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (formData.specializations.length === 0) {
      setError("Please select at least one specialization");
      return;
    }

    if (!formData.agreedToTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    setLoading(true);

    try {
      // Sign up user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.name,
            role: 'proctor'
          }
        }
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        // Create profile first
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            uuid: data.user.id,
            full_name: formData.name,
            role: 'proctor'
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // Create proctor record
        const { error: proctorError } = await supabase
          .from('proctors')
          .insert({
            user_id: data.user.id,
            name: formData.name,
            bio: formData.bio,
            specializations: formData.specializations,
            status: 'pending', // New proctors start with pending status
            rating: 0,
            total_cases: 0,
            background_check_completed: false,
            training_completed: false
          });

        if (proctorError) {
          setError("Failed to create proctor profile. Please contact support.");
          console.error('Proctor creation error:', proctorError);
          return;
        }

        // Check if email confirmation is required
        if (data.user.email_confirmed_at) {
          // User is immediately confirmed
          onSuccess({
            user: data.user,
            session: data.session
          });
        } else {
          // Email confirmation required
          setError("Please check your email and click the confirmation link to activate your account. Your proctor application will be reviewed once confirmed.");
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Proctor signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Become a Proctor</CardTitle>
        <CardDescription className="text-center">
          Apply to join our expert network and help farmers while earning coins
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
            <Label htmlFor="name">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell us about your agricultural background and expertise..."
              value={formData.bio}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Specializations *
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {availableSpecializations.map((spec) => (
                <div key={spec} className="flex items-center space-x-2">
                  <Checkbox
                    id={spec}
                    checked={formData.specializations.includes(spec)}
                    onCheckedChange={() => handleSpecializationToggle(spec)}
                  />
                  <Label 
                    htmlFor={spec} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {spec.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreedToTerms}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, agreedToTerms: !!checked }))
              }
            />
            <Label htmlFor="terms" className="text-sm cursor-pointer">
              I agree to the terms and conditions and code of conduct *
            </Label>
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
                Submitting Application...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already a proctor?{" "}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProctorSignUp;