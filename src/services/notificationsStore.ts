import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Notification } from '../types';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribe: () => void;
  unsubscribe: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      set({ 
        notifications: data as Notification[],
        unreadCount: data.filter((n: Notification) => !n.leida).length,
        loading: false 
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ loading: false });
    }
  },
  markAsRead: async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ leida: true })
        .eq('id', id);

      if (error) throw error;

      const notifications = get().notifications.map(n => 
        n.id === id ? { ...n, leida: true } : n
      );
      
      set({ 
        notifications,
        unreadCount: notifications.filter(n => !n.leida).length
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },
  markAllAsRead: async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ leida: true })
        .eq('leida', false);

      if (error) throw error;

      const notifications = get().notifications.map(n => ({ ...n, leida: true }));
      
      set({ 
        notifications,
        unreadCount: 0
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  },
  subscribe: () => {
    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          set((state) => ({
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
  unsubscribe: () => {
    supabase.removeAllChannels();
  }
}));
