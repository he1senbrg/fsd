import AppShell from '@/components/AppShell';
import { Loader } from '@/components/ui';
import { Suspense } from 'react';
import FeedClient from './FeedClient';

export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <Loader />
        </AppShell>
      }
    >
      <FeedClient />
    </Suspense>
  );
}
