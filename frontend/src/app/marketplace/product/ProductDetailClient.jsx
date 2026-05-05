'use client';
import AppShell from '@/components/AppShell';
import { ImageVerificationCard, ImageVerificationSummary, useImageVerification } from '@/components/ImageVerification';
import { Button, Loader } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { cartAPI, productAPI } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`text-2xl transition-transform ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          aria-label={`${star} star`}
        >
          <span
            className={`material-symbols-outlined ${(hovered || value) >= star ? 'text-yellow-400 filled' : 'text-stone-300'} text-xl`}
          >
            star
          </span>
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const d = new Date(review.createdAt);
  const dateStr = d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return (
    <div className="py-5 border-b border-stone-100 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-[var(--primary-color)] flex items-center justify-center flex-shrink-0 overflow-hidden">
          {review.reviewer?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={review.reviewer.avatar}
              alt={review.reviewer.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-sm">
              {review.reviewer?.fullName?.[0] || '?'}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="font-semibold text-sm text-[var(--text-primary)]">
              {review.reviewer?.fullName || 'Anonymous'}
            </p>
            <span className="text-xs text-stone-400">{dateStr}</span>
          </div>
          <StarRating value={review.rating} readonly />
          {review.text && (
            <p className="text-sm text-stone-600 mt-1 leading-relaxed">{review.text}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const showToast = useToast();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);
  const [qty, setQty] = useState(1);

  // review form
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // edit / delete state
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editImageUploading, setEditImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  // img verification hook for edit
  const {
    imageFiles: editImageFiles,
    imagePreviews: editImagePreviews,
    verifications: editVerifications,
    handleImageChange: handleImageVerificationChange,
    removeImage: removeEditImage,
    recordVerification: recordEditVerification,
    getValidImages: getValidEditImages,
  } = useImageVerification();

  const isOwner = user && product && product.seller?._id === user._id;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [pdtRes, revRes] = await Promise.all([
          productAPI.getProduct(id),
          productAPI.getReviews(id),
        ]);
        const p = pdtRes.data?.product;

        if (cancelled) return;

        setProduct(p);
        setActiveImg(0);
        setQty(1);
        setEditForm({
          name: p?.name || '',
          description: p?.description || '',
          category: p?.category || 'textiles',
          price: p?.price || '',
          originalPrice: p?.originalPrice || '',
          region: p?.region || '',
          stock: p?.stock ?? 0,
          badge: p?.badge || '',
        });
        setReviews(revRes.data?.reviews || []);
      } catch (e) {
        if (cancelled) return;
        if (e?.status !== 401 && e?.status !== 404) console.error(e);
        setProduct(null);
        setReviews([]);
      }
      if (!cancelled) {
        setLoading(false);
      }
    }

    if (!id) {
      setProduct(null);
      setReviews([]);
      setLoading(false);
      return undefined;
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleAddToCart = async (buyNow = false) => {
    setCartLoading(true);
    try {
      await cartAPI.addItem(product._id, qty);
      if (buyNow) router.push('/cart');
      else showToast('Added to cart!', 'success');
    } catch {
      showToast('Failed to add to cart.', 'error');
    }
    setCartLoading(false);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewRating) {
      showToast('Please select a star rating.', 'warning');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await productAPI.addReview(id, reviewRating, reviewText);
      setReviews((prev) => [res.data.review, ...prev]);
      setReviewRating(0);
      setReviewText('');
      showToast('Review submitted!', 'success');

      const pdtRes = await productAPI.getProduct(id);
      setProduct(pdtRes.data?.product);
    } catch (err) {
      showToast(err?.data?.message || err?.message || 'Failed to submit review.', 'error');
    }
    setSubmittingReview(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await productAPI.deleteProduct(id);
      showToast('Product deleted.', 'success');
      router.push('/marketplace');
    } catch (err) {
      showToast(err?.message || 'Failed to delete product.', 'error');
    }
    setDeleting(false);
  };

  const handleEditImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    handleImageVerificationChange(files, 5);
  };

  const uploadNewImages = async () => {
    const validImages = getValidEditImages();
    if (!validImages.length) {
      showToast('Please verify and select valid images.', 'warning');
      return;
    }

    setEditImageUploading(true);
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => {
        if (v !== '' && v !== undefined) fd.append(k, v);
      });
      validImages.forEach((f) => fd.append('images', f));
      const res = await productAPI.updateProduct(id, fd);
      setProduct(res.data?.product);
      removeEditImage(0);
      for (let i = 0; i < validImages.length; i++) {
        removeEditImage(0);
      }
      showToast('Product updated!', 'success');
    } catch (err) {
      showToast(err?.data?.message || err?.message || 'Update failed.', 'error');
    }
    setEditImageUploading(false);
  };

  const handleEditSave = async () => {
    setEditSaving(true);
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => {
        if (v !== '' && v !== undefined) fd.append(k, v);
      });
      const res = await productAPI.updateProduct(id, fd);
      setProduct(res.data?.product);
      setShowEdit(false);
      showToast('Product updated!', 'success');
    } catch (err) {
      showToast(err?.data?.message || err?.message || 'Update failed.', 'error');
    }
    setEditSaving(false);
  };

  if (loading)
    return (
      <AppShell>
        <Loader />
      </AppShell>
    );

  if (!product) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <span className="material-symbols-outlined text-5xl text-stone-400">error_outline</span>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] font-display">
            Product Not Found
          </h2>
          <Button
            onClick={() => router.push('/marketplace')}
            className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-full font-bold"
          >
            Back to Marketplace
          </Button>
        </div>
      </AppShell>
    );
  }

  const images = product.images?.length ? product.images : [product.img || '/placeholder.png'];
  const avgRating = product.rating || 0;
  const reviewCount = product.reviewCount || 0;

  return (
    <AppShell>
      <div className="py-2 max-w-6xl mx-auto">
        {/* breadcrumb */}
        <nav className="text-sm text-stone-500 mb-6 flex items-center gap-1 flex-wrap">
          <Link className="hover:text-[var(--primary-color)]" href="/marketplace">
            Marketplace
          </Link>
          <span>/</span>
          <span className="text-[var(--text-secondary)] font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* pdt section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
          <div>
            {/* image gallery */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 mb-3 shadow-md">
              <Image
                src={images[activeImg] || '/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized
              />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-[var(--primary-color)] text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  {product.badge}
                </span>
              )}
              {product.stock <= 2 && product.stock > 0 && !product.badge && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  Only {product.stock} left!
                </span>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Out of Stock</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${activeImg === i ? 'border-[var(--primary-color)] shadow-md' : 'border-transparent hover:border-stone-300'}`}
                  >
                    <Image
                      src={img}
                      alt={`view ${i + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-xs font-bold text-[var(--secondary-color)] uppercase tracking-wider mb-1">
                  {product.category}
                </p>
                <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] leading-tight">
                  {product.name}
                </h1>
              </div>
            </div>

            {/* seller */}
            <p className="text-sm text-stone-500 mb-3">
              By{' '}
              <span className="text-stone-800 font-semibold">
                {product.seller?.fullName || 'Artisan'}
              </span>
              {product.region && <span className="text-stone-400"> · {product.region}</span>}
            </p>

            {/* rating */}
            <div className="flex items-center gap-2 mb-4">
              <StarRating value={Math.round(avgRating)} readonly />
              <span className="text-sm font-semibold text-stone-700">
                {avgRating > 0 ? avgRating.toFixed(1) : 'No ratings'}
              </span>
              {reviewCount > 0 && (
                <span className="text-sm text-stone-400">
                  ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              )}
            </div>

            {/* price */}
            <div className="flex items-baseline gap-3 mb-6">
              {product.originalPrice && (
                <span className="text-sm text-stone-400 line-through">
                  ₹{product.originalPrice?.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-3xl font-bold text-[var(--text-primary)]">
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <span className="text-sm font-bold text-green-600">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                </span>
              )}
            </div>

            <p className="text-stone-600 mb-6 leading-relaxed text-sm">
              {product.description || 'No description provided.'}
            </p>

            {product.stock > 0 ? (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-stone-500">Qty:</span>
                <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-stone-500 hover:bg-stone-50 transition-colors text-lg leading-none"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-semibold text-sm min-w-[3rem] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="px-3 py-2 text-stone-500 hover:bg-stone-50 transition-colors text-lg leading-none"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-stone-400">{product.stock} in stock</span>
              </div>
            ) : (
              <div className="mb-6">
                <span className="inline-block bg-red-50 text-red-600 text-sm font-semibold px-3 py-1 rounded-full border border-red-100">
                  Out of Stock
                </span>
              </div>
            )}

            <div className="flex gap-3 mb-6">
              <Button
                variant="outline"
                disabled={cartLoading || product.stock === 0}
                onClick={() => handleAddToCart(false)}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">shopping_cart</span>
                {cartLoading ? 'Adding...' : 'Add to Cart'}
              </Button>
              <Button
                variant="primary"
                disabled={cartLoading || product.stock === 0}
                onClick={() => handleAddToCart(true)}
                className="flex-1 text-sm font-semibold shadow-md disabled:opacity-50"
              >
                Buy Now
              </Button>
            </div>

            {isOwner && (
              <div className="flex gap-2 pt-4 border-t border-stone-100">
                <Button
                  onClick={() => setShowEdit((v) => !v)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50 text-sm font-medium transition-colors"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                  Edit Product
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {isOwner && showEdit && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-10">
            <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--primary-color)]">edit</span>
              Edit Product Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {[
                { label: 'Product Name *', key: 'name', type: 'text' },
                { label: 'Price (₹) *', key: 'price', type: 'number' },
                { label: 'Original Price (₹)', key: 'originalPrice', type: 'number' },
                { label: 'Stock', key: 'stock', type: 'number' },
                { label: 'Region', key: 'region', type: 'text' },
                {
                  label: 'Badge',
                  key: 'badge',
                  type: 'text',
                  placeholder: 'e.g. New Arrival, Bestseller',
                },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-stone-500 mb-1 block uppercase tracking-wide">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={editForm[key] ?? ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder || ''}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                  />
                </div>
              ))}
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-stone-500 mb-1 block uppercase tracking-wide">
                Category *
              </label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary-color)]"
              >
                {['textiles', 'woodwork', 'jewelry', 'pottery', 'metalCrafts', 'paintings'].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-stone-500 mb-1 block uppercase tracking-wide">
                Description
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary-color)] resize-none"
                placeholder="Describe your product..."
              />
            </div>
            <div className="mb-6">
              <label className="text-xs font-semibold text-stone-500 mb-2 block uppercase tracking-wide">
                Add New Images
              </label>

              {editVerifications.length > 0 && <ImageVerificationSummary verifications={editVerifications} />}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleEditImageChange}
              />

              <div className="space-y-3">
                {editImagePreviews.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {editImagePreviews.map((src, i) => (
                        <ImageVerificationCard
                          key={i}
                          imageFile={editImageFiles[i]}
                          imagePreview={src}
                          verificationMode="marketplace"
                          onVerify={(result) => recordEditVerification(i, result)}
                          onRemove={() => removeEditImage(i)}
                        />
                      ))}
                    </div>
                    {editImagePreviews.length > 0 && (
                      <Button
                        type="button"
                        onClick={uploadNewImages}
                        disabled={editImageUploading || !getValidEditImages().length}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
                      >
                        {editImageUploading ? 'Uploading...' : `Upload ${getValidEditImages().length} Image(s)`}
                      </Button>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-stone-300 rounded-lg p-4 text-center hover:border-[var(--primary-color)] transition-colors"
                  >
                    <span className="material-symbols-outlined text-2xl text-stone-400 mb-1 block">
                      add_photo_alternate
                    </span>
                    <span className="text-sm text-stone-500">Click to add images</span>
                  </button>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="text-xs font-semibold text-stone-500 mb-2 block uppercase tracking-wide">
                Current Images
              </label>
              <div className="flex flex-wrap gap-2">
                {product.images?.map((src, i) => (
                  <div
                    key={i}
                    className="relative w-16 h-16 rounded-lg overflow-hidden border border-stone-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`img ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowEdit(false)}
                className="px-5 py-2 rounded-lg border border-stone-300 text-stone-600 text-sm hover:bg-stone-50 transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSave}
                disabled={editSaving}
                className="px-5 py-2 rounded-lg bg-[var(--primary-color)] text-white text-sm font-bold hover:bg-[var(--secondary-color)] transition-colors shadow-md disabled:opacity-50"
              >
                {editSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-6">
              Ratings & Reviews
            </h2>
            <div className="bg-[var(--primary-light,#fef3ec)] rounded-2xl p-6 text-center mb-6">
              <p className="text-6xl font-bold text-[var(--primary-color)]">
                {avgRating > 0 ? avgRating.toFixed(1) : '—'}
              </p>
              <StarRating value={Math.round(avgRating)} readonly />
              <p className="text-stone-500 text-sm mt-1">
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* write review */}
            {user && !isOwner && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3 text-sm">
                  Write a Review
                </h3>
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  <div>
                    <label className="text-xs text-stone-500 mb-1 block">Your Rating *</label>
                    <StarRating value={reviewRating} onChange={setReviewRating} />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 mb-1 block">Your Review</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={3}
                      placeholder="Share your experience with this product..."
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary-color)] resize-none transition-colors"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-[var(--primary-color)] text-white py-2 rounded-lg text-sm font-bold hover:bg-[var(--secondary-color)] transition-colors shadow-sm disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </form>
              </div>
            )}
            {!user && (
              <p className="text-sm text-stone-500 text-center">
                <Link
                  href="/login"
                  className="text-[var(--primary-color)] font-semibold hover:underline"
                >
                  Sign in
                </Link>{' '}
                to leave a review.
              </p>
            )}
          </div>

          {/* review list */}
          <div className="lg:col-span-3">
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3 bg-stone-50 rounded-2xl">
                <span className="material-symbols-outlined text-4xl text-stone-300">
                  rate_review
                </span>
                <p className="text-stone-500 font-medium">No reviews yet.</p>
                <p className="text-stone-400 text-sm">Be the first to review this product!</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm divide-y divide-stone-100 pl-4 pr-4">
                {reviews.map((r, i) => (
                  <ReviewCard key={r._id || i} review={r} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
