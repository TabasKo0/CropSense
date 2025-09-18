import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProctorAuth } from '@/contexts/ProctorAuthContext';

interface ProctorRouteGuardProps {
  children: React.ReactNode;
}

const ProctorRouteGuard = ({ children }: ProctorRouteGuardProps) => {
  const { isProctorAuthenticated, loading } = useProctorAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isProctorAuthenticated) {
      navigate('/proctor/auth');
    }
  }, [isProctorAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isProctorAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProctorRouteGuard;