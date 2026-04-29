import { create } from 'zustand';

export interface User {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  fullName: string;
  profileImage?: string;
  role?: string;
  mobNumber?: string;
  location?: string;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null }),
}));

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface DeviceStore {
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  setDevice: (width: number) => void;
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  deviceType: 'desktop',
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  setDevice: (width) => {
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;

    let deviceType: DeviceType = 'desktop';
    if (isMobile) deviceType = 'mobile';
    else if (isTablet) deviceType = 'tablet';

    set({ deviceType, isMobile, isTablet, isDesktop });
  },
}));
