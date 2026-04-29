'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '@/lib/store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let userData = {
          role: 'Yajamani',
          mobNumber: '',
          location: '',
          fullName: firebaseUser.displayName || '',
        };

        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            userData = {
              role: data.role || 'Yajamani',
              mobNumber: data.mobNumber || '',
              location: data.location || '',
              fullName: data.fullName || firebaseUser.displayName || '',
            };
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        }

        setUser({
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: userData.fullName || firebaseUser.displayName || '',
          fullName: userData.fullName || firebaseUser.displayName || '',
          role: userData.role,
          mobNumber: userData.mobNumber,
          location: userData.location,
          emailVerified: firebaseUser.emailVerified,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
