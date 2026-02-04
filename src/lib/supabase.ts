// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const supabaseHelpers = {
  // Auth helpers
  signUp: (email: string, password: string) => 
    supabase.auth.signUp({ email, password }),
    
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),
    
  signOut: () => supabase.auth.signOut(),
  
  getSession: () => supabase.auth.getSession(),
  
  onAuthStateChange: (callback: (event: string, session: any) => void) =>
    supabase.auth.onAuthStateChange(callback),
    
  // Password reset
  resetPassword: (email: string) =>
    supabase.auth.resetPasswordForEmail(email),
    
  // Data helpers
  getTable: <T>(table: string) => supabase.from<T>(table),
  
  // Services
  getServices: async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*, service_pricing(*)')
      .eq('is_active', true)
      .order('display_order');
    return { data, error };
  },
  
  // Subscriptions
  getMemberSubscription: async (memberId: string) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, member_services(*, services(*))')
      .eq('member_id', memberId)
      .eq('status', 'active')
      .single();
    return { data, error };
  },
  
  // Orders
  createOrder: async (order: any) =>
    supabase.from('orders').insert(order).select().single(),
    
  getMemberOrders: async (memberId: string) =>
    supabase
      .from('orders')
      .select('*, services(*)')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false }),
      
  // Website builds
  getMemberWebsiteBuild: async (memberId: string) =>
    supabase
      .from('website_builds')
      .select('*')
      .eq('member_id', memberId)
      .eq('status', 'completed')
      .single(),
      
  // Meeting rooms
  getMeetingRooms: async () =>
    supabase.from('meeting_rooms').select('*').eq('is_active', true),
    
  getAvailableSlots: async (date: string, roomId?: string) => {
    let query = supabase
      .from('booking_slots')
      .select('*, meeting_rooms(*)')
      .eq('date', date)
      .eq('is_available', true);
      
    if (roomId) {
      query = query.eq('meeting_room_id', roomId);
    }
    
    return query.order('start_time');
  },
  
  createBooking: async (booking: any) =>
    supabase.from('bookings').insert(booking).select().single(),
    
  getMemberBookings: async (memberId: string) =>
    supabase
      .from('bookings')
      .select('*, booking_slots(*, meeting_rooms(*))')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false }),
};

export default supabase;
