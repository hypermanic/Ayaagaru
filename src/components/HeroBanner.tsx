'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

const HeroBanner: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-6 md:py-8 bg-gradient-to-br from-primary-deepBlue via-primary-deepBlue to-primary-warmGold overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-saffron rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-warmGold rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative px-4">
        <div className="text-center max-w-4xl mx-auto flex flex-col gap-3">
          {/* Om Symbol + Headline in one row */}
          <div className="flex items-center justify-center gap-3">
            <span className="font-headings text-2xl md:text-3xl text-primary-saffron">ॐ</span>
            <h1 className="font-headings text-xl md:text-3xl text-white leading-tight">
              {t('hero_headline_part1')}{' '}
              <span className="text-primary-saffron">{t('hero_headline_highlight')}</span>
            </h1>
          </div>

          {/* Subtext */}
          <p className="font-body text-xs md:text-sm text-white opacity-90">
            {t('hero_subtext')}
          </p>

          {/* CTA Buttons + Trust Badges in one row */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
            <Link
              href="/#booking-section"
              className="bg-primary-saffron hover:bg-primary-warmGold text-primary-deepBlue font-headings font-bold text-xs md:text-sm px-4 py-1.5 rounded-lg transition-all transform hover:scale-105 shadow-lg text-center"
            >
              {t('BookRituals')}
            </Link>

            <Link
              href="/login"
              className="border-2 border-primary-saffron text-primary-saffron hover:bg-primary-saffron hover:text-primary-deepBlue font-headings font-bold text-xs md:text-sm px-4 py-[calc(0.5rem-2px)] rounded-lg transition-all transform hover:scale-105 text-center"
            >
              {/* LAYMAN FRIENDLY NAME: Covers both Pujari and Yajamani clearly */}
              Sign In / Register
            </Link>

            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-white opacity-30"></div>

            {/* Trust Badges inline */}
            <div className="hidden sm:flex items-center gap-4 text-center">
              <div>
                <p className="font-headings text-sm text-primary-saffron">500+</p>
                <p className="font-body text-white text-xs opacity-80">{t('badge_bookings')}</p>
              </div>
              <div className="w-px h-6 bg-white opacity-30"></div>
              <div>
                <p className="font-headings text-sm text-primary-saffron">4.9★</p>
                <p className="font-body text-white text-xs opacity-80">{t('badge_rating')}</p>
              </div>
              <div className="w-px h-6 bg-white opacity-30"></div>
              <div>
                <p className="font-headings text-sm text-primary-saffron">100%</p>
                <p className="font-body text-white text-xs opacity-80">{t('badge_authentic')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
