'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { UserRole } from '@/types'; // Adjust to your actual type definitions

interface AuthContextType {
  user: any; // Or a specific type for { id, email, name, role, etc. }
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /**
   * Checks if the user is in any "admin-like" role
   * (e.g. LEGAL_ADMIN, FACULTY_ADMIN, SENATE_ADMIN, UGC_ADMIN, SUPER_ADMIN).
   */
  isAdmin: () => boolean;
  /**
   * Checks if user is a "SUPER_ADMIN"
   */
  isSuperAdmin: () => boolean;
  /**
   * Checks if user has one of the specified roles.
   */
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 1) Grab the current session from NextAuth
  const { data: session, status } = useSession();
  const router = useRouter();

  // 2) NextAuth attaches user data (email, role, name, etc.) at session.user
  const user = session?.user;

  // 3) NextAuth indicates loading with status === 'loading'
  const loading = status === 'loading';

  // 4) Optionally, redirect unauthenticated users to login once we know we are not "loading."
  useEffect(() => {
    if (!loading && !user) {
      // If you want to force the entire app behind login:
      // router.push('/login');
      //
      // Otherwise, remove this if you handle protections on a per-route basis.
    }
  }, [loading, user, router]);

  /**
   * Log in using NextAuth credentials provider.
   */
  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // We'll handle navigation manually
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        // Login successful
        router.push('/dashboard'); // Or wherever you want to go
      }
    } catch (error) {
      toast.error('Login failed');
      console.error('Login error:', error);
    }
  };

  /**
   * Log out using NextAuth signOut.
   */
  const logout = async () => {
    try {
      // signOut can automatically redirect via callbackUrl if you like:
      // await signOut({ callbackUrl: '/login' });
      await signOut({ redirect: false });
      router.push('/login');
    } catch (error) {
      toast.error('Logout failed');
      console.error('Logout error:', error);
    }
  };

  /**
   * Check if user is in a domain or super admin role.
   * Adjust roles array to suit your domain-based admins.
   */
  const isAdmin = () => {
    if (!user?.role) return false;
    return [
      'LEGAL_ADMIN',
      'FACULTY_ADMIN',
      'SENATE_ADMIN',
      'UGC_ADMIN',
      'SUPER_ADMIN',
    ].includes(user.role);
  };

  /**
   * Check if user is specifically SUPER_ADMIN
   */
  const isSuperAdmin = () => {
    return user?.role === 'SUPER_ADMIN';
  };

  /**
   * Check if user has one of the specified roles.
   */
  const hasRole = (roles: UserRole[]) => {
    if (!user?.role) return false;
    return roles.includes(user.role as UserRole);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAdmin, isSuperAdmin, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Simple hook to consume the AuthContext.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
