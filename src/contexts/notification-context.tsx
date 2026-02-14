"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface NotificationContextType {
    unreadCount: number;
    refreshUnreadCount: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const pathname = usePathname();

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await fetch('/api/announcements/unread-count');
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.unread_count || 0);
            }
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, []);

    const markAsRead = async (id: string) => {
        try {
            const res = await fetch(`/api/announcements/${id}/read`, { method: 'POST' });
            if (res.ok) {
                await fetchUnreadCount(); // Refresh count after marking as read
            }
        } catch (error) {
            console.error('Failed to mark announcement as read:', error);
        }
    };

    // Fetch on mount and when path changes (optional, but good for keeping sync)
    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount, pathname]);

    return (
        <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount: fetchUnreadCount, markAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
