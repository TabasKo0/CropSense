import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { ProctorAuthProvider } from "@/contexts/ProctorAuthContext";
import Home from "./pages/Home";
import CropAnalysis from "./pages/CropAnalysis";
import Cybersecurity from "./pages/Cybersecurity";
import Marketplace from "./pages/Marketplace";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProctorAuth from "./pages/ProctorAuth";
import ProctorDashboard from "./pages/ProctorDashboard";
import Header from "./components/Header";
import SoilMap from "./pages/SoilMap";
import AdminRouteGuard from "./components/admin/AdminRouteGuard";
import { useEffect } from "react";
import { initLingo, translatePage } from 'lingator';

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

const queryClient = new QueryClient();

const App = () => {
 
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <Toaster />
          <Sonner />
         
          <BrowserRouter>
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <AdminRouteGuard>
                   
                    <AdminDashboard />
                  </AdminRouteGuard>
                  
                } 
              />
              
              {/* Regular App Routes */}
              <Route path="/" element={
                <div className="min-h-screen bg-background">
                  <Header />                
                  <Home />
                </div>
              } />
              <Route path="/crop-analysis" element={
                <div className="min-h-screen bg-background">
                  <Header />
                  <CropAnalysis />
                </div>
              } />
              <Route path="/cybersecurity" element={
                <div className="min-h-screen bg-background">
                  <Header />
                  <Cybersecurity />
                </div>
              } />
              <Route path="/marketplace" element={
                <div className="min-h-screen bg-background">
                  <Header />
                  <Marketplace />
                </div>
              } />
              <Route path="/auth" element={
                <div className="min-h-screen bg-background">
                  <Header />
                  <Auth />
                </div>
              } />
              <Route path="/profile" element={
                <div className="min-h-screen bg-background">
                  <Header />
                  <Profile />
                </div>
              } />
              <Route path="/soil-map" element={
                <div className="min-h-screen bg-background">
                  <Header />
                  <SoilMap />
                </div>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={
                <div className="min-h-screen bg-background">
                  <Header />
                  <NotFound />
                </div>
              } />
            </Routes>
          </BrowserRouter>
        </AdminAuthProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);}

export default App;
