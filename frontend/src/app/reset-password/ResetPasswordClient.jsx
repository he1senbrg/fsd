'use client';
import { Button } from '@/components/ui';
import { authAPI } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const missingToken = !token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Missing reset token.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authAPI.resetPassword(token, newPassword);
      const jwt = res?.data?.token;
      if (jwt) {
        localStorage.setItem('kalasetu_token', jwt);
        setSuccess('Password updated — signing you in...');
        setTimeout(() => router.push('/feed'), 900);
      } else {
        setSuccess('Password updated. Redirecting to login...');
        setTimeout(() => router.push('/login'), 900);
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] p-6">
      <div className="w-full max-w-md space-y-6 bg-white p-8 lg:p-10 rounded-3xl shadow-sm border border-stone-100">
        <h2 className="text-3xl font-bold text-[#3E2723] font-display mb-1">Reset your password</h2>
        <p className="text-[#5D4037] text-sm mb-4">
          Enter a new password to finish resetting your account. This link expires in 1 hour.
        </p>

        {missingToken && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            Missing reset token. Please use the link from your email.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#5D4037] mb-1">New password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3 text-stone-400 text-[20px]">
                lock
              </span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="block w-full rounded-lg border border-stone-200 bg-stone-50 pl-10 pr-4 py-3 text-[#3E2723] text-sm focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513] shadow-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5D4037] mb-1">
              Confirm password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3 text-stone-400 text-[20px]">
                lock
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
                className="block w-full rounded-lg border border-stone-200 bg-stone-50 pl-10 pr-4 py-3 text-[#3E2723] text-sm focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513] shadow-sm outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              disabled={submitting || !token}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-lg text-sm font-bold text-white bg-[#8B4513] hover:bg-[#703810] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B4513] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Updating...' : 'Set new password'}
            </Button>

            <Button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-lg text-sm font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-300 transition-colors"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
