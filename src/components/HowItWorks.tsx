'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { FiSearch, FiCalendar, FiCheckCircle, FiMapPin, FiCheck } from 'react-icons/fi';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const HowItWorks: React.FC = () => {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const steps: Step[] = [
    {
      id: 1,
      title: 'Choose Ritual',
      description: 'Browse and select from our wide range of authentic Vedic rituals.',
      icon: <FiSearch className="w-6 h-6" />,
      color: 'from-orange-400 to-primary-saffron'
    },
    {
      id: 2,
      title: 'Schedule & Locate',
      description: 'Pick your preferred date and provide your location details.',
      icon: <FiCalendar className="w-6 h-6" />,
      color: 'from-amber-400 to-primary-warmGold'
    },
    {
      id: 3,
      title: 'Wait for Confirmation',
      description: 'We match your request with the most qualified local Pantulu.',
      icon: <FiCheckCircle className="w-6 h-6" />,
      color: 'from-primary-saffron to-orange-500'
    },
    {
      id: 4,
      title: 'Receive Pantulu',
      description: 'Experienced Pantulu arrives at your location on time with devotion.',
      icon: <FiMapPin className="w-6 h-6" />,
      color: 'from-primary-warmGold to-amber-600'
    },
  ];

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) {
        setCurrentStep(0);
        setLoading(false);
        return;
      }

      try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef, 
          where('userId', '==', user.id || user.uid),
          limit(5)
        );
        
        const snap = await getDocs(q);
        const fetchedBookings = snap.docs.map(doc => doc.data());
        
        if (fetchedBookings.length === 0) {
          setCurrentStep(0);
        } else {
          // Find the furthest along booking
          const statuses = fetchedBookings.map(b => b.status);
          if (statuses.includes('accepted')) setCurrentStep(4);
          else if (statuses.includes('pending')) setCurrentStep(3);
          else if (statuses.includes('completed')) setCurrentStep(5);
          else setCurrentStep(2); // Just started
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  return (
    <section className="py-20 bg-secondary-ivory relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary-saffron/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-headings text-primary-deepBlue mb-4">
            {currentStep > 0 && currentStep < 5 ? 'Your Ritual Journey' : 'How It Works'}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-saffron to-primary-warmGold mx-auto mb-6 rounded-full" />
          <p className="text-base md:text-lg font-body text-secondary-earthBrown max-w-2xl mx-auto">
            {currentStep > 0 && currentStep < 5 
              ? `You are currently at Step ${currentStep}. We are making your spiritual experience seamless.`
              : 'Experience the divine connection in four simple, guided steps.'}
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Desktop Timeline Path Background */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[6px] bg-gray-100 -translate-y-[28px] z-0 rounded-full" />
          
          {/* Desktop Progress Fill */}
          <div 
            className="hidden md:block absolute top-1/2 left-0 h-[6px] bg-gradient-to-r from-primary-saffron to-primary-warmGold -translate-y-[28px] z-0 transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(244,162,97,0.4)]"
            style={{ 
              width: currentStep === 0 ? '0%' : 
                     currentStep === 1 ? '12.5%' : 
                     currentStep === 2 ? '37.5%' : 
                     currentStep === 3 ? '62.5%' : 
                     currentStep === 4 ? '87.5%' : '100%' 
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, idx) => {
              const isCompleted = currentStep > step.id || currentStep === 5;
              const isActive = currentStep === step.id;
              
              return (
                <div 
                  key={step.id} 
                  className={`group relative transition-all duration-500 ${!isActive && currentStep > 0 && !isCompleted ? 'opacity-50 grayscale-[0.5]' : ''}`}
                >
                  <div className={`bg-white/90 backdrop-blur-md p-8 rounded-3xl border transition-all duration-500 flex flex-col items-center text-center h-full z-10 relative ${
                    isActive ? 'border-primary-saffron ring-4 ring-primary-saffron/10 scale-105 shadow-2xl' : 
                    isCompleted ? 'border-green-100 shadow-lg' : 'border-primary-saffron/5 shadow-card'
                  }`}>
                    
                    {/* Icon Circle */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-500 mb-6 ${
                      isCompleted ? 'bg-green-500 scale-90' : 
                      isActive ? `bg-gradient-to-br ${step.color} animate-pulse` : `bg-gradient-to-br ${step.color} group-hover:scale-110`
                    }`}>
                      {isCompleted ? <FiCheck className="w-8 h-8" /> : step.icon}
                    </div>

                    {/* Step Badge */}
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 px-3 py-1 rounded-full ${
                      isCompleted ? 'bg-green-50 text-green-600' :
                      isActive ? 'bg-primary-saffron text-white' : 'bg-primary-saffron/5 text-primary-saffron'
                    }`}>
                      {isCompleted ? 'Completed' : isActive ? 'Current Step' : `Step ${step.id}`}
                    </span>

                    <h3 className={`text-xl font-headings mb-3 transition-colors ${
                      isActive ? 'text-primary-saffron' : 'text-primary-deepBlue'
                    }`}>
                      {step.title}
                    </h3>
                    
                    <p className="text-sm font-body text-secondary-earthBrown leading-relaxed opacity-80">
                      {step.description}
                    </p>

                    {/* Active State Pulse */}
                    {isActive && (
                      <div className="absolute inset-0 bg-primary-saffron/5 rounded-3xl animate-ping -z-10" />
                    )}
                  </div>

                  {/* Mobile Connector */}
                  {idx < steps.length - 1 && (
                    <div className="md:hidden flex justify-center py-4">
                      <div className={`w-1 h-12 transition-colors duration-500 ${
                        currentStep > step.id ? 'bg-primary-saffron' : 'bg-gray-100'
                      }`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
