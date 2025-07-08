// src/components/AuthGuard.tsx
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, loading, pathname, router]);

  if (loading || (!user && pathname !== '/admin/login')) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};
