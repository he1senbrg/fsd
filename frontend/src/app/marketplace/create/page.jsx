'use client';
import AppShell from '@/components/AppShell';
import { ImageVerificationCard, ImageVerificationSummary, useImageVerification } from '@/components/ImageVerification';
import { Button, FormInput, FormSelect, FormTextarea, Loader, SurfaceCard } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { productAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

const CATEGORIES = [
  { label: 'Textiles & Weaving', value: 'textiles' },
  { label: 'Woodwork & Carving', value: 'woodwork' },
  { label: 'Jewelry & Ornaments', value: 'jewelry' },
  { label: 'Pottery & Ceramics', value: 'pottery' },
  { label: 'Metal Crafts', value: 'metalCrafts' },
  { label: 'Paintings & Art', value: 'paintings' },
];

const REGIONS = [
  'Rajasthan',
  'Kerala',
  'West Bengal',
  'Gujarat',
  'Maharashtra',
  'Tamil Nadu',
  'Uttar Pradesh',
  'Odisha',
  'Other',
];

export default function CreateProductPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const showToast = useToast();
  const fileInputRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [customTags, setCustomTags] = useState('');
  const {
    imageFiles,
    imagePreviews,
    verifications,
    handleImageChange: handleImageVerificationChange,
    removeImage: removeVerifiedImage,
    recordVerification,
    getValidImages,
  } = useImageVerification();

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'textiles',
    price: '',
    originalPrice: '',
    region: 'Rajasthan',
    stock: '1',
    badge: '',
  });

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    handleImageVerificationChange(files, 5);
  };

  const removeImage = (idx) => {
    removeVerifiedImage(idx);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Product name is required.', 'warning');
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      showToast('Please enter a valid price.', 'warning');
      return;
    }
    if (!form.stock || Number(form.stock) < 0) {
      showToast('Stock must be 0 or more.', 'warning');
      return;
    }
    
    const validImages = getValidImages();
    if (validImages.length === 0) {
      showToast('Please upload at least one verified product image.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('description', form.description.trim());
      fd.append('category', form.category);
      fd.append('price', form.price);
      if (form.originalPrice) fd.append('originalPrice', form.originalPrice);
      fd.append('region', form.region);
      fd.append('stock', form.stock);
      if (form.badge.trim()) fd.append('badge', form.badge.trim());
      
      const customTagsList = customTags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      
      if (customTagsList.length > 0) {
        fd.append('tags', JSON.stringify(customTagsList));
      }

      // only add verified images
      validImages.forEach((f) => fd.append('images', f));

      await productAPI.createProduct(fd);
      showToast('Product listed successfully!', 'success');
      router.push('/marketplace');
    } catch (err) {
      showToast(err?.data?.message || err?.message || 'Failed to create product.', 'error');
    }
    setSubmitting(false);
  };

  if (authLoading)
    return (
      <AppShell>
        <Loader />
      </AppShell>
    );

  if (!user || user.role !== 'artist') {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <span className="material-symbols-outlined text-6xl text-[var(--terracotta)]">lock</span>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] font-display">
            Artists Only
          </h2>
          <p className="text-[var(--text-secondary)] max-w-sm">
            Only registered artists can list products on the marketplace. Update your role in
            Settings.
          </p>
          <Button
            onClick={() => router.push('/marketplace')}
            className="mt-2 bg-[var(--primary-color)] text-white px-6 py-2 rounded-full font-bold"
          >
            Back to Marketplace
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="py-2 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] font-display mb-2">
            List a Product
          </h1>
          <p className="text-[var(--text-secondary)]">
            Showcase your craft to buyers across India. Fill in the details below to list your
            product.
          </p>
        </div>

        <SurfaceCard className="p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* images */}
            <div>
              <label className="text-sm font-semibold text-[var(--text-primary)] mb-2 block">
                Product Images * <span className="font-normal text-stone-400">(up to 5)</span>
              </label>

              {/* Verification Summary */}
              {verifications.length > 0 && <ImageVerificationSummary verifications={verifications} />}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
              <div className="flex flex-wrap gap-3">
                {imagePreviews.map((src, i) => (
                  <ImageVerificationCard
                    key={i}
                    imageFile={imageFiles[i]}
                    imagePreview={src}
                    verificationMode="marketplace"
                    onVerify={(result) => recordVerification(i, result)}
                    onRemove={() => removeImage(i)}
                  />
                ))}
                {imagePreviews.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors gap-1"
                  >
                    <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                    <span className="text-xs">Add Photo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Custom tags */}
            <div>
              <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                Tags <span className="font-normal text-stone-400">(optional)</span>
              </label>
              <FormInput
                value={customTags}
                onChange={(e) => setCustomTags(e.target.value)}
                placeholder="e.g., handmade, organic, sustainable (comma-separated)"
                type="text"
              />
            </div>

            {/* name */}
            <div>
              <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                Product Name *
              </label>
              <FormInput
                value={form.name}
                onChange={set('name')}
                placeholder="e.g., Hand-woven Banarasi Silk Saree"
                type="text"
                maxLength={100}
              />
              <p className="text-xs text-stone-400 mt-1 text-right">{form.name.length}/100</p>
            </div>

            {/* description */}
            <div>
              <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                Description
              </label>
              <FormTextarea
                value={form.description}
                onChange={set('description')}
                rows={4}
                placeholder="Describe the craftsmanship, materials, dimensions, and what makes this piece special..."
              />
            </div>

            {/* category & region */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                  Category *
                </label>
                <FormSelect value={form.category} onChange={set('category')}>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </FormSelect>
              </div>
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                  Region
                </label>
                <FormSelect value={form.region} onChange={set('region')}>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </FormSelect>
              </div>
            </div>

            {/* price, original price, stock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                  Price (₹) *
                </label>
                <FormInput
                  value={form.price}
                  onChange={set('price')}
                  placeholder="e.g., 2500"
                  type="number"
                  min="1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                  Original Price (₹)
                  <span className="font-normal text-stone-400 text-xs ml-1">for discount</span>
                </label>
                <FormInput
                  value={form.originalPrice}
                  onChange={set('originalPrice')}
                  placeholder="e.g., 3200"
                  type="number"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                  Stock Qty *
                </label>
                <FormInput
                  value={form.stock}
                  onChange={set('stock')}
                  placeholder="e.g., 10"
                  type="number"
                  min="0"
                />
              </div>
            </div>

            {/* badge */}
            <div>
              <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                Badge <span className="font-normal text-stone-400">(optional)</span>
              </label>
              <FormInput
                value={form.badge}
                onChange={set('badge')}
                placeholder='e.g., "New Arrival", "Bestseller", "Limited Edition"'
                type="text"
              />
            </div>

            {/* summary strip */}
            {form.name && form.price && (
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 flex items-center gap-4 flex-wrap">
                <span className="material-symbols-outlined text-[var(--primary-color)]">
                  inventory_2
                </span>
                <div className="text-sm text-stone-700">
                  <strong>{form.name}</strong>
                  {form.category && <span className="text-stone-400 ml-2">· {form.category}</span>}
                  {form.price && (
                    <span className="font-bold text-[var(--primary-color)] ml-2">
                      ₹{Number(form.price).toLocaleString('en-IN')}
                    </span>
                  )}
                  {form.stock && (
                    <span className="text-stone-400 ml-2">· {form.stock} in stock</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-stone-100">
              <Button
                type="button"
                onClick={() => router.push('/marketplace')}
                className="px-6 py-2 rounded-lg border border-stone-300 text-stone-600 text-sm hover:bg-stone-50 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[var(--primary-color)] text-white px-8 py-2 rounded-lg text-sm font-bold hover:bg-[var(--secondary-color)] transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">publish</span>
                {submitting ? 'Listing...' : 'List Product'}
              </Button>
            </div>
          </form>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
