'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [user, setUserState] = useState<User | null>(null);

  const loading = status === 'loading';

  useEffect(() => {
    if (session?.user) {
      setUserState(session.user as User);
    } else {
      setUserState(null);
    }
  }, [session]);

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error('Login failed');
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/login');
    } catch (error) {
      toast.error('Logout failed');
      console.error('Logout error:', error);
    }
  };

  const setUser = (updatedUser: User) => {
    setUserState(updatedUser);
    console.log('updatedUser:', updatedUser);
    update({ user: updatedUser }); // sync with NextAuth session
  };

  const isAdmin = () => {
    if (!user?.role) return false;
    return ['LEGAL_ADMIN', 'FACULTY_ADMIN', 'SENATE_ADMIN', 'UGC_ADMIN', 'SUPER_ADMIN'].includes(user.role);
  };

  const isSuperAdmin = () => user?.role === 'SUPER_ADMIN';

  const hasRole = (roles: UserRole[]) => {
    if (!user?.role) return false;
    return roles.includes(user.role as UserRole);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser, isAdmin, isSuperAdmin, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
