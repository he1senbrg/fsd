import { Suspense } from 'react';
import AppShell from '@/components/AppShell';
import { Loader } from '@/components/ui';
import ProductDetailClient from './ProductDetailClient';

function ProductPageFallback() {
  return (
    <AppShell>
      <Loader />
    </AppShell>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<ProductPageFallback />}>
      <ProductDetailClient />
    </Suspense>
  );
}
