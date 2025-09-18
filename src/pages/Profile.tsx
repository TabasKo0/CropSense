import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserInfo from "@/components/profile/UserInfo";
import UserOrders from "@/components/profile/UserOrders";
import UserGoods from "@/components/profile/UserGoods";
import AnalysisHistory from "@/components/profile/AnalysisHistory";

const Profile = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
            <p className="text-muted-foreground">Manage your CropSense account and track your farming activities</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - User Info */}
            <div className="lg:col-span-1">
              <UserInfo />
            </div>

            {/* Right Column - Tabbed Sections */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="orders" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="goods">My Goods</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="orders" className="mt-6">
                  <UserOrders />
                </TabsContent>
                
                <TabsContent value="goods" className="mt-6">
                  <UserGoods />
                </TabsContent>
                
                <TabsContent value="analysis" className="mt-6">
                  <AnalysisHistory />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;