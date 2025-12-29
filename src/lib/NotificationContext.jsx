import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

const NotificationContext = createContext();

export const NotificationProvider = ({ children, user }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    useEffect(() => {
        if (!user?.collegeId) {
            setNotifications([]);
            return;
        }

        setLoading(true);

        // Ensure index exists for this query in Firestore console if strictly enforced
        const q = query(
            collection(db, 'notices'),
            where('collegeId', '==', user.collegeId),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Convert Firestore Timestamp to JS Date safely
                createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
            }));

            const lastReadTime = localStorage.getItem('lastReadNotificationTime');
            const unread = lastReadTime
                ? fetched.filter(n => n.createdAt.getTime() > parseInt(lastReadTime)).length
                : fetched.length;

            setNotifications(fetched);
            setUnreadCount(unread);
            setLoading(false);
        }, (err) => {
            console.error("Notice fetch error:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const markAllAsRead = () => {
        setUnreadCount(0);
        const now = Date.now();
        localStorage.setItem('lastReadNotificationTime', now.toString());
    };

    const toggleDropdown = () => {
        if (!isOpen && unreadCount > 0) {
            markAllAsRead();
        }
        setIsOpen(!isOpen);
    };

    const toggleNotifications = () => setNotificationsEnabled(prev => !prev);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            isOpen,
            toggleDropdown,
            setIsOpen,
            loading,
            notificationsEnabled,
            toggleNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
