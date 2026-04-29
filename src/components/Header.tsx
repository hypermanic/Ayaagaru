'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'te' : 'en');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-card sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-2 md:py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-md">
            <div className="w-10 h-10 bg-primary-saffron rounded-full flex items-center justify-center text-white font-bold text-lg">
              ॐ
            </div>
            <span className="font-headings text-primary-deepBlue text-xl hidden sm:inline">
              Pantulugaru
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-lg">
            <Link href="/" className="font-body text-secondary-earthBrown hover:text-primary-saffron transition">
              {t('home')}
            </Link>
            <Link href="/about" className="font-body text-secondary-earthBrown hover:text-primary-saffron transition">
              {t('about')}
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-md">
            {/* Language Toggle */}
            <div className="flex items-center space-x-2 font-body text-sm font-semibold">
              <button
                onClick={() => i18n.changeLanguage('en')}
                className={`transition-colors ${i18n.language?.startsWith('en')
                  ? 'text-primary-saffron border-b-2 border-primary-saffron'
                  : 'text-secondary-earthBrown hover:text-primary-saffron'
                  }`}
              >
                {t('lang_english')}
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => i18n.changeLanguage('te')}
                className={`transition-colors ${i18n.language?.startsWith('te')
                  ? 'text-primary-saffron border-b-2 border-primary-saffron'
                  : 'text-secondary-earthBrown hover:text-primary-saffron'
                  }`}
              >
                {t('lang_telugu')}
              </button>
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 bg-secondary-lightGray px-4 py-2 rounded-full hover:bg-gray-200 transition"
                >
                  <div className="w-8 h-8 bg-primary-saffron rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {(
                      user.displayName?.trim()?.charAt(0) ||
                      user.email?.trim()?.charAt(0) ||
                      '?'
                    ).toUpperCase()}
                  </div>
                  <span className="font-body text-sm font-semibold text-primary-deepBlue hidden lg:inline">
                    {user.displayName?.split(' ')[0] || 'User'}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="text-xs text-gray-400 font-body">Signed in as</p>
                      <p className="text-sm font-semibold truncate text-primary-deepBlue">{user.email}</p>
                    </div>
                    {user.role === 'Pujari' && (
                      <Link
                        href="/pujari/dashboard"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-secondary-earthBrown hover:bg-gray-50 hover:text-primary-saffron transition"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FiSettings className="w-4 h-4" />
                        <span>Pujari Portal</span>
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-secondary-earthBrown hover:bg-gray-50 hover:text-primary-saffron transition"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <FiUser className="w-4 h-4" />
                      <span>My Dashboard</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition text-left"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login?role=Yajamani"
                  className="bg-primary-saffron text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-deepBlue transition shadow-sm"
                >
                  Yajamani Login
                </Link>
                <Link
                  href="/login?role=Pujari"
                  className="border border-primary-deepBlue text-primary-deepBlue px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-deepBlue hover:text-white transition"
                >
                  Pujari Login
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-md space-y-sm bg-white p-4 rounded-xl shadow-lg border border-gray-100">
            {/* Mobile Language Toggle */}
            <div className="flex justify-center pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-4 font-body text-sm font-semibold">
                <button
                  onClick={() => i18n.changeLanguage('en')}
                  className={`transition-colors ${i18n.language?.startsWith('en')
                    ? 'text-primary-saffron border-b-2 border-primary-saffron'
                    : 'text-secondary-earthBrown hover:text-primary-saffron'
                    }`}
                >
                  {t('lang_english')}
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => i18n.changeLanguage('te')}
                  className={`transition-colors ${i18n.language?.startsWith('te')
                    ? 'text-primary-saffron border-b-2 border-primary-saffron'
                    : 'text-secondary-earthBrown hover:text-primary-saffron'
                    }`}
                >
                  {t('lang_telugu')}
                </button>
              </div>
            </div>

            <Link href="/" className="block font-body text-secondary-earthBrown hover:text-primary-saffron py-2" onClick={() => setMobileMenuOpen(false)}>
              {t('home')}
            </Link>
            <Link href="/about" className="block font-body text-secondary-earthBrown hover:text-primary-saffron py-2" onClick={() => setMobileMenuOpen(false)}>
              {t('about')}
            </Link>

            {user ? (
              <div className="pt-2 border-t border-gray-100">
                {user.role === 'Pujari' && (
                  <Link
                    href="/pujari/dashboard"
                    className="flex items-center space-x-3 block font-body font-semibold text-primary-deepBlue py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiSettings className="w-5 h-5 text-primary-saffron" />
                    <span>Pujari Portal</span>
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center space-x-3 block font-body font-semibold text-primary-deepBlue py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiUser className="w-5 h-5 text-primary-saffron" />
                  <span>My Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full text-left font-body font-semibold text-red-500 py-2"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-100 space-y-sm">
                <Link
                  href="/login?role=Yajamani"
                  className="block font-body font-bold text-primary-saffron py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Yajamani Login
                </Link>
                <Link
                  href="/login?role=Pujari"
                  className="block font-body font-bold text-primary-deepBlue py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pujari Login
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
