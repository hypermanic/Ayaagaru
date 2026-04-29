'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FiUser, FiCalendar, FiClock, FiMail, FiPhone, FiMapPin, FiCheckCircle, FiInfo } from 'react-icons/fi';

interface Booking {
  id: string;
  ritualType: string;
  date: string;
  time?: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  location: string;
  bookingReferenceId?: string;
  name: string;
  contactNumber?: string;
  createdAt?: any;
  pujari?: {
    name: string;
    phone: string;
    location?: string;
  };
}

export default function YajamaniDashboard() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/profile');
    } else if (!authLoading && user && !user.emailVerified) {
      router.push('/verify-email');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      setLoadingBookings(true);
      try {
        const bookingsRef = collection(db, 'bookings');
        const fetchedBookings: Booking[] = [];
        const seenIds = new Set<string>();

        const qByUid = query(bookingsRef, where('userId', '==', user.id || user.uid));
        const snapUid = await getDocs(qByUid);
        snapUid.forEach(doc => {
          if (!seenIds.has(doc.id)) {
            fetchedBookings.push({ id: doc.id, ...doc.data() } as Booking);
            seenIds.add(doc.id);
          }
        });

        const userMob = user.mobNumber;
        if (userMob) {
          const qByPhone = query(bookingsRef, where('contactNumber', '==', userMob));
          const snapPhone = await getDocs(qByPhone);
          snapPhone.forEach(doc => {
            if (!seenIds.has(doc.id)) {
              fetchedBookings.push({ id: doc.id, ...doc.data() } as Booking);
              seenIds.add(doc.id);
            }
          });
        }

        fetchedBookings.sort((a, b) => {
          const dateA = a.createdAt?.seconds || new Date(a.date).getTime() / 1000;
          const dateB = b.createdAt?.seconds || new Date(b.date).getTime() / 1000;
          return dateB - dateA;
        });
        
        setBookings(fetchedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoadingBookings(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  const getStatusStep = (status: string) => {
    switch(status) {
      case 'pending': return 1;
      case 'accepted': return 2;
      case 'completed': return 3;
      default: return 1;
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
    <div className="min-h-screen bg-secondary-ivory flex flex-col font-body">
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-gray-100">
            <div className="bg-gradient-to-r from-primary-saffron to-primary-warmGold px-8 py-10 md:py-14 text-white">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-3xl font-bold border border-white/30">
                    {user.displayName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold font-headings">Namaste, {user.displayName}</h1>
                    <p className="text-white/80 mt-1">Yajamani Dashboard • Track your spiritual rituals</p>
                  </div>
                </div>
                <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/20 text-center">
                  <span className="block text-2xl font-black">{bookings.length}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-70">Total Bookings</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-50">
                <h2 className="text-lg font-bold text-primary-deepBlue mb-6 font-headings flex items-center gap-2">
                  <FiUser className="text-primary-saffron" /> Your Profile
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Email</p>
                    <p className="text-sm font-semibold text-primary-deepBlue truncate">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Mobile</p>
                    <p className="text-sm font-semibold text-primary-deepBlue">{user.mobNumber || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </aside>

            <section className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary-deepBlue font-headings flex items-center gap-3">
                  <FiCalendar className="text-primary-saffron" /> My Bookings
                </h2>
                <button onClick={() => router.push('/#booking-section')} className="bg-primary-saffron text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md">
                  + New Booking
                </button>
              </div>

              <div className="space-y-8">
                {loadingBookings ? (
                  <div className="bg-white rounded-3xl p-20 flex justify-center border border-gray-50">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-saffron"></div>
                  </div>
                ) : bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <div key={booking.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden group">
                      <div className="p-6 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4 bg-gray-50/20">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-primary-saffron uppercase tracking-widest px-2 py-0.5 rounded bg-primary-saffron/5">
                              {booking.bookingReferenceId}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">| Name: {booking.name}</span>
                          </div>
                          <h3 className="text-xl font-bold text-primary-deepBlue font-headings">{booking.ritualType}</h3>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          booking.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                          booking.status === 'accepted' ? 'bg-green-50 text-green-600 border-green-100' :
                          'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                           <div className="relative flex justify-between mb-8">
                              <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-0" />
                              <div className="absolute top-5 left-0 h-1 bg-primary-saffron transition-all duration-1000 -z-0"
                                   style={{ width: `${(getStatusStep(booking.status) - 1) * 50}%` }} />
                              {[
                                { label: 'Requested', status: 'pending', icon: <FiMail /> },
                                { label: 'Pujari Assigned', status: 'accepted', icon: <FiUser /> },
                                { label: 'Completed', status: 'completed', icon: <FiCheckCircle /> }
                              ].map((step, idx) => (
                                <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                                   <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                                     getStatusStep(booking.status) > idx ? 'bg-primary-saffron border-primary-saffron text-white shadow-lg' :
                                     getStatusStep(booking.status) === idx ? 'bg-white border-primary-saffron text-primary-saffron' : 'bg-white border-gray-100 text-gray-300'
                                   }`}>
                                     {step.icon}
                                   </div>
                                   <span className={`text-[9px] font-black uppercase ${getStatusStep(booking.status) >= idx + 1 ? 'text-primary-deepBlue' : 'text-gray-300'}`}>
                                     {step.label}
                                   </span>
                                </div>
                              ))}
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="bg-gray-50 rounded-xl p-4">
                                 <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Date & Time</p>
                                 <p className="text-sm font-bold text-primary-deepBlue">{booking.date} at {booking.time}</p>
                              </div>
                              <div className="bg-gray-50 rounded-xl p-4">
                                 <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Location</p>
                                 <p className="text-sm font-bold text-primary-deepBlue truncate">{booking.location}</p>
                              </div>
                           </div>
                        </div>

                        <div className="bg-secondary-ivory/40 rounded-3xl p-6 border border-gray-100 flex flex-col justify-center">
                          {booking.status === 'accepted' && booking.pujari ? (
                            <div className="space-y-4">
                               <p className="text-[10px] font-bold text-gray-400 uppercase">Assigned Pujari</p>
                               <p className="text-base font-bold text-primary-deepBlue">{booking.pujari.name}</p>
                               <a href={`tel:${booking.pujari.phone}`} className="flex items-center justify-center gap-2 w-full bg-primary-deepBlue text-white py-3 rounded-xl text-xs font-bold shadow-md">
                                 <FiPhone /> Call Pujari
                               </a>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                               <FiInfo className="w-8 h-8 text-orange-300 mx-auto mb-2" />
                               <p className="text-xs font-bold text-primary-deepBlue">Finding Expert</p>
                               <p className="text-[9px] text-gray-400 mt-1">We are assigning the best professional for your {booking.ritualType}.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
                    <FiCalendar className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-primary-deepBlue">No Bookings Found</h3>
                    <p className="text-sm text-gray-500 mt-2 mb-8">If you recently booked a ritual, please ensure your profile mobile number matches the one used during booking.</p>
                    <button onClick={() => router.push('/#booking-section')} className="bg-primary-saffron text-white px-10 py-4 rounded-2xl font-bold shadow-lg">Book Now</button>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
