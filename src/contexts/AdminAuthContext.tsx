import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  role: string;
}

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminUser: AdminUser | null;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
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
    const checkAdminAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && session.user) {
          // Check if user has admin role
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

            const adminUser: AdminUser = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: profile.full_name || undefined,
              role: profile.role
            };
            
            setAdminUser(adminUser);
            setIsAdminAuthenticated(true);
          
        }
      } catch (error) {
        console.error('Admin auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profileError && profile && profile.role === 'admin') {
          const adminUser: AdminUser = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: profile.full_name || undefined,
            role: profile.role
          };
          
          setAdminUser(adminUser);
          setIsAdminAuthenticated(true);
        } else {
          // User is not an admin, sign them out
          await supabase.auth.signOut();
        }
      } else if (event === 'SIGNED_OUT') {
        setAdminUser(null);
        setIsAdminAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Admin login error:', error);
        return false;
      }

      if (data.user) {
        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('id, username, email, password_hash, created_at, updated_at')
          .or(`username.eq.${username},email.eq.${username}`)
          .single();

        if (profileError || !profile || profile.role !== 'admin') {
          // User is not an admin, sign them out
          await supabase.auth.signOut();
          return false;
        }

        const adminUser: AdminUser = {
          id: data.user.id,
          email: data.user.email || '',
          full_name: profile.full_name || undefined,
          role: profile.role
        };
        
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
      await supabase.auth.signOut();
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