'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { RITUAL_OPTIONS } from '@/lib/constants';
import { FiMail, FiLock, FiUser, FiInfo } from 'react-icons/fi';

interface FormData {
  name: string;
  ritualType: string;
  date: string;
  time: string;
  location: string;
  contactNumber: string;
  paymentOption: string;
  notes: string;
  // Auth fields for guests
  email?: string;
  password?: string;
}

const BookingForm: React.FC = () => {
  const { user, isLoading, setUser } = useAuthStore();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    ritualType: '',
    date: '',
    time: '',
    location: '',
    contactNumber: '',
    paymentOption: 'pay-after',
    notes: '',
    email: '',
    password: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingReferenceId, setBookingReferenceId] = useState<string | null>(null);

  const generateBookingReferenceId = (ritualName: string) => {
    const cleanedName = ritualName.replace(/pooja/gi, '').trim().toUpperCase().replace(/\s+/g, '');
    const prefix = cleanedName || 'RITUAL';
    const now = new Date();
    const timestamp = `${now.getDate()}${now.getMonth() + 1}${now.getFullYear()}${now.getHours()}${now.getMinutes()}`;
    return `${prefix}_${timestamp}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let currentUserId = user?.id;
      let currentUserEmail = user?.email;

      // 1. Handle Guest Registration "on-the-fly"
      if (!user && formData.email && formData.password) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
          const newUser = userCredential.user;

          await updateProfile(newUser, { displayName: formData.name });

          // Save user profile to Firestore
          await setDoc(doc(db, "users", newUser.uid), {
            fullName: formData.name,
            email: formData.email,
            mobNumber: formData.contactNumber,
            location: formData.location,
            role: 'Yajamani',
            createdAt: new Date().toISOString()
          });

          // Update global state
          setUser({
            id: newUser.uid,
            uid: newUser.uid,
            email: newUser.email || '',
            displayName: formData.name,
            fullName: formData.name,
            mobNumber: formData.contactNumber,
            role: 'Yajamani',
            emailVerified: false,
          });

          // Send verification email
          await sendEmailVerification(newUser);

          currentUserId = newUser.uid;
          currentUserEmail = newUser.email || '';
        } catch (authErr: any) {
          if (authErr.code === 'auth/email-already-in-use') {
            throw new Error("This email is already registered. Please login first.");
          }
          throw authErr;
        }
      }

      // 2. Process Booking
      const referenceId = generateBookingReferenceId(formData.ritualType);
      const bookingData = {
        name: formData.name,
        ritualType: formData.ritualType,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        contactNumber: formData.contactNumber,
        paymentOption: formData.paymentOption,
        notes: formData.notes,
        userId: currentUserId || 'guest',
        userEmail: currentUserEmail || 'guest',
        bookingReferenceId: referenceId,
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'bookings', referenceId), bookingData);
      setBookingReferenceId(referenceId);
      setSubmitted(true);
    } catch (error: any) {
      console.error('Booking error:', error);
      setSubmitError(error.message || 'Failed to save booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-8 md:py-12 px-4 bg-white" id="booking-section">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-6">
          <h2 className="font-headings text-2xl md:text-3xl text-primary-deepBlue mb-2">Book Your Ritual</h2>
          <p className="font-body text-secondary-earthBrown text-sm">Experience authentic Vedic ceremonies at your home.</p>
        </div>

        {submitted ? (
          <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl text-green-600">✓</div>
            <h3 className="font-headings text-xl text-green-700 mb-2">Booking Confirmed!</h3>
            <p className="font-body text-green-600 text-sm mb-4">Your request has been recorded. Reference ID: <strong>{bookingReferenceId}</strong></p>
            {!user && <p className="text-xs text-green-700 mb-4">An account has been created for you. You can now track your booking in your profile.</p>}
            <button onClick={() => router.push('/profile')} className="bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-bold">View My Bookings</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 bg-secondary-ivory/30 p-6 rounded-3xl border border-gray-100 shadow-inner">
            {submitError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">{submitError}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-saffron/20 transition-all text-sm" placeholder="Your Name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Contact Number *</label>
                <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-saffron/20 transition-all text-sm" placeholder="Phone Number" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Ritual Type *</label>
              <select name="ritualType" value={formData.ritualType} onChange={handleChange} required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-saffron/20 transition-all text-sm">
                <option value="">Select a ritual</option>
                {RITUAL_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Date *</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Time *</label>
                <input type="time" name="time" value={formData.time} onChange={handleChange} required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Location *</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm" placeholder="Full Address / City" />
            </div>

            {/* Auth-on-the-fly Section for Guests */}
            {!user && (
              <div className="mt-6 p-5 bg-primary-saffron/5 rounded-2xl border border-primary-saffron/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10"><FiUser size={40} /></div>
                <h4 className="text-sm font-bold text-primary-deepBlue mb-1 flex items-center gap-2">
                  <FiInfo className="text-primary-saffron" /> Create an Account
                </h4>
                <p className="text-[11px] text-gray-500 mb-4">Set a password to track your Pujari and manage this booking later.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required={!user}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-saffron/20" placeholder="Email Address" />
                  </div>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required={!user}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-saffron/20" placeholder="Set Password" />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className={`w-full bg-gradient-to-r from-primary-saffron to-primary-warmGold text-white font-bold py-4 rounded-xl transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg active:scale-[0.98]'}`}>
              {isSubmitting ? 'Processing...' : 'Confirm Booking'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default BookingForm;
