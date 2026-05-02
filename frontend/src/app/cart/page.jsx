'use client';
import AppShell from '@/components/AppShell';
import { Button, Loader } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { cartAPI } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const router = useRouter();
  const showToast = useToast();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState({});
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    async function loadCart() {
      try {
        const res = await cartAPI.getCart();
        setCart(res.data?.cart || { items: [] });
      } catch (e) {
        if (e?.status !== 401) console.error(e);
      }
      setLoading(false);
    }
    loadCart();
  }, []);

  const removeItem = async (itemId) => {
    setRemoving((prev) => ({ ...prev, [itemId]: true }));
    try {
      await cartAPI.removeItem(itemId);
      setCart((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i._id !== itemId),
      }));
      showToast('Item removed from cart.', 'success');
    } catch (e) {
      if (e?.status !== 401) console.error(e);
      showToast('Failed to remove item.', 'error');
    }
    setRemoving((prev) => ({ ...prev, [itemId]: false }));
  };

  const changeQty = async (item, delta) => {
    const newQty = (item.quantity || 1) + delta;
    if (newQty < 1) return removeItem(item._id);
    setUpdating((prev) => ({ ...prev, [item._id]: true }));
    try {
      await cartAPI.updateItem(item._id, newQty);
      setCart((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i._id === item._id ? { ...i, quantity: newQty } : i)),
      }));
    } catch (e) {
      if (e?.status !== 401) console.error(e);
      showToast('Failed to update quantity.', 'error');
    }
    setUpdating((prev) => ({ ...prev, [item._id]: false }));
  };

  const subtotal =
    cart?.items?.reduce(
      (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1),
      0,
    ) || 0;
  const platformFee = Math.round(subtotal * 0.05);
  const total = subtotal + platformFee;

  if (loading) {
    return (
      <AppShell>
        <Loader />
      </AppShell>
    );
  }

  const items = cart?.items || [];

  return (
    <AppShell>
      <div className="py-2">
        {/* breadcrumb nav */}
        <nav className="text-sm text-stone-500 mb-6 flex items-center gap-1">
          <Link href="/marketplace" className="hover:text-[var(--primary-color)] transition-colors">
            Marketplace
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="font-medium text-[var(--text-secondary)]">My Cart</span>
        </nav>

        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8 font-display flex items-center gap-3">
          <span className="material-symbols-outlined text-[var(--primary-color)]">
            shopping_cart
          </span>
          My Cart
          {items.length > 0 && (
            <span className="text-base font-normal text-stone-500">
              ({items.length} item{items.length > 1 ? 's' : ''})
            </span>
          )}
        </h1>

        {items.length === 0 ? (
          /* cart empty */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-5xl text-[var(--primary-color)]/40">
                shopping_cart
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 font-display">
              Your cart is empty
            </h2>
            <p className="text-stone-500 mb-8 max-w-sm">
              Discover handcrafted treasures from talented artisans across India.
            </p>
            <Link
              href="/marketplace"
              className="btn-primary px-8 py-3 text-base shadow-md flex items-center gap-2"
            >
              <span className="material-symbols-outlined">storefront</span>
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* cart items */}
            <div className="flex-1 space-y-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow-sm border border-orange-100 p-4 flex gap-4 group"
                >
                  {/* pdt img */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                    <Image
                      src={item.product?.images?.[0] || '/placeholder.png'}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                      width={96}
                      height={96}
                      unoptimized
                    />
                  </div>
                  {/* details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-[var(--text-primary)] font-display leading-tight mb-1">
                          {item.product?.name || 'Product'}
                        </h3>
                        <p className="text-xs text-stone-500 mb-2">
                          {item.product?.category && (
                            <span className="uppercase tracking-wider font-semibold text-[var(--secondary-color)]">
                              {item.product.category}
                            </span>
                          )}
                          {item.product?.seller?.fullName &&
                            ` · by ${item.product.seller.fullName}`}
                        </p>
                        <p className="text-lg font-bold text-[var(--text-primary)]">
                          ₹ {((item.product?.price || 0) * (item.quantity || 1)).toLocaleString()}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-stone-400">
                            ₹ {(item.product?.price || 0).toLocaleString()} × {item.quantity}
                          </p>
                        )}
                      </div>
                      {/* stock warning */}
                      {item.product?.stock <= 5 && (
                        <span className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded-full font-medium flex-shrink-0">
                          Only {item.product.stock} left
                        </span>
                      )}
                    </div>
                    {/* qty and remove */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                        <Button
                          onClick={() => changeQty(item, -1)}
                          disabled={updating[item._id]}
                          className="w-9 h-9 flex items-center justify-center hover:bg-stone-100 transition-colors text-stone-600 disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-sm">remove</span>
                        </Button>
                        <span className="w-10 h-9 flex items-center justify-center font-bold text-sm text-[var(--text-primary)] border-x border-stone-200">
                          {updating[item._id] ? (
                            <span className="material-symbols-outlined text-sm animate-spin">
                              progress_activity
                            </span>
                          ) : (
                            item.quantity || 1
                          )}
                        </span>
                        <Button
                          onClick={() => changeQty(item, 1)}
                          disabled={updating[item._id] || item.quantity >= item.product?.stock}
                          className="w-9 h-9 flex items-center justify-center hover:bg-stone-100 transition-colors text-stone-600 disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                        </Button>
                      </div>
                      <Button
                        onClick={() => removeItem(item._id)}
                        disabled={removing[item._id]}
                        className="flex items-center gap-1 text-sm text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        {removing[item._id] ? (
                          <span className="material-symbols-outlined text-sm animate-spin">
                            progress_activity
                          </span>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm">delete</span>Remove
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* continue shopping */}
              <Link
                href="/marketplace"
                className="flex items-center gap-2 text-sm text-[var(--primary-color)] font-medium hover:underline mt-2"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Continue Shopping
              </Link>
            </div>

            {/* summary */}
            <div className="lg:w-80 flex-shrink-0 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
                <h2 className="font-bold text-lg text-[var(--text-primary)] font-display mb-5">
                  Order Summary
                </h2>
                <div className="space-y-3 text-sm text-stone-600">
                  <div className="flex justify-between">
                    <span>
                      Subtotal ({items.length} item{items.length > 1 ? 's' : ''})
                    </span>
                    <span className="font-medium text-[var(--text-primary)]">
                      ₹ {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      Platform Fee
                      <span className="text-xs text-stone-400">(5%)</span>
                    </span>
                    <span className="font-medium text-[var(--text-primary)]">
                      ₹ {platformFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-400">
                    <span>Shipping</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>
                  <div className="border-t border-stone-100 pt-3 flex justify-between font-bold text-base text-[var(--text-primary)]">
                    <span>Total</span>
                    <span>₹ {total.toLocaleString()}</span>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    router.push(
                      `/payment?type=cart&amount=${total}&title=${encodeURIComponent('Cart Checkout')}`,
                    )
                  }
                  className="w-full bg-[var(--primary-color)] text-white py-3.5 rounded-xl font-bold mt-6 hover:bg-[var(--secondary-color)] transition-colors shadow-md flex items-center justify-center gap-2 text-base"
                >
                  <span className="material-symbols-outlined">lock</span>
                  Proceed to Checkout
                </Button>
                {/* trust */}
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-stone-400">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-green-500">
                      verified_user
                    </span>
                    Secure
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-blue-500">
                      payments
                    </span>
                    Encrypted
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-orange-400">
                      cached
                    </span>
                    Easy Returns
                  </span>
                </div>
              </div>

              {/* message */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                <p className="text-xs text-[var(--text-secondary)] font-medium mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[var(--primary-color)]">
                    volunteer_activism
                  </span>
                  Support Artisans
                </p>
                <p className="text-xs text-stone-500">
                  Every purchase directly supports a skilled artisan and helps preserve India&apos;s
                  cultural heritage.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
