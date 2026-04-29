'use client';

import React from 'react';
import { FiStar } from 'react-icons/fi';

interface Testimonial {
  id: string;
  name: string;
  ritual: string;
  quote: string;
  rating: number;
  initials: string;
}

const Testimonials: React.FC = () => {
  // Disabled per request to remove the "What Our Families Say" banner
  const ENABLE_TESTIMONIALS = false;

  if (!ENABLE_TESTIMONIALS) return null;

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Rajesh & Priya',
      ritual: 'Housewarming Ceremony',
      quote:
        'The Pantulu was extremely knowledgeable and made our housewarming ceremony truly special. Highly professional and respectful.',
      rating: 5,
      initials: 'RP',
    },
    {
      id: '2',
      name: 'Harini Sharma',
      ritual: 'Satyanarayana Pooja',
      quote:
        'Booking was seamless and the ritual was performed exactly as we wanted. The entire experience was blessed and meaningful.',
      rating: 5,
      initials: 'HS',
    },
    {
      id: '3',
      name: 'Mohan Krishna',
      ritual: 'Navagraha Homam',
      quote:
        'Traditional, authentic, and delivered with utmost care. Our family felt the spiritual connection throughout the ceremony.',
      rating: 5,
      initials: 'MK',
    },
    {
      id: '4',
      name: 'Anjali & David',
      ritual: 'Engagement Ceremony',
      quote:
        'More than we expected! The attention to detail and spiritual guidance made this a memorable experience for everyone.',
      rating: 5,
      initials: 'AD',
    },
  ];

  return (
    <section className="py-8 md:py-12 px-4 bg-secondary-ivory">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-6">
          <h2 className="font-headings text-2xl md:text-3xl text-primary-deepBlue mb-2">
            What Our Families Say
          </h2>
          <p className="font-body text-secondary-earthBrown text-sm">
            Trusted by hundreds of families for their special moments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-lg shadow-card p-4 hover:shadow-lg transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <FiStar
                    key={i}
                    className="w-3 h-3 fill-primary-saffron text-primary-saffron"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="font-body text-secondary-earthBrown mb-3 italic text-xs">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-saffron to-primary-warmGold flex items-center justify-center shrink-0">
                  <span className="font-headings text-white font-bold text-xs">
                    {testimonial.initials}
                  </span>
                </div>

                <div>
                  <h4 className="font-headings text-primary-deepBlue font-semibold text-sm">
                    {testimonial.name}
                  </h4>
                  <p className="font-body text-secondary-earthBrown text-xs">
                    {testimonial.ritual}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
