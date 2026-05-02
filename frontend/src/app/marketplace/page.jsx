'use client';
import AppShell from '@/components/AppShell';
import { Button, EmptyState, Loader } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { cartAPI, productAPI, wishlistAPI } from '@/lib/api';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const craftTypes = [
  'All Crafts',
  'Textiles & Weaving',
  'Woodwork & Carving',
  'Jewelry & Ornaments',
  'Pottery & Ceramics',
  'Metal Crafts',
];
const craftCategoryMap = {
  'Textiles & Weaving': 'textiles',
  'Woodwork & Carving': 'woodwork',
  'Jewelry & Ornaments': 'jewelry',
  'Pottery & Ceramics': 'pottery',
  'Metal Crafts': 'metalCrafts',
};

export default function MarketplacePage() {
  const router = useRouter();
  const showToast = useToast();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCraft, setActiveCraft] = useState('All Crafts');
  const [activeRegion, setActiveRegion] = useState('');
  const [cartLoading, setCartLoading] = useState({});

  const toggleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await wishlistAPI.toggleWishlist(productId);
      setWishlist((prev) => {
        const next = new Set(prev);
        if (next.has(productId)) next.delete(productId);
        else next.add(productId);
        return next;
      });
    } catch (err) {
      if (err?.status !== 401) console.error(err);
    }
  };

  const addToCart = async (e, productId, buyNow = false) => {
    e.preventDefault();
    e.stopPropagation();
    setCartLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      await cartAPI.addItem(productId);
      if (buyNow) {
        router.push('/cart');
      } else {
        showToast('Added to cart!', 'success');
      }
    } catch (err) {
      if (err?.status !== 401) console.error(err);
      showToast('Failed to add to cart.', 'error');
    }
    setCartLoading((prev) => ({ ...prev, [productId]: false }));
  };

  useEffect(() => {
    async function load() {
      try {
        const res = await productAPI.getProducts();
        setProducts(res.data?.products || []);
      } catch (e) {
        if (e?.status !== 401) console.error(e);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <Loader />
      </AppShell>
    );
  }

  const filtered = products
    .filter((p) => activeCraft === 'All Crafts' || p.category === craftCategoryMap[activeCraft])
    .filter((p) => !activeRegion || p.region === activeRegion);

  return (
    <AppShell>
      <main className="flex-grow flex flex-col lg:flex-row gap-8 py-2">
        {/* sidebar filters */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-8 hidden lg:block">
          <div>
            <h3 className="font-display text-lg font-bold text-[var(--text-secondary)] mb-4 pb-2 border-b border-stone-200">
              Craft Type
            </h3>
            <div className="space-y-3">
              {craftTypes.map((type, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={activeCraft === type}
                    onChange={() => setActiveCraft(type)}
                    className="w-4 h-4 text-[var(--primary-color)] border-stone-300 rounded focus:ring-[var(--primary-color)]"
                  />
                  <span className="text-stone-700 group-hover:text-[var(--primary-color)] transition-colors">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex-1 min-w-0">
          {/* mobile filter chips */}
          <div className="lg:hidden flex gap-2 overflow-x-auto scrollbar-hide mb-4 -mx-1 px-1">
            {craftTypes.map((type, i) => (
              <Button
                key={i}
                onClick={() => setActiveCraft(type)}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors ${activeCraft === type ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)]' : 'bg-white border-stone-200 text-stone-600 hover:border-[var(--primary-color)]'}`}
              >
                {type}
              </Button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <nav className="text-sm text-stone-500 mb-4 sm:mb-0">
              <span className="font-medium text-[var(--text-secondary)]">Marketplace</span>
            </nav>
            <div className="flex items-center gap-3">
              {user?.role === 'artist' && (
                <Button
                  onClick={() => router.push('/marketplace/create')}
                  className="flex items-center gap-1.5 bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[var(--secondary-color)] transition-colors shadow-md"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  List Product
                </Button>
              )}
            </div>
          </div>

          {/* product grid */}
          {filtered.length === 0 && (
            <EmptyState description="No products available yet." icon="storefront" />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((product, i) => (
              <div
                key={product._id || i}
                className="bg-white rounded-xl overflow-hidden card-shadow group hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
                onClick={() =>
                  router.push(`/marketplace/product?id=${encodeURIComponent(product._id)}`)
                }
              >
                <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                  <Image
                    alt={product.name}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    src={product.img || product.images?.[0] || '/placeholder.png'}
                    fill
                    sizes="(max-width: 1280px) 100vw, 33vw"
                    unoptimized
                  />
                  {(product.badge || product.stock <= 2) && (
                    <span
                      className={`absolute bottom-3 left-3 ${product.badge === 'New Arrival' ? 'bg-[var(--gold)]' : 'bg-black/60'} text-white text-xs px-2 py-1 rounded backdrop-blur-sm`}
                    >
                      {product.badge || (product.stock <= 2 ? `Only ${product.stock} left` : '')}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-xs font-bold text-[var(--secondary-color)] uppercase tracking-wider">
                      {product.category}
                    </div>
                    {product.rating ? (
                      <div className="flex items-center gap-1 text-xs text-stone-500">
                        <span className="material-symbols-outlined text-yellow-400 text-sm filled">
                          star
                        </span>
                        {product.rating} ({product.reviewCount || 0})
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-stone-500">
                        <span className="material-symbols-outlined text-stone-300 text-sm">
                          star
                        </span>
                        New
                      </div>
                    )}
                  </div>
                  <h3 className="font-display text-lg font-bold text-[var(--text-secondary)] mb-1 leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-xs text-stone-500 mb-3">
                    By{' '}
                    <span className="text-stone-800 font-medium">
                      {product.seller?.fullName || 'Artisan'}
                    </span>
                  </p>
                  <div className="flex items-end justify-between mb-4">
                    <div className="flex flex-col">
                      {product.originalPrice && (
                        <span className="text-xs text-stone-400 line-through">
                          ₹{product.originalPrice?.toLocaleString?.()}
                        </span>
                      )}
                      <span className="text-xl font-bold text-[var(--text-primary)]">
                        ₹ {product.price?.toLocaleString?.() || product.price}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={(e) => addToCart(e, product._id)}
                      disabled={cartLoading[product._id]}
                      className="text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-lg">shopping_cart</span>
                      {cartLoading[product._id] ? '...' : 'Add'}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={(e) => addToCart(e, product._id, true)}
                      disabled={cartLoading[product._id]}
                      className="text-sm shadow-md disabled:opacity-50"
                    >
                      Buy Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
