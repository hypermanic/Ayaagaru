'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-deepBlue text-white py-lg px-md border-t border-primary-saffron/10">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-md">
          {/* Quick Links */}
          <nav>
            <ul className="font-body text-sm flex flex-wrap justify-center md:justify-start gap-md md:gap-lg">
              <li>
                <Link href="/" className="hover:text-primary-saffron transition-colors">
                  {t('home')}
                </Link>
              </li>

              <li>
                <Link href="/about" className="hover:text-primary-saffron transition-colors">
                  {t('about')}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="font-body text-xs opacity-75">
              {t('copyright')} | {currentYear}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
