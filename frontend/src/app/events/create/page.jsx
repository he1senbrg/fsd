'use client';
import AppShell from '@/components/AppShell';
import {
  Button,
  FormInput,
  FormSelect,
  FormStepper,
  FormTextarea,
  SurfaceCard,
} from '@/components/ui';
import {
  ImageVerificationCard,
  ImageVerificationSummary,
  useImageVerification,
} from '@/components/ImageVerification';
import { useToast } from '@/context/ToastContext';
import { eventAPI, mediaAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useArtForms } from '@/context/ArtFormContext';

export default function EventCreatePage() {
  const [step, setStep] = useState(1);
  const { artForms } = useArtForms();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('performance');
  const [artForm, setArtForm] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [venue, setVenue] = useState('');
  const [eventType, setEventType] = useState('free');
  const [price, setPrice] = useState('');
  const [totalQty, setTotalQty] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const coverInputRef = useRef(null);
  const showToast = useToast();
  const router = useRouter();

  // img verification hook
  const {
    imageFiles,
    imagePreviews,
    verifications,
    handleImageChange: handleImageVerificationChange,
    removeImage: removeVerifiedImage,
    recordVerification,
    getValidImages,
  } = useImageVerification();

  const handleCoverImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    handleImageVerificationChange(files, 1);
  };

  const uploadVerifiedImage = async () => {
    const validImages = getValidImages();
    if (!validImages.length) {
      showToast('Please verify and select a valid image.', 'warning');
      return;
    }

    const file = validImages[0];
    setImageUploading(true);
    try {
      const res = await mediaAPI.upload(file);
      setCoverImage(res.data.url);
      showToast('Image uploaded successfully!', 'success');
      removeVerifiedImage(0);
    } catch (err) {
      console.error(err);
      showToast(err?.data?.message || err?.message || 'Failed to upload image.', 'error');
    }
    setImageUploading(false);
  };

  return (
    <AppShell>
      <div className="py-2">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 font-display">
          Create an Event
        </h1>
        <p className="text-[var(--text-secondary)] mb-8">
          Set up your performance, workshop, or exhibition in a few steps.
        </p>

        <FormStepper
          currentStep={step}
          steps={['Event Details', 'Pricing & Capacity', 'Preview & Publish']}
        />

        <SurfaceCard className="p-4 sm:p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                  Event Title *
                </label>
                <FormInput
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="focus:border-transparent"
                  placeholder="e.g., Evening of Ragas"
                  type="text"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                    Category *
                  </label>
                  <FormSelect value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="performance">Performance</option>
                    <option value="workshop">Workshop</option>
                    <option value="exhibition">Exhibition</option>
                    <option value="festival">Festival</option>
                    <option value="competition">Competition</option>
                  </FormSelect>
                </div>
                <div>
                  <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                    Art Form *
                  </label>
                  <FormSelect value={artForm} onChange={(e) => setArtForm(e.target.value)}>
                    <option value="">Select Art Form</option>
                    {artForms.map((form) => (
                      <option key={form} value={form}>
                        {form}
                      </option>
                    ))}
                  </FormSelect>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                  Description *
                </label>
                <FormTextarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Tell attendees what to expect..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                    Start Date *
                  </label>
                  <FormInput
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    type="datetime-local"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                    End Date *
                  </label>
                  <FormInput
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    type="datetime-local"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                  Venue / Location *
                </label>
                <FormInput
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Venue name, Address, City"
                  type="text"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-2 block">
                  Cover Image
                </label>

                {verifications.length > 0 && (
                  <ImageVerificationSummary verifications={verifications} />
                )}

                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverImageChange}
                  disabled={imageUploading}
                />

                <div className="space-y-3">
                  {imagePreviews.length > 0 ? (
                    <>
                      <div className="flex gap-3">
                        {imagePreviews.map((src, i) => (
                          <ImageVerificationCard
                            key={i}
                            imageFile={imageFiles[i]}
                            imagePreview={src}
                            verificationMode="events"
                            onVerify={(result) => recordVerification(i, result)}
                            onRemove={() => removeVerifiedImage(i)}
                          />
                        ))}
                      </div>
                      <Button
                        type="button"
                        onClick={uploadVerifiedImage}
                        disabled={imageUploading || !getValidImages().length}
                        className="w-full bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg font-bold hover:bg-[var(--secondary-color)] disabled:opacity-50"
                      >
                        {imageUploading ? 'Uploading...' : 'Upload Image'}
                      </Button>
                    </>
                  ) : (
                    <div
                      onClick={() => coverInputRef.current?.click()}
                      className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center hover:border-[var(--primary-color)] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-4xl text-stone-400 mb-2 block">
                        image
                      </span>
                      <p className="text-sm text-stone-500">Click to upload event banner</p>
                    </div>
                  )}

                  {coverImage && (
                    <div className="relative rounded-xl overflow-hidden bg-stone-200 aspect-video">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverImage}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImage('');
                          if (coverInputRef.current) coverInputRef.current.value = '';
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                  Event Type *
                </label>
                <FormSelect value={eventType} onChange={(e) => setEventType(e.target.value)}>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </FormSelect>
              </div>
              {eventType === 'paid' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                        Ticket Price (₹) *
                      </label>
                      <FormInput
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g., 500"
                        type="number"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                        Total Tickets Available *
                      </label>
                      <FormInput
                        value={totalQty}
                        onChange={(e) => setTotalQty(e.target.value)}
                        placeholder="e.g., 200"
                        type="number"
                        min="1"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-stone-50 rounded-xl p-6 text-center">
                <span className="material-symbols-outlined text-5xl text-green-500 mb-3 block">
                  check_circle
                </span>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-display">
                  Event Ready to Publish!
                </h3>
                <p className="text-[var(--text-secondary)] text-sm mb-4">
                  Your event will be visible on KalaSetu and open for bookings once published.
                </p>
                <div className="bg-white rounded-lg border p-4 text-left space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Title:</span>
                    <span className="font-medium">{title || 'TBD'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Category:</span>
                    <span className="font-medium">{category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Start:</span>
                    <span className="font-medium">
                      {startDate ? new Date(startDate).toLocaleDateString() : 'TBD'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">End:</span>
                    <span className="font-medium">
                      {endDate ? new Date(endDate).toLocaleDateString() : 'TBD'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Venue:</span>
                    <span className="font-medium">{venue || 'TBD'}</span>
                  </div>
                  {eventType === 'paid' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Price:</span>
                        <span className="font-medium">₹ {price || 'TBD'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Tickets:</span>
                        <span className="font-medium">{totalQty || 'TBD'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-stone-100">
            <Button
              onClick={() => setStep(Math.max(1, step - 1))}
              className={`px-6 py-2 rounded-lg text-sm font-medium border border-stone-300 text-stone-600 hover:bg-stone-50 ${step === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={step === 1}
            >
              Back
            </Button>
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[var(--secondary-color)] transition-colors shadow-md"
              >
                Next Step
              </Button>
            ) : (
              <Button
                onClick={async () => {
                  if (!title.trim()) {
                    showToast('Please enter an event title.', 'warning');
                    return;
                  }
                  if (!artForm) {
                    showToast('Please select an art form.', 'warning');
                    return;
                  }
                  if (!startDate) {
                    showToast('Please enter a start date.', 'warning');
                    return;
                  }
                  if (!endDate) {
                    showToast('Please enter an end date.', 'warning');
                    return;
                  }
                  if (!venue.trim()) {
                    showToast('Please enter a venue.', 'warning');
                    return;
                  }
                  if (eventType === 'paid' && (!price || !totalQty)) {
                    showToast('Please enter ticket price and quantity.', 'warning');
                    return;
                  }
                  setPublishing(true);
                  try {
                    const payload = {
                      title: title.trim(),
                      category,
                      artForm,
                      description,
                      startDate: new Date(startDate).toISOString(),
                      endDate: new Date(endDate).toISOString(),
                      venue,
                      eventType,
                      ...(coverImage && { coverImage }),
                      ...(eventType === 'paid' && {
                        price: parseFloat(price),
                        totalQty: parseInt(totalQty),
                      }),
                    };
                    console.log('Publishing event with payload:', payload);
                    const response = await eventAPI.createEvent(payload);
                    console.log('Event created response:', response);
                    showToast('Event created successfully!', 'success');
                    router.push('/opportunities?refresh=true');
                  } catch (err) {
                    console.error('Event creation error:', err);
                    showToast(
                      err?.data?.message || err?.message || 'Failed to create event.',
                      'error',
                    );
                  } finally {
                    setPublishing(false);
                  }
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-md flex items-center gap-2"
                disabled={publishing}
              >
                <span className="material-symbols-outlined text-sm">publish</span>
                {publishing ? 'Publishing...' : 'Publish Event'}
              </Button>
            )}
          </div>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
