'use client';
import { Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/lib/api';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [role, setRole] = useState('artist');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/feed');
    }
  }, [loading, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      if (isForgotPassword) {
        await authAPI.forgotPassword(email);
        setSuccessMessage('Password reset link sent. Check your email to continue.');
        setIsForgotPassword(false);
        setIsLogin(true);
        setPassword('');
        return;
      }

      if (isLogin) {
        await login(email, password, rememberMe);
      } else {
        if (!fullName.trim()) {
          setError('Please enter your full name');
          setSubmitting(false);
          return;
        }
        await register(fullName, email, password, role);
      }
      router.push('/feed');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-[#FDFBF7]">
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 p-6 lg:p-10">
        <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-stone-900 border border-stone-200/50 shadow-2xl">
          <Image
            alt="Traditional Indian textile worker meticulously embroidering"
            className="object-cover opacity-70"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDg9WAz_PaxWsrb9Mh8CxCLwLNccq71BYSDCyxO6FtJwT9potKsgn2ClGihHkh5eXjoIU13jxoyYlRmjZ15YiGEDPsTtZugRnRIlyz9DpWktIia5BWkqbFmlxluelTfDOfk7pne9hoAgPz-OR4Pak0BInpe_skbYncSOa4YoOvhRTqEW_Mdo_tU8dYA6iTdOU0QwAKGY-4uQChf6bDJXG_mZYcSyIYrkCgEWctKUyf7Itelh4bhMgE5jT6adRG4HWW6Wkc-OU23PREh"
            fill
            sizes="(max-width: 1024px) 50vw, 60vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#8B4513]/80 via-transparent to-black/30" />
          <div className="relative z-10 flex flex-col justify-between p-12 h-full w-full text-white">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-[var(--terracotta)]">
                temple_hindu
              </span>
              <span className="text-2xl font-bold font-display tracking-tight">KalaSetu</span>
            </div>
            <div className="mb-12">
              <h1 className="text-4xl lg:text-6xl font-black font-display leading-tight mb-6">
                Empowering the <br />
                <span className="text-[#DAA520] italic">Soul</span> of Tradition
              </h1>
              <p className="text-lg text-white/90 max-w-md font-light">
                Join India&apos;s largest community of traditional artisans, patrons, and cultural
                enthusiasts. Connect, create, and preserve our heritage.
              </p>
            </div>
            <div className="flex gap-4 text-sm text-white/60">
              <span>© 2026 KalaSetu</span>
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-center justify-center p-8 lg:p-16 bg-[#FDFBF7] overflow-y-auto">
        <div className="w-full max-w-md space-y-6 bg-white p-8 lg:p-10 rounded-3xl shadow-sm border border-stone-100">
          <div className="md:hidden flex items-center gap-2 justify-center">
            <span className="material-symbols-outlined text-4xl text-[var(--terracotta)]">
              temple_hindu
            </span>
            <span className="text-2xl font-bold text-[var(--deep-teal)] tracking-tight font-display">
              KalaSetu
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#3E2723] font-display mb-1">
              {isLogin ? 'Welcome Back' : 'Join KalaSetu'}
            </h2>
            <p className="text-[#5D4037] text-sm">
              {isForgotPassword
                ? 'Enter the email associated with your account and we will send a reset link.'
                : isLogin
                  ? 'Enter your details to access your account.'
                  : 'Create your account and start your journey.'}
            </p>
          </div>

          <div className="flex bg-stone-100 rounded-full p-1">
            <Button
              onClick={() => {
                setIsLogin(true);
                setIsForgotPassword(false);
                setError('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${isLogin ? 'bg-[#8B4513] text-white shadow-md' : 'text-stone-600 hover:text-stone-800'}`}
            >
              Log In
            </Button>
            <Button
              onClick={() => {
                setIsLogin(false);
                setIsForgotPassword(false);
                setError('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${!isLogin ? 'bg-[#8B4513] text-white shadow-md' : 'text-stone-600 hover:text-stone-800'}`}
            >
              Sign Up
            </Button>
          </div>

          {!isLogin && (
            <div className="bg-orange-50 p-1 rounded-xl flex">
              <Button
                type="button"
                onClick={() => setRole('artist')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${role === 'artist' ? 'bg-white text-[#8B4513] shadow-sm' : 'text-stone-500 hover:text-[#3E2723]'}`}
              >
                I&apos;m an Artist
              </Button>
              <Button
                type="button"
                onClick={() => setRole('artLover')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${role === 'artLover' ? 'bg-white text-[#8B4513] shadow-sm' : 'text-stone-500 hover:text-[#3E2723]'}`}
              >
                I&apos;m an Art Lover
              </Button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-lg mt-0.5">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[#5D4037] mb-1" htmlFor="fullName">
                  Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-stone-400 text-[20px]">
                    person
                  </span>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full rounded-lg border border-stone-200 bg-stone-50 pl-10 py-3 text-[#3E2723] text-sm focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513] shadow-sm outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#5D4037] mb-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-stone-400 text-[20px]">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-stone-200 bg-stone-50 pl-10 py-3 text-[#3E2723] text-sm focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513] shadow-sm outline-none"
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-[#5D4037]" htmlFor="password">
                    Password
                  </label>
                  {isLogin && !isForgotPassword && (
                    <a
                      href="#forgot-password"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsForgotPassword(true);
                        setError('');
                        setSuccessMessage('');
                      }}
                      className="text-sm font-medium text-[#00695C] hover:text-[#8B4513] transition-colors"
                    >
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-stone-400 text-[20px]">
                    {isForgotPassword ? 'mail' : 'lock'}
                  </span>
                  <input
                    id="password"
                    type={isForgotPassword ? 'email' : showPassword ? 'text' : 'password'}
                    autoComplete={
                      isForgotPassword ? 'email' : isLogin ? 'current-password' : 'new-password'
                    }
                    placeholder={isForgotPassword ? 'you@example.com' : '••••••••'}
                    required
                    value={isForgotPassword ? email : password}
                    onChange={(e) => {
                      if (isForgotPassword) {
                        setEmail(e.target.value);
                      } else {
                        setPassword(e.target.value);
                      }
                    }}
                    className="block w-full rounded-lg border border-stone-200 bg-stone-50 pl-10 pr-10 py-3 text-[#3E2723] text-sm focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513] shadow-sm outline-none"
                  />
                  <Button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </Button>
                </div>
              </div>
            )}

            {isLogin && !isForgotPassword && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#8B4513]"
                />
                <label htmlFor="remember" className="text-sm text-stone-600 cursor-pointer">
                  Remember me
                </label>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-lg text-sm font-bold text-white bg-[#8B4513] hover:bg-[#703810] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B4513] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">
                    progress_activity
                  </span>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {isForgotPassword
                    ? 'Send reset link'
                    : isLogin
                      ? 'Sign in to KalaSetu'
                      : 'Create Account'}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </Button>

            {isForgotPassword && (
              <Button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError('');
                  setSuccessMessage('');
                }}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-lg text-sm font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-300 transition-colors"
              >
                Back to login
              </Button>
            )}
          </form>

          <p className="text-center text-sm text-[#5D4037]">
            {isForgotPassword ? (
              <>
                Remembered your password?{' '}
                <Button
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="font-semibold text-[#8B4513] hover:text-[#703810] transition-colors"
                >
                  Return to sign in
                </Button>
              </>
            ) : isLogin ? (
              <>
                Don&apos;t have an account?{' '}
                <Button
                  onClick={() => {
                    setIsLogin(false);
                    setIsForgotPassword(false);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="font-semibold text-[#8B4513] hover:text-[#703810] transition-colors"
                >
                  Sign up for free
                </Button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Button
                  onClick={() => {
                    setIsLogin(true);
                    setIsForgotPassword(false);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="font-semibold text-[#8B4513] hover:text-[#703810] transition-colors"
                >
                  Log in
                </Button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
