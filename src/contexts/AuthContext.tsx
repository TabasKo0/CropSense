import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  username?: string;
  email: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: { user: any; session: any }) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  const login = (userData: { user: any; session: any }) => {
    const supabaseUser = userData.user;
    const session = userData.session;
    
    const formattedUser: User = {
      id: supabaseUser.id,
      username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0],
      email: supabaseUser.email || '',
      createdAt: supabaseUser.created_at
    };
    
    setUser(formattedUser);
    setToken(session?.access_token || null);
    localStorage.setItem('authToken', session?.access_token || '');
    localStorage.setItem('user', JSON.stringify(formattedUser));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && session.user) {
          const formattedUser: User = {
            id: session.user.id,
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
            email: session.user.email || '',
            createdAt: session.user.created_at
          };
          
          setUser(formattedUser);
          setToken(session.access_token);
          localStorage.setItem('authToken', session.access_token);
          localStorage.setItem('user', JSON.stringify(formattedUser));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear storage on error
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const formattedUser: User = {
          id: session.user.id,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
          email: session.user.email || '',
          createdAt: session.user.created_at
        };
        
        setUser(formattedUser);
        setToken(session.access_token);
        localStorage.setItem('authToken', session.access_token);
        localStorage.setItem('user', JSON.stringify(formattedUser));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;