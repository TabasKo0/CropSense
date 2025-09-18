import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Mail, User, Clock, Settings, Activity, MapPin, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const UserInfo = () => {
  const { user, logout } = useAuth();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-2xl">
              {user.username?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl">{user.username || 'User'}</CardTitle>
            <p className="text-muted-foreground">{user.email}</p>
            <Badge variant="secondary" className="mt-2">
              <Activity className="h-3 w-3 mr-1" />
              Active Farmer
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Account Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            Account Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
              </div>
              <span className="text-sm font-medium">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Member since:</span>
              </div>
              <span className="text-sm font-medium">
                {user.createdAt ? formatDate(user.createdAt) : 'Unknown'}
              </span>
            </div>
            
          </div>
        </div>

        <Separator />

        {/* Profile Stats 
        <div>
          <h3 className="text-lg font-semibold mb-3">Profile Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">12</p>
              <p className="text-sm text-muted-foreground">Products Listed</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-green-600">8</p>
              <p className="text-sm text-muted-foreground">Orders Received</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-blue-600">24</p>
              <p className="text-sm text-muted-foreground">Analysis Reports</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-purple-600">95%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
          </div>
        </div>*/}


        {/* Contact Information 
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact & Location
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Phone:</span>
              </div>
              <span className="text-sm font-medium">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
              </div>
              <span className="text-sm font-medium">Springfield, IL</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Farm Size:</span>
              </div>
              <span className="text-sm font-medium">45 acres</span>
            </div>
          </div>
        </div>
        
        <Button variant="outline" className="w-full" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <Button variant="outline" className="w-full" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            Account Settings
          </Button>*/}


        {/* Account Actions */}
        <div className="space-y-3">
          
          <Button 
            variant="destructive" 
            className="w-full" 
            size="sm"
            onClick={logout}
          >
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfo;