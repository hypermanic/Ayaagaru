'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { FiCalendar, FiCheckCircle, FiClock, FiMessageSquare, FiMapPin, FiCopy, FiSearch, FiX, FiPhone, FiInfo, FiUser } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';

type RequestItem = {
  id: string;
  ritualType: string;
  when: string;
  location: string;
  status: 'pending' | 'accepted' | 'time_suggested';
  bookingReferenceId?: string;
  userId?: string;
};

export default function PujariDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const searchSectionRef = useRef<HTMLDivElement>(null);

  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [realBookings, setRealBookings] = useState<RequestItem[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopyingId(id);
    setTimeout(() => setCopyingId(null), 2000);
  };

  const executeLookup = async (refId: string) => {
    if (!refId.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);
    try {
      const docRef = doc(db, 'bookings', refId.trim().toUpperCase());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSearchResult({ id: docSnap.id, ...docSnap.data() });
      } else {
        setSearchError('No booking found with this Reference ID.');
      }
    } catch (error) {
      console.error('Error searching booking:', error);
      setSearchError('An error occurred during the search.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    executeLookup(searchTerm);
  };

  const handleQuickView = (refId: string) => {
    setSearchTerm(refId);
    executeLookup(refId);
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const fetchPendingBookings = async () => {
    setIsInitialLoading(true);
    try {
      const q = query(
        collection(db, 'bookings'),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);
      const fetchedBookings: RequestItem[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ritualType: data.ritualType,
          when: `${data.date} at ${data.time}`,
          location: data.location,
          status: data.status,
          bookingReferenceId: data.bookingReferenceId,
          userId: data.userId
        };
      });
      setRealBookings(fetchedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/pujari/dashboard&role=Pujari');
      return;
    }
    if (user && user.role === 'Pujari') {
      fetchPendingBookings();
    }
  }, [authLoading, user, router]);

  const handleAccept = async (bookingId: string) => {
    if (!user) return;
    const pujari = user as any;

    const ritual = realBookings.find((b) => b.id === bookingId) || searchResult;
    if (!ritual) return;

    try {
      const batch = writeBatch(db);
      const bookingRef = doc(db, 'bookings', bookingId);

      batch.update(bookingRef, {
        status: 'accepted',
        pujari: {
          id: pujari.uid,
          name: pujari.fullName || pujari.displayName || 'Pujari',
          phone: pujari.mobNumber || '',
          location: pujari.location || '',
          acceptedAt: serverTimestamp()
        }
      });

      if (ritual.userId && ritual.userId !== 'guest') {
        const userNotifRef = doc(collection(db, 'notifications', ritual.userId, 'items'));
        batch.set(userNotifRef, {
          type: 'pujari-accepted',
          title: 'Pujari Accepted',
          body: `${pujari.fullName || 'Pujari'} has accepted your booking for ${ritual.ritualType}.`,
          createdAt: serverTimestamp(),
          read: false,
          payload: { bookingId: ritual.id }
        });
      }

      const adminNotifRef = doc(collection(db, 'notifications', 'admin', 'items'));
      batch.set(adminNotifRef, {
        type: 'pujari-accepted',
        title: 'New Acceptance',
        body: `Pujari ${pujari.fullName} accepted booking ${ritual.bookingReferenceId || ritual.id}`,
        createdAt: serverTimestamp(),
        read: false
      });

      await batch.commit();

      setRealBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'accepted' } : b))
      );

      if (searchResult && searchResult.id === bookingId) {
        setSearchResult({ ...searchResult, status: 'accepted' });
      }

      alert(`Success! You have accepted the booking.`);
    } catch (err: any) {
      console.error('Acceptance failed:', err);
      alert(`Error: ${err.message}`);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-ivory">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-saffron"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-ivory flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-8">
            <div className="bg-gradient-to-r from-primary-saffron to-primary-warmGold px-8 py-10">
              <h1 className="font-headings text-3xl md:text-4xl font-bold text-white">
                Namaste, {user.displayName || 'Pujari'}
              </h1>
              <p className="font-body text-white/90 mt-2">
                Manage requests, schedule, and services directly from your portal.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="bg-white/15 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                  Pending: {realBookings.filter(b => b.status === 'pending').length}
                </span>
                <span className="bg-white/15 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-green-200">
                  Profile: Verified
                </span>
              </div>
            </div>
          </div>

          {/* Quick Lookup Section */}
          <div
            ref={searchSectionRef}
            className="bg-white rounded-2xl shadow-lg p-6 border border-primary-saffron/20 mb-8 overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-saffron"></div>
            <h2 className="text-lg font-bold text-primary-deepBlue font-headings mb-4 flex items-center gap-2">
              <FiSearch className="text-primary-saffron" />
              Quick Lookup
            </h2>

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-grow relative">
                <input
                  type="text"
                  placeholder="Paste Booking Reference ID (e.g., GANESH_POOJA_...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-saffron/20 focus:border-primary-saffron transition-all font-mono text-sm"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => { setSearchTerm(''); setSearchResult(null); setSearchError(null); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchTerm.trim()}
                className="bg-primary-deepBlue text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSearching ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Search'}
              </button>
            </form>

            {searchError && (
              <p className="mt-3 text-red-500 text-sm font-medium flex items-center gap-1">
                <FiInfo className="w-4 h-4" /> {searchError}
              </p>
            )}

            {searchResult && (
              <div className="mt-6 bg-secondary-ivory/50 rounded-2xl p-6 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-gray-200 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary-saffron">Booking Found</span>
                    <h3 className="text-xl font-bold text-primary-deepBlue font-headings">{searchResult.ritualType}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border border-gray-100">{searchResult.bookingReferenceId}</code>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider ${searchResult.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                    {searchResult.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Yajamani Details</label>
                      <p className="font-bold text-primary-deepBlue flex items-center gap-2"><FiUser className="text-gray-400" /> {searchResult.name}</p>
                      <a href={`tel:${searchResult.contactNumber}`} className="text-primary-saffron font-bold text-sm flex items-center gap-2 mt-2 hover:underline">
                        <FiPhone className="text-primary-saffron" /> {searchResult.contactNumber}
                      </a>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Location</label>
                      <p className="text-sm text-gray-600 flex items-start gap-2"><FiMapPin className="text-gray-400 mt-1 shrink-0" /> {searchResult.location}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Schedule</label>
                      <p className="text-sm text-gray-600 flex items-center gap-2"><FiCalendar className="text-gray-400" /> {searchResult.date}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-2"><FiClock className="text-gray-400" /> {searchResult.time}</p>
                    </div>
                    {searchResult.status === 'pending' && (
                       <button
                        onClick={() => handleAccept(searchResult.id)}
                        className="w-full bg-primary-saffron text-white py-3 rounded-xl font-bold shadow-sm hover:bg-primary-deepBlue transition"
                      >
                        Accept This Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-50">
              <h2 className="text-lg font-bold text-primary-deepBlue font-headings mb-6">Pending Requests</h2>
              <div className="space-y-4">
                {isInitialLoading ? (
                  <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-saffron"></div></div>
                ) : realBookings.filter(b => b.status === 'pending').length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                    <FiCheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                    <h3 className="font-headings text-lg text-primary-deepBlue font-bold">No Pending Requests</h3>
                  </div>
                ) : (
                  realBookings.filter(b => b.status === 'pending').map((req) => (
                    <div key={req.id} className="border border-gray-100 rounded-xl p-4 hover:border-primary-saffron/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-grow">
                          <h3 className="font-headings font-bold text-primary-deepBlue text-sm md:text-base">{req.ritualType}</h3>
                          <div className="mt-2 flex flex-wrap gap-4 text-xs text-secondary-earthBrown">
                            <span className="inline-flex items-center gap-1"><FiClock className="w-3 h-3 text-orange-400" /> {req.when}</span>
                            <span className="inline-flex items-center gap-1"><FiMapPin className="w-3 h-3 text-red-400" /> {req.location}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                           <button onClick={() => handleQuickView(req.bookingReferenceId!)} className="text-[10px] font-bold text-primary-saffron underline">View Details</button>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-gray-50">
                        <button onClick={() => handleAccept(req.id)} className="bg-primary-saffron text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-primary-deepBlue transition">Accept</button>
                        <button className="bg-secondary-lightGray text-primary-deepBlue px-4 py-2 rounded-xl text-xs font-bold">Suggest time</button>
                        <button className="bg-white border border-gray-200 text-primary-deepBlue px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2"><FiMessageSquare className="w-4 h-4" /> Message</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <aside className="space-y-8">
              <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-50">
                <h2 className="text-lg font-bold text-primary-deepBlue font-headings mb-4 flex items-center gap-2">
                  <FiCalendar className="text-primary-saffron" /> Today’s Schedule
                </h2>
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-sm font-bold text-primary-deepBlue">No confirmed rituals yet</p>
                </div>
              </section>

              <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-50">
                <h2 className="text-lg font-bold text-primary-deepBlue font-headings mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <button className="w-full text-left bg-secondary-lightGray hover:bg-gray-200 transition px-4 py-3 rounded-xl font-semibold text-primary-deepBlue text-sm">Update availability</button>
                  <button className="w-full text-left bg-secondary-lightGray hover:bg-gray-200 transition px-4 py-3 rounded-xl font-semibold text-primary-deepBlue text-sm">Edit services</button>
                  <button onClick={() => router.push('/profile')} className="w-full text-left bg-secondary-lightGray hover:bg-gray-200 transition px-4 py-3 rounded-xl font-semibold text-primary-deepBlue text-sm flex justify-between items-center">Profile <FiCheckCircle className="text-primary-saffron" /></button>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
