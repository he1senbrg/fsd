'use client';
import AppShell from '@/components/AppShell';
import { Button, FormInput, FormSelect, FormTextarea, SurfaceCard } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { opportunityAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function OpportunityCreatePage() {
  const [title, setTitle] = useState('');
  const [org, setOrg] = useState('');
  const [type, setType] = useState('performance');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [pay, setPay] = useState('');
  const [tags, setTags] = useState('');
  const [publishing, setPublishing] = useState(false);

  const showToast = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter an opportunity title.', 'warning');
      return;
    }
    if (!org.trim()) {
      showToast('Please enter an organization name.', 'warning');
      return;
    }
    if (!description.trim()) {
      showToast('Please enter a description.', 'warning');
      return;
    }
    if (!location.trim()) {
      showToast('Please enter a location.', 'warning');
      return;
    }

    setPublishing(true);
    try {
      const payload = {
        title: title.trim(),
        org: org.trim(),
        type,
        description: description.trim(),
        location: location.trim(),
        deadline: deadline ? new Date(deadline).toISOString() : null,
        pay: pay.trim() || 'Contact for details',
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      await opportunityAPI.createOpportunity(payload);
      showToast('Opportunity created successfully!', 'success');
      router.push('/opportunities?refresh=true');
    } catch (err) {
      console.error('Opportunity creation error:', err);
      showToast(err?.data?.message || err?.message || 'Failed to create opportunity.', 'error');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <AppShell>
      <div className="py-2 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 font-display">
          Create an Opportunity
        </h1>
        <p className="text-[var(--text-secondary)] mb-8">
          Post an open call, gig, or workshop for artists.
        </p>

        <SurfaceCard className="p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                Title *
              </label>
              <FormInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Seeking Classical Dancers"
                type="text"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                  Organization / Group *
                </label>
                <FormInput
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  placeholder="Your organization name"
                  type="text"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                  Opportunity Type *
                </label>
                <FormSelect value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="teaching">Teaching</option>
                  <option value="performance">Performance</option>
                  <option value="exhibition">Exhibition</option>
                  <option value="festival">Festival</option>
                  <option value="workshop">Workshop</option>
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
                rows={5}
                placeholder="Describe the opportunity, requirements, etc."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                  Location / Venue *
                </label>
                <FormInput
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Delhi, Online"
                  type="text"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                  Application Deadline
                </label>
                <FormInput
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  type="date"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                  Compensation / Pay
                </label>
                <FormInput
                  value={pay}
                  onChange={(e) => setPay(e.target.value)}
                  placeholder="e.g., ₹5000, Paid, Unpaid"
                  type="text"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">
                  Tags (comma separated)
                </label>
                <FormInput
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., Kathak, Urgent, Open"
                  type="text"
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-stone-100">
              <Button
                type="submit"
                className="bg-green-600 text-white px-8 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-md flex items-center gap-2"
                disabled={publishing}
              >
                <span className="material-symbols-outlined text-sm">publish</span>
                {publishing ? 'Publishing...' : 'Publish Opportunity'}
              </Button>
            </div>
          </form>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
