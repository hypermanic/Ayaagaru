'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '@/lib/store';
import { FiMail, FiLock, FiUser, FiPhone, FiMapPin, FiChevronRight, FiCheckCircle } from 'react-icons/fi';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary-ivory flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-saffron/30 border-t-primary-saffron rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const { setUser, setLoading } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoadingLocal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobNumber, setMobNumber] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('Yajamani');

  // SYNC ROLE WITH URL PARAMS
  useEffect(() => {
    const roleFromUrl = searchParams.get('role');
    if (roleFromUrl === 'Pujari' || roleFromUrl === 'Yajamani') {
      setRole(roleFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoadingLocal(true);

    try {
      let result;
      let isNewUser = false;

      if (isLogin) {
        result = await signInWithEmailAndPassword(auth, email, password);
      } else {
        result = await createUserWithEmailAndPassword(auth, email, password);
        isNewUser = true;

        await updateProfile(result.user, {
          displayName: fullName
        });

        await setDoc(doc(db, "users", result.user.uid), {
          fullName,
          email,
          role,
          mobNumber,
          location,
          createdAt: new Date().toISOString()
        });
      }

      const firebaseUser = result.user;
      let userData = {
        role: 'Yajamani',
        mobNumber: '',
        location: '',
        fullName: firebaseUser.displayName || ''
      };

      if (!isNewUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          userData = {
            role: data.role || 'Yajamani',
            mobNumber: data.mobNumber || '',
            location: data.location || '',
            fullName: data.fullName || firebaseUser.displayName || ''
          };
        }
      } else {
        userData = { role, mobNumber, location, fullName };
      }

      setUser({
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: userData.fullName || (isLogin ? email.split('@')[0] : fullName),
        fullName: userData.fullName || (isLogin ? email.split('@')[0] : fullName),
        role: userData.role,
        mobNumber: userData.mobNumber,
        location: userData.location,
      });

      setSuccessMsg(isLogin ? 'Successfully logged in!' : 'Account created successfully!');

      setTimeout(() => {
        if (userData.role === 'Pujari') {
          router.push('/pujari/dashboard');
        } else {
          router.push(redirect || '/profile');
        }
      }, 1000);

    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else {
        setError(err.message || 'An error occurred.');
      }
    } finally {
      setIsLoadingLocal(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-ivory flex flex-col">
      <main className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className={`px-8 py-10 text-center transition-colors duration-500 ${role === 'Pujari' ? 'bg-primary-deepBlue' : 'bg-primary-saffron'}`}>
            <h1 className="text-3xl font-bold text-white font-headings">
              {isLogin ? 'Namaste' : 'Join Us'}
            </h1>
            <p className="text-white/80 mt-2 font-body text-sm">
              {role === 'Pujari'
                ? 'Pujari Portal - Manage your rituals'
                : 'Yajamani Portal - Book spiritual services'}
            </p>
          </div>

          <div className="p-8">
            {/* Role Switcher (Only for Registration) */}
            {!isLogin && (
              <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => setRole('Yajamani')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    role === 'Yajamani' ? 'bg-white text-primary-saffron shadow-sm' : 'text-gray-400'
                  }`}
                >
                  Yajamani (Devotee)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Pujari')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    role === 'Pujari' ? 'bg-white text-primary-deepBlue shadow-sm' : 'text-gray-400'
                  }`}
                >
                  Pujari (Expert)
                </button>
              </div>
            )}

            {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm border border-red-100">{error}</div>}
            {successMsg && <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 text-sm border border-green-100 flex items-center gap-2"><FiCheckCircle /> {successMsg}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-saffron/20 transition-all" />
                  </div>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="tel" placeholder="Mobile Number" required value={mobNumber} onChange={(e) => setMobNumber(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-saffron/20 transition-all" />
                  </div>
                </>
              )}

              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-saffron/20 transition-all" />
              </div>

              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-saffron/20 transition-all" />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-bold shadow-lg text-white transition-all flex items-center justify-center gap-2 group ${
                  role === 'Pujari' ? 'bg-primary-deepBlue' : 'bg-primary-saffron'
                }`}
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (
                  <>{isLogin ? 'Sign In' : 'Create Account'} <FiChevronRight /></>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-primary-saffron font-bold hover:underline">
                  {isLogin ? 'Register' : 'Log In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
