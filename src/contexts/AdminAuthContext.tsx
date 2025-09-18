import React, { createContext, useContext, useEffect, useState } from 'react';

interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  role: string;
}

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminUser: AdminUser | null;
  loginAdmin: (username: string, password: string) => Promise<boolean>;
  logoutAdmin: () => Promise<void>;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing admin session on mount
  useEffect(() => {
    const checkAdminAuth = () => {
      try {
        const adminSession = localStorage.getItem('adminSession');
        if (adminSession) {
          const adminData = JSON.parse(adminSession);
          setAdminUser(adminData);
          setIsAdminAuthenticated(true);
        }
      } catch (error) {
        console.error('Admin auth check failed:', error);
        localStorage.removeItem('adminSession');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, []);

  const loginAdmin = async (username: string, password: string): Promise<boolean> => {
    try {
      // Simple credential check: admin/admin
      if (username === 'admin' && password === 'admin') {
        const adminUser: AdminUser = {
          id: 'admin-user',
          email: 'admin@cropsense.com',
          full_name: 'System Administrator',
          role: 'admin'
        };
        
        // Store session in localStorage
        localStorage.setItem('adminSession', JSON.stringify(adminUser));
        
        setAdminUser(adminUser);
        setIsAdminAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const logoutAdmin = async (): Promise<void> => {
    try {
      localStorage.removeItem('adminSession');
      setAdminUser(null);
      setIsAdminAuthenticated(false);
    } catch (error) {
      console.error('Admin logout error:', error);
    }
  };

  const value: AdminAuthContextType = {
    isAdminAuthenticated,
    adminUser,
    loginAdmin,
    logoutAdmin,
    loading
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};