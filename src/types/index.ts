export interface User {
  id: string;
  email: string;
  displayName: string;
  profileImage?: string;
  bio?: string;
  createdAt: Date;
  role?: 'User' | 'Pujari';
  preferences: {
    language: 'en' | 'te';
    notifications: boolean;
    emailUpdates: boolean;
  };
}

export interface Booking {
  id: string;
  userId: string;
  ritualId: string;
  ritualName: string;
  date: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
}
