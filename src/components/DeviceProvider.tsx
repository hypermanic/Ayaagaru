'use client';

import { useEffect } from 'react';
import { useDeviceStore } from '@/lib/store';
import '@/i18n/config';

export default function DeviceProvider({ children }: { children: React.ReactNode }) {
  const setDevice = useDeviceStore((state) => state.setDevice);

  useEffect(() => {
    const handleResize = () => {
      setDevice(window.innerWidth);
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setDevice]);

  // We return children directly so it doesn't add any extra DOM nodes
  return <>{children}</>;
}
