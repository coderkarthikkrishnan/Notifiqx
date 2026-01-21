import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, messaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';

const NotificationContext = createContext();


export const NotificationProvider = ({ children, user }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false); // Default false until permission checked

    // Request Permission & Get Token
    const requestNotificationPermission = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Notification permission granted.');

                // Get Token
                const token = await getToken(messaging, {
                    vapidKey: 'BM1Kj-Pup-oOf-lUaUaT0kXj-tTkQ-vPj-Kj-Pup-oOf-lUaUaT0kXj-tTkQ-vPj' // OPTIONAL: Replace with your VAPID Key if generated
                    // If no VAPID key is provided, it uses the default instance config. 
                    // Note: It's best practice to use a VAPID key for web push.
                    // For now, we try without to see if default config suffices, or user can add it.
                    // Actually, getToken often requires a VAPID key in modern implementations.
                });

                if (token && user) {
                    console.log('FCM Token:', token);
                    // Save token to user profile
                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, {
                        fcmTokens: arrayUnion(token)
                    });
                    setNotificationsEnabled(true);
                }
            } else {
                console.log('Unable to get permission to notify.');
            }
        } catch (err) {
            console.error('An error occurred while retrieving token. ', err);
        }
    };

    // Check permission on mount
    useEffect(() => {
        if (Notification.permission === 'granted') {
            setNotificationsEnabled(true);
            requestNotificationPermission(); // Refresh token if needed
        }
    }, [user]);

    // Handle Foreground Messages
    useEffect(() => {
        if (messaging) { // Handle case where messaging might fail to init in some envs
            const unsubscribeRaw = onMessage(messaging, (payload) => {
                console.log('Message received. ', payload);
                // Optionally show a toast here since SW doesn't handle foreground
                new Notification(payload.notification.title, {
                    body: payload.notification.body,
                    icon: '/notifiq-logo.png'
                });
            });
            return () => unsubscribeRaw();
        }
    }, []);

    useEffect(() => {
        if (!user?.collegeId) {
            setNotifications([]);
            return;
        }

        setLoading(true);

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

    // Changed behavior: toggle now requests permission if not granted
    const toggleNotifications = () => {
        if (Notification.permission !== 'granted') {
            requestNotificationPermission();
        } else {
            // Logic to disable? complicated to 'revoke' token without backend call. 
            // Just toggling local state for now.
            setNotificationsEnabled(prev => !prev);
        }
    };

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
