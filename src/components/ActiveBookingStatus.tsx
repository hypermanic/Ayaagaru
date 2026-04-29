'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { FiClock, FiCheckCircle, FiUser, FiPhone, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

interface Booking {
  id: string;
  ritualType: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  date: string;
  bookingReferenceId?: string;
  pujari?: {
    name: string;
    phone: string;
  };
}

const ActiveBookingStatus: React.FC = () => {
  const { user } = useAuthStore();
  const [latestBooking, setLatestBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestBooking = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef, 
          where('userId', '==', user.id || user.uid),
          limit(10) // Fetch a few more to ensure we get the latest after memory sort
        );
        
        const snap = await getDocs(q);
        const fetchedBookings = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        
        // Sort in memory to avoid needing a composite index
        fetchedBookings.sort((a: any, b: any) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        // Find the most 'active' one (accepted > pending > completed)
        const active = fetchedBookings.find(b => b.status === 'accepted') 
                     || fetchedBookings.find(b => b.status === 'pending')
                     || fetchedBookings[0];

        setLatestBooking(active || null);
      } catch (error) {
        console.error('Error fetching active status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestBooking();
  }, [user]);

  if (loading || !user || !latestBooking || latestBooking.status === 'completed' || latestBooking.status === 'cancelled') {
    return null; // Don't show anything if nothing is active or still loading
  }

  return (
    <div className="container mx-auto px-4 -mt-8 relative z-20">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-xl border border-primary-saffron/20 rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-primary-saffron/40 transition-all duration-500">
          
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
              latestBooking.status === 'accepted' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
            }`}>
              {latestBooking.status === 'accepted' ? <FiUser /> : <FiClock className="animate-pulse" />}
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-primary-saffron/10 text-primary-saffron">
                  {latestBooking.bookingReferenceId || 'Booking Status'}
                </span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {latestBooking.status === 'accepted' ? 'Pujari Assigned' : 'Finding Expert'}
                </span>
              </div>
              <h3 className="text-xl font-headings text-primary-deepBlue">
                {latestBooking.ritualType}
              </h3>
              <p className="text-sm text-secondary-earthBrown opacity-70">
                Scheduled for {latestBooking.date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {latestBooking.status === 'accepted' && latestBooking.pujari ? (
              <a 
                href={`tel:${latestBooking.pujari.phone}`}
                className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 bg-primary-deepBlue text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-black transition-all"
              >
                <FiPhone /> Call {latestBooking.pujari.name.split(' ')[0]}
              </a>
            ) : (
              <Link 
                href="/profile"
                className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 bg-primary-saffron text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-primary-saffron/40 transition-all"
              >
                Track Booking <FiArrowRight />
              </Link>
            )}
            <Link 
              href="/profile"
              className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-primary-saffron/5 hover:text-primary-saffron transition-all"
              title="View all bookings"
            >
              <FiCheckCircle size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveBookingStatus;
