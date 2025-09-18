import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Proctor {
  id: string;
  user_id: string;
  profile_id: string;
  name: string;
  specializations: string[];
  status: string;
  rating: number;
  total_cases: number;
  coins?: number;
  background_check_completed?: boolean;
  training_completed?: boolean;
  created_at: string;
  updated_at: string;
}

interface ProctorAuthContextType {
  proctor: Proctor | null;
  token: string | null;
  isProctorAuthenticated: boolean;
  loginProctor: (userData: { user: any; session: any }) => Promise<void>;
  logoutProctor: () => Promise<void>;
  loading: boolean;
}

const ProctorAuthContext = createContext<ProctorAuthContextType | undefined>(undefined);

interface ProctorAuthProviderProps {
  children: React.ReactNode;
}

export const ProctorAuthProvider = ({ children }: ProctorAuthProviderProps) => {
  const [proctor, setProctor] = useState<Proctor | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isProctorAuthenticated = !!proctor && !!token;

  const loginProctor = async (userData: { user: any; session: any }) => {
    const supabaseUser = userData.user;
    const session = userData.session;
    
    try {
      // Check if user is a proctor in the database
      const { data: proctorData, error } = await supabase
        .from('proctors')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single();

      if (error || !proctorData) {
        throw new Error('User is not registered as a proctor');
      }

      const formattedProctor: Proctor = {
        id: proctorData.id,
        user_id: proctorData.user_id,
        profile_id: proctorData.profile_id,
        name: proctorData.name || supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0],
        specializations: proctorData.specializations || [],
        status: proctorData.status || 'active',
        rating: proctorData.rating || 0,
        total_cases: proctorData.total_cases || 0,
        coins: proctorData.coins || 0,
        background_check_completed: proctorData.background_check_completed,
        training_completed: proctorData.training_completed,
        created_at: proctorData.created_at,
        updated_at: proctorData.updated_at
      };
      
      setProctor(formattedProctor);
      setToken(session?.access_token || null);
      localStorage.setItem('proctorAuthToken', session?.access_token || '');
      localStorage.setItem('proctor', JSON.stringify(formattedProctor));
    } catch (error) {
      console.error('Proctor login error:', error);
      throw error;
    }
  };

  const logoutProctor = async () => {
    await supabase.auth.signOut();
    setProctor(null);
    setToken(null);
    localStorage.removeItem('proctorAuthToken');
    localStorage.removeItem('proctor');
  };

  // Check for existing proctor auth on mount
  useEffect(() => {
    const checkProctorAuth = async () => {
      try {
        // Get current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && session.user) {
          // Check if user is a proctor
          const { data: proctorData, error: proctorError } = await supabase
            .from('proctors')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (!proctorError && proctorData) {
            const formattedProctor: Proctor = {
              id: proctorData.id,
              user_id: proctorData.user_id,
              profile_id: proctorData.profile_id,
              name: proctorData.name || session.user.user_metadata?.username || session.user.email?.split('@')[0],
              specializations: proctorData.specializations || [],
              status: proctorData.status || 'active',
              rating: proctorData.rating || 0,
              total_cases: proctorData.total_cases || 0,
              coins: proctorData.coins || 0,
              background_check_completed: proctorData.background_check_completed,
              training_completed: proctorData.training_completed,
              created_at: proctorData.created_at,
              updated_at: proctorData.updated_at
            };
            
            setProctor(formattedProctor);
            setToken(session.access_token);
            localStorage.setItem('proctorAuthToken', session.access_token);
            localStorage.setItem('proctor', JSON.stringify(formattedProctor));
          }
        }
      } catch (error) {
        console.error('Proctor auth check failed:', error);
        // Clear storage on error
        localStorage.removeItem('proctorAuthToken');
        localStorage.removeItem('proctor');
      } finally {
        setLoading(false);
      }
    };

    checkProctorAuth();

    // Listen for auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          // Check if user is a proctor
          const { data: proctorData, error } = await supabase
            .from('proctors')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (!error && proctorData) {
            const formattedProctor: Proctor = {
              id: proctorData.id,
              user_id: proctorData.user_id,
              profile_id: proctorData.profile_id,
              name: proctorData.name || session.user.user_metadata?.username || session.user.email?.split('@')[0],
              specializations: proctorData.specializations || [],
              status: proctorData.status || 'active',
              rating: proctorData.rating || 0,
              total_cases: proctorData.total_cases || 0,
              coins: proctorData.coins || 0,
              background_check_completed: proctorData.background_check_completed,
              training_completed: proctorData.training_completed,
              created_at: proctorData.created_at,
              updated_at: proctorData.updated_at
            };
            
            setProctor(formattedProctor);
            setToken(session.access_token);
            localStorage.setItem('proctorAuthToken', session.access_token);
            localStorage.setItem('proctor', JSON.stringify(formattedProctor));
          }
        } catch (error) {
          console.error('Proctor auth state change error:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setProctor(null);
        setToken(null);
        localStorage.removeItem('proctorAuthToken');
        localStorage.removeItem('proctor');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value: ProctorAuthContextType = {
    proctor,
    token,
    isProctorAuthenticated,
    loginProctor,
    logoutProctor,
    loading
  };

  return (
    <ProctorAuthContext.Provider value={value}>
      {children}
    </ProctorAuthContext.Provider>
  );
};

export const useProctorAuth = (): ProctorAuthContextType => {
  const context = useContext(ProctorAuthContext);
  if (context === undefined) {
    throw new Error('useProctorAuth must be used within a ProctorAuthProvider');
  }
  return context;
};

export default ProctorAuthContext;