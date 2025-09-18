import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Shield, AlertTriangle, Phone, Mail, Clock, Users, Lock, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
const Cybersecurity = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    urgency: "",
    contactPhone: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleUrgencyChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      urgency: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      const { data, error } = await supabase
      .from('reports')
      .insert([
        {
        title: formData.title,
        desp: formData.description,
        prio: formData.urgency,
        contact_phone: formData.contactPhone,
        },
      ]);

      if (error) {
      throw error;
      }

      alert("Support request submitted successfully!");
      setFormData({
      title: "",
      description: "",
      urgency: "",
      contactPhone: ""
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
    };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  return (
    <section id="security" className="relative mt-[-5vh] py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Cybersecurity Support Center
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get immediate help with security threats, data breaches, and cyber incidents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Support Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Submit Security Support Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base font-medium">
                      Incident Title *
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Brief description of the security issue"
                      required
                      className="text-base"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base font-medium">
                      Detailed Description *
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Please provide as much detail as possible about the security incident, including when it occurred, what systems are affected, and any steps you've already taken..."
                      rows={6}
                      required
                      className="text-base resize-none"
                    />
                  </div>

                  {/* Urgency Selector */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      Urgency Level *
                    </Label>
                    <RadioGroup 
                      value={formData.urgency} 
                      onValueChange={handleUrgencyChange}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                    >
                      <Label htmlFor="high" className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                        <RadioGroupItem value="high" id="high" />
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-3 h-3 bg-destructive rounded-full"></div>
                          <div>
                            <div className="font-medium">High Priority</div>
                            <div className="text-sm text-muted-foreground">Active threat or breach</div>
                          </div>
                        </div>
                      </Label>
                      
                      <Label htmlFor="medium" className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                        <RadioGroupItem value="medium" id="medium" />
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <div>
                            <div className="font-medium">Medium Priority</div>
                            <div className="text-sm text-muted-foreground">Potential security risk</div>
                          </div>
                        </div>
                      </Label>
                      
                      <Label htmlFor="low" className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                        <RadioGroupItem value="low" id="low" />
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <div className="font-medium">Low Priority</div>
                            <div className="text-sm text-muted-foreground">General security inquiry</div>
                          </div>
                        </div>
                      </Label>
                    </RadioGroup>
                    {formData.urgency && (
                      <Badge variant={getUrgencyColor(formData.urgency)} className="w-fit">
                        {formData.urgency.toUpperCase()} PRIORITY
                      </Badge>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone" className="text-base font-medium">
                      Contact Phone Number *
                    </Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      placeholder="Your phone number for contact"
                      required
                      className="text-base"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full text-base py-6"
                    disabled={isSubmitting}
                    variant="default"
                  >
                    {isSubmitting ? "Submitting Request..." : "Submit Security Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Call Button & Info */}
          <div className="space-y-6">
            {/* Emergency Call */}
            <Card className="shadow-strong border-destructive/20 bg-destructive/5">
              <CardHeader className="text-center">
                <CardTitle className="text-destructive">
                  Emergency Response
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Phone className="h-16 w-16 text-destructive mx-auto" />
                <div>
                  <h3 className="text-2xl font-bold text-destructive mb-2">
                    CALL NOW
                  </h3>
                  <p className="text-lg font-mono text-destructive mb-4">
                    112
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    24/7 Emergency Hotline for active cyber threats
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  size="lg"
                  className="w-full text-lg py-6 font-bold"
                  onClick={() => window.open('tel:911')}
                >
                  <Phone className="mr-2 h-6 w-6" />
                  EMERGENCY CALL
                </Button>
              </CardContent>
            </Card>

            {/* Response Times */}
           

            {/* Contact Info */}
            <Card className="shadow-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Other Ways to Reach Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">security@cropsense.com</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Business Hours</p>
                  <p className="text-sm text-muted-foreground">Mon-Fri: 8AM-8PM EST</p>
                  <p className="text-sm text-muted-foreground">Weekends: 9AM-5PM EST</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Security Team</p>
                  <p className="text-sm text-muted-foreground">Certified cybersecurity experts</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Security Information Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-soft">
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Data Protection</h3>
              <p className="text-sm text-muted-foreground">
                Your information is encrypted and handled with the highest security standards
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardContent className="pt-6 text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Expert Team</h3>
              <p className="text-sm text-muted-foreground">
                Our certified cybersecurity professionals are here to help you 24/7
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardContent className="pt-6 text-center">
              <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Confidential</h3>
              <p className="text-sm text-muted-foreground">
                All support requests are handled with complete confidentiality
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Cybersecurity;