import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Lock, FileText, Phone, Mail } from "lucide-react";

const Cybersecurity = () => {
  return (
    <section id="security" className="relative mt-[-5vh] py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Cybersecurity Center
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Protecting agricultural data and helping farmers stay safe from cyber threats
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Report Scams */}
          <Card className="shadow-strong border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Report Agricultural Scams
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Help protect the farming community by reporting suspicious activities
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <h4 className="font-medium mb-1">Common Agricultural Scams:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Fake fertilizer/seed suppliers</li>
                    <li>• Equipment financing fraud</li>
                    <li>• False crop insurance claims</li>
                    <li>• Phishing emails targeting farmers</li>
                  </ul>
                </div>
                
                <Button variant="destructive" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  File a Scam Report
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Security Measures */}
          <Card className="shadow-strong border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Lock className="h-5 w-5" />
                Data Protection Measures
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <h4 className="font-medium mb-2">Our Security Features:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>256-bit Encryption</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Secure API Calls</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Data Anonymization</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Regular Audits</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-accent/20 rounded-lg">
                  <h4 className="font-medium mb-1">GDPR Compliant</h4>
                  <p className="text-sm text-muted-foreground">
                    All agricultural data is processed in compliance with privacy regulations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Help & Support */}
        <Card className="shadow-strong">
          <CardHeader>
            <CardTitle className="text-center">Need Help or Support?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-muted rounded-lg">
                <Phone className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-medium mb-2">Emergency Hotline</h4>
                <p className="text-muted-foreground mb-3">24/7 support for urgent security issues</p>
                <Button variant="outline">Call Now</Button>
              </div>
              
              <div className="text-center p-6 bg-muted rounded-lg">
                <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-medium mb-2">Email Support</h4>
                <p className="text-muted-foreground mb-3">Get help from our cybersecurity experts</p>
                <Button variant="outline">Contact Us</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Cybersecurity;