// Authentication Context
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, supabaseHelpers } from '../lib/supabase';

interface Member {
  id: string;
  email: string;
  company_name?: string;
  contact_name?: string;
}

interface Subscription {
  id: string;
  tier: 'basic' | 'essential' | 'professional';
  status: string;
  current_period_end: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  member: Member | null;
  subscription: Subscription | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshMember: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabaseHelpers.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchMemberData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchMemberData(session.user.id);
        } else {
          setMember(null);
          setSubscription(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchMemberData = async (userId: string) => {
    try {
      // Fetch member profile
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('id', userId)
        .single();

      if (memberError && memberError.code !== 'PGRST116') {
        throw memberError;
      }

      if (memberData) {
        setMember(memberData);

        // Fetch active subscription
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('member_id', userId)
          .eq('status', 'active')
          .single();

        if (subError && subError.code !== 'PGRST116') {
          throw subError;
        }

        if (subData) {
          setSubscription(subData);
        }
      }
    } catch (error) {
      console.error('Error fetching member data:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabaseHelpers.signIn(email, password);
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabaseHelpers.signUp(email, password);
    return { error };
  };

  const signOut = async () => {
    await supabaseHelpers.signOut();
    setUser(null);
    setSession(null);
    setMember(null);
    setSubscription(null);
  };

  const refreshMember = async () => {
    if (user) {
      await fetchMemberData(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        member,
        subscription,
        loading,
        signIn,
        signUp,
        signOut,
        refreshMember,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
