'use client';

import HeroBanner from '@/components/HeroBanner';
import ServicesSection from '@/components/ServicesSection';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import BookingForm from '@/components/BookingForm';
import ActiveBookingStatus from '@/components/ActiveBookingStatus';
export default function Home() {
  return (
    <main className="w-full">
      {/* Hero Banner Section */}
      <HeroBanner />
      <ActiveBookingStatus />

      {/* Services Section */}
      <ServicesSection />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Booking Form Section */}
      <div id="booking-section">
        <BookingForm />
      </div>
    </main>
  );
}
