import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  LogOut, 
  Star, 
  Briefcase, 
  Coins, 
  Clock, 
  MapPin, 
  CheckCircle,
  AlertTriangle,
  Gift,
  TrendingUp
} from "lucide-react";
import { useProctorAuth } from "@/contexts/ProctorAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WorkAssignment {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  incident_date: string;
  coin_reward: number;
  estimated_time: string;
  user_name?: string;
}

interface CoinRedemption {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: 'gift_card' | 'certification' | 'equipment' | 'training';
  icon: string;
}

const ProctorDashboard = () => {
  const { proctor, logoutProctor } = useProctorAuth();
  const navigate = useNavigate();
  const [workAssignments, setWorkAssignments] = useState<WorkAssignment[]>([]);
  const [availableRedemptions, setAvailableRedemptions] = useState<CoinRedemption[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for work assignments
  useEffect(() => {
    const loadData = async () => {
      try {
        // In a real app, this would fetch from the database
        // For now, we'll use mock data
        const mockAssignments: WorkAssignment[] = [
          {
            id: "1",
            title: "Pest Infestation Analysis",
            description: "Corn field showing signs of pest damage. Requires expert analysis and treatment recommendations.",
            severity: "high",
            location: "Farm A, Section North",
            incident_date: "2024-01-20",
            coin_reward: 50,
            estimated_time: "2-3 hours",
            user_name: "John Farmer"
          },
          {
            id: "2", 
            title: "Soil pH Assessment",
            description: "Unusual plant growth patterns suggest soil chemistry issues. Need soil analysis recommendations.",
            severity: "medium",
            location: "Farm B, West Field",
            incident_date: "2024-01-19",
            coin_reward: 30,
            estimated_time: "1-2 hours",
            user_name: "Sarah Green"
          },
          {
            id: "3",
            title: "Irrigation System Optimization",
            description: "Water usage efficiency concerns. Looking for sustainable irrigation solutions.",
            severity: "low",
            location: "Farm C, All Sections",
            incident_date: "2024-01-18",
            coin_reward: 40,
            estimated_time: "3-4 hours",
            user_name: "Mike Waters"
          }
        ];

        const mockRedemptions: CoinRedemption[] = [
          {
            id: "1",
            title: "Amazon Gift Card - $25",
            description: "Redeem your coins for a $25 Amazon gift card",
            cost: 250,
            category: "gift_card",
            icon: "🎁"
          },
          {
            id: "2",
            title: "Professional Certification Course",
            description: "Access to advanced agricultural certification program",
            cost: 500,
            category: "certification",
            icon: "🎓"
          },
          {
            id: "3",
            title: "Soil Testing Kit",
            description: "Professional-grade soil testing equipment",
            cost: 150,
            category: "equipment",
            icon: "🧪"
          },
          {
            id: "4",
            title: "Advanced Training Workshop",
            description: "2-day intensive training on latest farming techniques",
            cost: 300,
            category: "training",
            icon: "📚"
          }
        ];

        setWorkAssignments(mockAssignments);
        setAvailableRedemptions(mockRedemptions);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutProctor();
      navigate('/proctor/auth');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const handleAcceptAssignment = async (assignmentId: string) => {
    try {
      // In a real app, this would update the database
      setWorkAssignments(prev => 
        prev.map(assignment => 
          assignment.id === assignmentId 
            ? { ...assignment, status: 'accepted' } 
            : assignment
        )
      );
      toast.success('Assignment accepted! You can now start working on this case.');
    } catch (error) {
      console.error('Error accepting assignment:', error);
      toast.error('Failed to accept assignment');
    }
  };

  const handleRedeemCoins = async (redemptionId: string, cost: number) => {
    if (!proctor || (proctor.coins || 0) < cost) {
      toast.error('Insufficient coins for this redemption');
      return;
    }

    try {
      // In a real app, this would update the database
      const redemption = availableRedemptions.find(r => r.id === redemptionId);
      if (redemption) {
        toast.success(`Successfully redeemed: ${redemption.title}`);
        // Update proctor coins (would be done via API call in real app)
      }
    } catch (error) {
      console.error('Error redeeming coins:', error);
      toast.error('Failed to redeem coins');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (!proctor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert>
          <AlertDescription>
            Please log in to access the proctor dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Proctor Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {proctor.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Cases</p>
                  <p className="text-2xl font-bold">{proctor.total_cases}</p>
                </div>
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rating</p>
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold">{proctor.rating.toFixed(1)}</p>
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available Coins</p>
                  <p className="text-2xl font-bold">{proctor.coins || 0}</p>
                </div>
                <Coins className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={proctor.status === 'active' ? 'default' : 'secondary'}>
                    {proctor.status}
                  </Badge>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="assignments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="assignments">Work Assignments</TabsTrigger>
            <TabsTrigger value="redemptions">Coin Redemption</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Work Assignments</CardTitle>
                <CardDescription>
                  Accept assignments that match your expertise and earn coins
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading assignments...</div>
                ) : workAssignments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No assignments available at the moment. Check back later!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workAssignments.map((assignment) => (
                      <Card key={assignment.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{assignment.title}</h3>
                                <Badge variant={getSeverityColor(assignment.severity)}>
                                  {getSeverityIcon(assignment.severity)}
                                  {assignment.severity}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground mb-3">{assignment.description}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {assignment.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {assignment.estimated_time}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Coins className="h-4 w-4 text-yellow-500" />
                                  {assignment.coin_reward} coins
                                </div>
                              </div>
                              {assignment.user_name && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  Submitted by: {assignment.user_name}
                                </p>
                              )}
                            </div>
                            <Button 
                              onClick={() => handleAcceptAssignment(assignment.id)}
                              className="ml-4"
                            >
                              Accept Assignment
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redemptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Coin Redemption Store</CardTitle>
                <CardDescription>
                  Use your earned coins to redeem rewards and benefits
                </CardDescription>
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold">Available Coins: {proctor.coins || 0}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {availableRedemptions.map((redemption) => (
                    <Card key={redemption.id} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{redemption.icon}</div>
                            <div>
                              <h3 className="font-semibold">{redemption.title}</h3>
                              <Badge variant="outline">{redemption.category.replace('_', ' ')}</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Coins className="h-4 w-4 text-yellow-500" />
                              <span className="font-bold">{redemption.cost}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4">{redemption.description}</p>
                        <Button 
                          className="w-full"
                          disabled={(proctor.coins || 0) < redemption.cost}
                          onClick={() => handleRedeemCoins(redemption.id, redemption.cost)}
                        >
                          {(proctor.coins || 0) < redemption.cost ? (
                            <>
                              <Gift className="mr-2 h-4 w-4" />
                              Insufficient Coins
                            </>
                          ) : (
                            <>
                              <Gift className="mr-2 h-4 w-4" />
                              Redeem Now
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Proctor Profile</CardTitle>
                <CardDescription>
                  Your professional information and qualifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-lg">{proctor.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant={proctor.status === 'active' ? 'default' : 'secondary'}>
                        {proctor.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Specializations</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {proctor.specializations.map((spec) => (
                        <Badge key={spec} variant="outline">
                          {spec.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Member Since</Label>
                    <p>{new Date(proctor.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Qualifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-5 w-5 ${proctor.background_check_completed ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={proctor.background_check_completed ? '' : 'text-muted-foreground'}>
                        Background Check
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-5 w-5 ${proctor.training_completed ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={proctor.training_completed ? '' : 'text-muted-foreground'}>
                        Training Completed
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-sm font-medium ${className}`}>{children}</label>
);

export default ProctorDashboard;