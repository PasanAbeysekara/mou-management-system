'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles && !hasRole(allowedRoles)) {
        router.push('/unauthorized');
      }
    }
  }, [user, loading, allowedRoles, hasRole, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || (allowedRoles && !hasRole(allowedRoles))) {
    return null;
  }

  return <>{children}</>;
}