'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FiSearch, FiUser, FiHash, FiCalendar, FiClock, FiMapPin, FiCheckCircle, FiPhone, FiInfo } from 'react-icons/fi';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function QuickLookupPage() {
  const [name, setName] = useState('');
  const [refId, setRefId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<any>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      // Reference ID is used as the Document ID in Firestore
      const docRef = doc(db, 'bookings', refId.trim().toUpperCase());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // Security check: Match the name (case insensitive)
        if (data.name.toLowerCase().trim() === name.toLowerCase().trim()) {
          setBooking({ id: docSnap.id, ...data });
        } else {
          setError('Invalid Name or Reference ID combination.');
        }
      } else {
        setError('No booking found with this Reference ID.');
      }
    } catch (err) {
      console.error('Lookup error:', err);
      setError('An error occurred during lookup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'accepted': return 2;
      case 'completed': return 3;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-secondary-ivory flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-primary-deepBlue font-headings mb-3">Quick Booking Status</h1>
            <p className="text-gray-500 font-body">Enter your details to track your ritual progress instantly.</p>
          </div>

          {/* Search Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 mb-8">
            <form onSubmit={handleLookup} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Your Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-saffron" />
                  <input
                    type="text"
                    placeholder="Enter Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-saffron/20 transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Booking Reference ID</label>
                <div className="relative">
                  <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-saffron" />
                  <input
                    type="text"
                    placeholder="e.g. GANESH_1204"
                    value={refId}
                    onChange={(e) => setRefId(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-saffron/20 transition-all text-sm font-mono font-bold"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-deepBlue text-white py-4 rounded-xl font-bold shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <FiSearch className="group-hover:scale-110 transition-transform" />
                      Track Status
                    </>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-6 bg-red-50 border border-red-100 text-red-500 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                <FiInfo /> {error}
              </div>
            )}
          </div>

          {/* Result Card */}
          {booking && (
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-50 animate-in slide-in-from-bottom-8 duration-500">
              <div className="bg-gradient-to-r from-primary-saffron to-primary-warmGold p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold font-headings">{booking.ritualType}</h2>
                  <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Booking Reference: {booking.bookingReferenceId}</p>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                  {booking.status}
                </div>
              </div>

              <div className="p-8">
                {/* Progress Steps */}
                <div className="relative flex justify-between max-w-md mx-auto mb-12">
                  <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-0" />
                  <div className="absolute top-5 left-0 h-1 bg-primary-saffron transition-all duration-1000 -z-0"
                       style={{ width: `${(getStatusStep(booking.status) - 1) * 50}%` }} />

                  {[
                    { label: 'Requested', icon: <FiClock /> },
                    { label: 'Assigned', icon: <FiUser /> },
                    { label: 'Completed', icon: <FiCheckCircle /> }
                  ].map((step, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                        getStatusStep(booking.status) > idx ? 'bg-primary-saffron border-primary-saffron text-white shadow-lg shadow-primary-saffron/30' :
                        getStatusStep(booking.status) === idx ? 'bg-white border-primary-saffron text-primary-saffron' : 'bg-white border-gray-100 text-gray-300'
                      }`}>
                        {step.icon}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-tighter ${getStatusStep(booking.status) >= idx + 1 ? 'text-primary-deepBlue' : 'text-gray-300'}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                      <FiCalendar className="text-primary-saffron" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Date & Time</p>
                        <p className="text-sm font-bold text-primary-deepBlue">{booking.date} at {booking.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                      <FiMapPin className="text-primary-saffron" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Location</p>
                        <p className="text-sm font-bold text-primary-deepBlue">{booking.location}</p>
                      </div>
                    </div>
                  </div>

                  {booking.status === 'accepted' && booking.pujari ? (
                    <div className="bg-primary-deepBlue rounded-3xl p-6 text-white shadow-xl shadow-primary-deepBlue/20">
                      <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest mb-4">Your Assigned Pujari</p>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                          <FiUser size={24} />
                        </div>
                        <div>
                          <p className="text-base font-bold">{booking.pujari.name}</p>
                          <p className="text-[10px] text-primary-saffron font-bold uppercase tracking-tight">Vedic Scholar</p>
                        </div>
                      </div>
                      <a href={`tel:${booking.pujari.phone}`} className="w-full bg-white text-primary-deepBlue py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-saffron hover:text-white transition-all text-sm">
                        <FiPhone /> Contact Now
                      </a>
                    </div>
                  ) : (
                    <div className="bg-secondary-ivory rounded-3xl p-6 border border-primary-saffron/10 text-center flex flex-col justify-center">
                      <p className="text-xs font-bold text-primary-deepBlue uppercase tracking-widest mb-2">Finding Your Pujari</p>
                      <p className="text-[11px] text-gray-500 leading-relaxed px-4">We are currently assigning the best professional for your {booking.ritualType}.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
