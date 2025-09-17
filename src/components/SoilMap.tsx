import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Lock, FileText, Phone, Mail } from "lucide-react";

const Cybersecurity = () => {
  return (
    <section id="security" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
             Soil Map
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
Helping Farmers Optimize Soil Quality           </p>
        </div>
        
        <div className="grid  gap-8 mb-12">
          {/* Report Scams */}
          <Card className="shadow-strong border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
               
                Soil Quality
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
Look at Soil Quality in your Area                </AlertDescription>
              </Alert>

              <iframe src="https://soilexplorer.net/" className="w-full h-96 border-0"></iframe>
            </CardContent>
          </Card>
         
        </div>
        
       
       
      </div>
    </section>
  );
};

export default Cybersecurity;