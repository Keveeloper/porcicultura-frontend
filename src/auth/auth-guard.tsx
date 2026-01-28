import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from './auth-store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/sign-in', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return null;
  }

  return <>{children}</>;
}