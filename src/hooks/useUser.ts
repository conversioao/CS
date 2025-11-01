import { useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  registrationDate: number;
  plan: 'Free Trial' | 'Paid';
}

const getMockUser = (): User => {
  const storedUser = localStorage.getItem('conversio_user');
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch (e) {
      localStorage.removeItem('conversio_user');
    }
  }

  // Default for users before this system was implemented or if storage is corrupted
  const newUser: User = {
    id: `user_${Date.now()}`,
    name: "Usuário Demo",
    email: "user@example.com",
    credits: 250, // Give existing users some credits
    registrationDate: Date.now(),
    plan: 'Paid', // Assume existing users are on a paid plan to not lock them out
  };
  localStorage.setItem('conversio_user', JSON.stringify(newUser));
  return newUser;
};

export const useUser = () => {
  const [user, setUser] = useState<User>(getMockUser());

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getMockUser());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('user-update', handleStorageChange); // Custom event for immediate updates
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-update', handleStorageChange);
    };
  }, []);

  const isFreePlanExpired = () => {
    if (user.plan !== 'Free Trial') {
      return false;
    }
    const threeDaysInMillis = 3 * 24 * 60 * 60 * 1000;
    const isTimeExpired = Date.now() - user.registrationDate > threeDaysInMillis;
    const areCreditsExpired = user.credits <= 0;
    return isTimeExpired || areCreditsExpired;
  };

  return { user, isExpired: isFreePlanExpired() };
};