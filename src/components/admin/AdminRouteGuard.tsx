import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

const AdminRouteGuard = ({ children }: AdminRouteGuardProps) => {
  const { isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAdminAuthenticated, navigate]);

  if (!isAdminAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AdminRouteGuard;