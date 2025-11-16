import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  full_name: string;
  credits: number;
  plan: 'Free Trial' | 'Paid';
  plan_expires_at: string;
  account_type: 'user' | 'affiliate';
  referral_code: string | null;
  status: string;
  whatsapp_number: string | null;
  verification_code: string | null;
  onboarding_completed: boolean; // Add this property
}

interface SessionContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refetchProfile: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export const SessionContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userToFetch: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userToFetch.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (e) {
      console.error('Catastrophic error fetching profile:', e);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      if (isMounted) {
        setSession(initialSession);
        const currentUser = initialSession?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser);
        }
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (isMounted) {
        setSession(newSession);
        const currentUser = newSession?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser);
        } else {
          setProfile(null);
        }
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const refetchProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user);
    }
  }, [user, fetchProfile]);

  const value = useMemo(() => ({
    session,
    user,
    profile,
    loading,
    refetchProfile,
  }), [session, user, profile, loading, refetchProfile]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};