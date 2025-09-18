import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, LogOut, Database, Loader2 } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import DatabaseTable from "@/components/admin/DatabaseTable";

const AdminDashboard = () => {
  const { isAdminAuthenticated, adminUser, logoutAdmin, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [activeTable, setActiveTable] = useState("users");
  
  // Available database tables
  const tables = [
    { name: "items", label: "Users", description: "User accounts and authentication" },
    { name: "orders", label: "Profiles", description: "User profile information" },
    { name: "reports", label: "Reports", description: "User reports and incidents" },
    { name: "userdata", label: "Proctors", description: "Proctor management" },
  

  ];

  useEffect(() => {
    if (!loading && !isAdminAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAdminAuthenticated, loading, navigate]);

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-red-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">
                  Welcome {adminUser?.full_name || adminUser?.email} - CropSense Database Management
                </p>
              </div>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Management
              </CardTitle>
              <CardDescription>
                View and edit all database tables. Click on any cell to edit its value.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Tabs value={activeTable} onValueChange={setActiveTable} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-none lg:flex lg:flex-wrap">
            {tables.map((table) => (
              <TabsTrigger key={table.name} value={table.name} className="text-xs lg:text-sm">
                {table.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tables.map((table) => (
            <TabsContent key={table.name} value={table.name} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{table.label}</CardTitle>
                  <CardDescription>{table.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <DatabaseTable tableName={table.name} />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;