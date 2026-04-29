'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store';
import { sendEmailVerification } from 'firebase/auth';
import { FiMail, FiCheckCircle, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, setUser } = useAuthStore();

  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // If already verified, redirect to appropriate page
  useEffect(() => {
    if (!authLoading && user?.emailVerified) {
      if (user.role === 'Pujari') {
        router.push('/pujari/dashboard');
      } else {
        router.push('/profile');
      }
    }
  }, [authLoading, user, router]);

  const handleCheckVerification = async () => {
    setError('');
    setMessage('');

    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setError('Session expired. Please sign in again.');
      router.push('/login');
      return;
    }

    try {
      setChecking(true);
      await firebaseUser.reload();

      if (firebaseUser.emailVerified) {
        setMessage('Email verified successfully! Redirecting...');
        
        // Update the store with verified status
        if (user) {
          setUser({ ...user, emailVerified: true });
        }

        setTimeout(() => {
          if (user?.role === 'Pujari') {
            router.push('/pujari/dashboard');
          } else {
            router.push('/profile');
          }
        }, 1500);
        return;
      }

      setError('Email not verified yet. Please check your inbox and click the verification link, then try again.');
    } catch {
      setError('Unable to check verification status. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleResendEmail = async () => {
    setError('');
    setMessage('');

    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setError('Session expired. Please sign in again.');
      router.push('/login');
      return;
    }

    try {
      setResending(true);
      await sendEmailVerification(firebaseUser);
      setMessage('Verification email sent! Please check your inbox (and spam/promotions folder).');
    } catch {
      setError('Could not resend verification email. Please wait a moment and try again.');
    } finally {
      setResending(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-secondary-ivory flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-saffron/30 border-t-primary-saffron rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-ivory flex flex-col">
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className={`px-8 py-10 text-center ${user.role === 'Pujari' ? 'bg-primary-deepBlue' : 'bg-gradient-to-r from-primary-saffron to-primary-warmGold'}`}>
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                <FiMail className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white font-headings">
                Verify Your Email
              </h1>
              <p className="text-white/80 mt-2 font-body text-sm">
                We sent a verification link to
              </p>
              <p className="text-white font-bold mt-1 font-body">
                {user.email}
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              {error && (
                <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-body">
                  {error}
                </div>
              )}

              {message && (
                <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm font-body flex items-center gap-2">
                  <FiCheckCircle className="shrink-0" /> {message}
                </div>
              )}

              {/* Instructions */}
              <div className="bg-secondary-ivory/50 rounded-2xl p-5 border border-gray-100 mb-6">
                <h3 className="font-bold text-primary-deepBlue text-sm mb-3">How to verify:</h3>
                <ol className="space-y-2 text-sm text-gray-600 font-body">
                  <li className="flex items-start gap-2">
                    <span className="bg-primary-saffron text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    Open your email inbox ({user.email})
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary-saffron text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    Find the email from &quot;noreply@pantulugaru.firebaseapp.com&quot;
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary-saffron text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    Click the verification link in the email
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary-saffron text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</span>
                    Come back here and click &quot;I&apos;ve Verified&quot;
                  </li>
                </ol>
                <p className="text-xs text-gray-400 mt-3">💡 Check your spam/promotions folder if you don&apos;t see the email.</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCheckVerification}
                  disabled={checking}
                  className={`w-full py-4 rounded-xl font-bold shadow-lg text-white transition-all flex items-center justify-center gap-2 ${
                    user.role === 'Pujari' ? 'bg-primary-deepBlue hover:bg-black' : 'bg-primary-saffron hover:bg-primary-deepBlue'
                  } disabled:opacity-70`}
                >
                  {checking ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <FiCheckCircle /> I&apos;ve Verified — Continue
                    </>
                  )}
                </button>

                <button
                  onClick={handleResendEmail}
                  disabled={resending}
                  className="w-full py-3 rounded-xl font-bold border-2 border-primary-saffron text-primary-saffron hover:bg-primary-saffron hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {resending ? (
                    <div className="w-5 h-5 border-2 border-primary-saffron/30 border-t-primary-saffron rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <FiRefreshCw /> Resend Verification Email
                    </>
                  )}
                </button>

                <button
                  onClick={() => router.push('/')}
                  className="w-full py-2 text-sm font-body text-gray-500 hover:text-primary-deepBlue transition flex items-center justify-center gap-1"
                >
                  <FiArrowLeft /> Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
