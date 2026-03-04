'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/src/lib/api';

export default function ProtectedRoute({children} : {children: ReactNode}) {
  const router = useRouter();

  useEffect (() => {
    const token = getAuthToken();
    if(!token) {
      router.push('/login')
    }
  }, [router]);

  return <>{children}</>
}