// context/NotificationContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const POLL_INTERVAL_MS = 60_000;

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  refreshUnreadCount: async () => {},
  setUnreadCount: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadCount(data.count || 0);
    } catch {
      // Badge is non-critical: stay quiet if the server is asleep or unreachable
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    refreshUnreadCount();

    // Poll while the tab is visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') refreshUnreadCount();
    }, POLL_INTERVAL_MS);

    // Refresh right away when the user comes back to the tab
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshUnreadCount();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isAuthenticated, refreshUnreadCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount, setUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);