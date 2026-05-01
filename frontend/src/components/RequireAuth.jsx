'use client';
import { Loader } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Wraps any page that requires authentication.
 * - While the session is being restored from storage: renders a full-screen spinner.
 * - If unauthenticated after the check: redirects to /login.
 * - If authenticated: renders children normally.
 */
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <Loader
        className="min-h-screen bg-[#FDFBF7]"
        label="Loading KalaSetu..."
        labelClassName="text-sm text-stone-500 font-medium"
        size="text-5xl"
      />
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
