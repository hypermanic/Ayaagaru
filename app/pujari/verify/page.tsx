'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store';
import { sendEmailVerification } from 'firebase/auth';

export default function PujariVerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-primary-deepBlue flex items-center justify-center text-white">Loading...</div>}>
      <PujariVerifyInner />
    </Suspense>
  );
}

function PujariVerifyInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/pujari/dashboard';

  const { user, isLoading: authLoading } = useAuthStore();

  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const email = useMemo(() => user?.email || auth.currentUser?.email || '', [user?.email]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(redirect)}&role=Pujari`);
      return;
    }

    if (!authLoading && user && user.role && user.role !== 'Pujari') {
      router.push('/');
    }
  }, [authLoading, user, router, redirect]);

  const handleContinue = async () => {
    setError('');
    setMessage('');

    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setError('Please sign in again to continue.');
      router.push(`/login?redirect=${encodeURIComponent(redirect)}&role=Pujari`);
      return;
    }

    try {
      setChecking(true);
      await firebaseUser.reload();

      if (firebaseUser.emailVerified) {
        router.push(redirect);
        return;
      }

      setError('Not verified yet. Please open the verification email and click the link, then try again.');
    } catch {
      setError('Unable to check verification status. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');

    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setError('Please sign in again to resend verification.');
      router.push(`/login?redirect=${encodeURIComponent(redirect)}&role=Pujari`);
      return;
    }

    try {
      setResending(true);
      await sendEmailVerification(firebaseUser);
      setMessage('Verification email sent. Please check your inbox (and spam folder).');
    } catch {
      setError('Could not resend verification email. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-ivory flex flex-col">
      <Header />

      <main className="flex-grow px-4 py-12">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-primary-saffron to-primary-warmGold px-8 py-8 text-center">
              <span className="font-headings text-5xl text-white">ॐ</span>
              <h1 className="font-headings text-2xl md:text-3xl font-bold text-white mt-3">
                Verify your email to activate the Pujari Portal
              </h1>
              <p className="font-body text-white/90 text-sm mt-2">
                We sent a verification link to <span className="font-semibold">{email || 'your email'}</span>.
              </p>
            </div>

            <div className="px-8 py-8">
              {error && (
                <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-body">
                  {error}
                </div>
              )}

              {message && (
                <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-body">
                  {message}
                </div>
              )}

              <div className="bg-secondary-lightGray rounded-2xl p-5 border border-gray-100 mb-6">
                <p className="font-body text-sm text-primary-deepBlue">
                  Portal access: <span className="font-bold text-red-600">Locked</span> until your email is verified.
                </p>
                <p className="font-body text-xs text-gray-600 mt-2">
                  Didn’t receive the email? Check spam/promotions, then resend.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleContinue}
                  disabled={checking || authLoading}
                  className="w-full bg-gradient-to-r from-primary-saffron to-primary-warmGold text-white font-headings font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-70"
                >
                  {checking ? 'Checking…' : "I've verified — Continue"}
                </button>

                <button
                  onClick={handleResend}
                  disabled={resending || authLoading}
                  className="w-full border-2 border-primary-saffron text-primary-saffron font-body font-semibold py-3 rounded-xl hover:bg-primary-saffron hover:text-white transition disabled:opacity-70"
                >
                  {resending ? 'Resending…' : 'Resend verification email'}
                </button>

                <button
                  onClick={() => router.push('/')}
                  className="w-full text-sm font-body text-gray-500 hover:text-primary-deepBlue transition"
                >
                  Back to home
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

