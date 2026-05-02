'use client';
import AppShell from '@/components/AppShell';
import {
  Button,
  FormInput,
  FormSelect,
  FormStepper,
  FormTextarea,
  Loader,
  SurfaceCard,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { campaignAPI, mediaAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

const CATEGORY_MAP = {
  'Visual Arts': 'visualArts',
  'Performing Arts': 'performingArts',
  'Textiles & Weaving': 'textiles',
  'Heritage & Restoration': 'heritage',
  Music: 'music',
  'Education & Workshop': 'education',
};

export default function CreateCampaignPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const showToast = useToast();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    category: 'Visual Arts',
    shortDescription: '',
    location: '',
    fullStory: '',
    coverImage: '',
    videoUrl: '',
    goalAmount: '',
    duration: '30',
    tags: '',
  });

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setImageUploading(true);
    try {
      const res = await mediaAPI.upload(file);
      setForm((prev) => ({ ...prev, coverImage: res.data?.url || '' }));
      showToast('Image uploaded!', 'success');
    } catch (err) {
      showToast('Image upload failed. Please try again.', 'error');
      setImagePreview(null);
    }
    setImageUploading(false);
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.title.trim()) {
        showToast('Campaign title is required.', 'warning');
        return false;
      }
      if (!form.shortDescription.trim()) {
        showToast('Short description is required.', 'warning');
        return false;
      }
    }
    if (step === 2) {
      if (!form.fullStory.trim()) {
        showToast('Full story is required.', 'warning');
        return false;
      }
      if (!form.coverImage) {
        showToast('Please upload a cover image.', 'warning');
        return false;
      }
    }
    if (step === 3) {
      if (!form.goalAmount || Number(form.goalAmount) < 1) {
        showToast('Please enter a valid funding goal.', 'warning');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      await campaignAPI.createCampaign({
        title: form.title.trim(),
        category: CATEGORY_MAP[form.category] || 'visualArts',
        shortDescription: form.shortDescription.trim(),
        location: form.location.trim(),
        fullStory: form.fullStory.trim(),
        coverImage: form.coverImage,
        videoUrl: form.videoUrl.trim(),
        goalAmount: Number(form.goalAmount),
        duration: Number(form.duration),
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      showToast('Campaign published successfully!', 'success');
      router.push('/crowdfunding');
    } catch (err) {
      showToast(err?.message || 'Failed to create campaign.', 'error');
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
          <span className="material-symbols-outlined text-5xl text-[var(--terracotta)]">lock</span>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] font-display">
            Artists Only
          </h2>
          <p className="text-[var(--text-secondary)] max-w-sm">
            Only registered artists can start a crowdfunding campaign. Update your role in Settings.
          </p>
          <Button
            onClick={() => router.push('/crowdfunding')}
            className="mt-2 bg-[var(--primary-color)] text-white px-6 py-2 rounded-full font-bold"
          >
            Back to Campaigns
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="py-2">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 font-display">
          Create a Campaign
        </h1>
        <p className="text-[var(--text-secondary)] mb-8">
          Launch your crowdfunding campaign and let the community support your art.
        </p>

        <FormStepper currentStep={step} steps={['Project Info', 'Story & Media', 'Funding Goal']} />

        <SurfaceCard className="p-4 sm:p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                  Campaign Title *
                </label>
                <FormInput
                  className="focus:border-transparent"
                  placeholder="Give your project a catchy title"
                  type="text"
                  value={form.title}
                  onChange={set('title')}
                  maxLength={60}
                />
                <p className="text-xs text-stone-400 mt-1 text-right">{form.title.length}/60</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                  Category *
                </label>
                <FormSelect value={form.category} onChange={set('category')}>
                  {Object.keys(CATEGORY_MAP).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </FormSelect>
              </div>
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                  Short Description *
                </label>
                <FormTextarea
                  placeholder="Describe your campaign in 1-2 sentences..."
                  rows={3}
                  value={form.shortDescription}
                  onChange={set('shortDescription')}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                  Location
                </label>
                <FormInput
                  placeholder="City, State, India"
                  type="text"
                  value={form.location}
                  onChange={set('location')}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                  Full Story *
                </label>
                <FormTextarea
                  placeholder="Tell backers why this project matters..."
                  rows={8}
                  value={form.fullStory}
                  onChange={set('fullStory')}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-2 block">
                  Cover Image *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <div
                  className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center hover:border-[var(--primary-color)] transition-colors cursor-pointer relative overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                  style={imagePreview ? { padding: 0, border: 'none' } : {}}
                >
                  {imagePreview ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Cover preview"
                        className="w-full h-64 object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                        <span className="text-white text-sm font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-lg">edit</span> Change
                          Image
                        </span>
                      </div>
                      {imageUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                          <span className="text-white text-sm">Uploading...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-4xl text-stone-400 mb-2 block">
                        cloud_upload
                      </span>
                      <p className="text-sm text-stone-500">
                        {imageUploading ? 'Uploading...' : 'Click to upload cover image'}
                      </p>
                      <p className="text-xs text-stone-400 mt-1">JPEG, PNG up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-2 block">
                  Video (Optional)
                </label>
                <FormInput
                  placeholder="YouTube or Vimeo URL"
                  type="url"
                  value={form.videoUrl}
                  onChange={set('videoUrl')}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                    Funding Goal (₹) *
                  </label>
                  <FormInput
                    placeholder="100000"
                    type="number"
                    min="1"
                    value={form.goalAmount}
                    onChange={set('goalAmount')}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                    Campaign Duration *
                  </label>
                  <FormSelect value={form.duration} onChange={set('duration')}>
                    <option value="15">15 days</option>
                    <option value="30">30 days</option>
                    <option value="45">45 days</option>
                    <option value="60">60 days</option>
                  </FormSelect>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                  Tags <span className="font-normal text-stone-400">(comma separated)</span>
                </label>
                <FormInput
                  placeholder="e.g. pottery, heritage, rajasthan"
                  type="text"
                  value={form.tags}
                  onChange={set('tags')}
                />
                {form.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.tags
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tag, i) => (
                        <span
                          key={i}
                          className="bg-orange-100 text-[var(--primary-color)] text-xs px-2.5 py-0.5 rounded-full border border-orange-200 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                )}
              </div>
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[var(--terracotta)]">
                    info
                  </span>
                  Summary
                </h4>
                <ul className="text-sm text-stone-600 space-y-1 mt-2">
                  <li>
                    <strong>Title:</strong> {form.title || '—'}
                  </li>
                  <li>
                    <strong>Goal:</strong>{' '}
                    {form.goalAmount ? `₹${Number(form.goalAmount).toLocaleString('en-IN')}` : '—'}
                  </li>
                  <li>
                    <strong>Duration:</strong> {form.duration} days
                  </li>
                  <li>
                    <strong>Category:</strong> {form.category}
                  </li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-stone-100">
            <Button
              onClick={() => setStep(Math.max(1, step - 1))}
              className={`px-6 py-2 rounded-lg text-sm font-medium border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors ${step === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={step === 1}
            >
              Back
            </Button>
            <div className="flex gap-3">
              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={imageUploading}
                  className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[var(--secondary-color)] transition-colors shadow-md disabled:opacity-50"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish Campaign'}
                </Button>
              )}
            </div>
          </div>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
