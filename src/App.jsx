import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';


import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ViewerDashboard from './pages/ViewerDashboard';
import SuperAdmin from './pages/SuperAdmin';
import Navbar from './components/Layout/Navbar';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { ThemeProvider } from './lib/ThemeContext';
import { NotificationProvider } from './lib/NotificationContext';
import Layout from './components/Layout/Layout';

import Landing from './pages/Landing';
import Contact from './pages/Contact';
import Profile from './pages/Profile';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeUser = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
            if (unsubscribeUser) {
                unsubscribeUser();
                unsubscribeUser = null;
            }

            if (u) {
                unsubscribeUser = onSnapshot(doc(db, 'users', u.uid), (snap) => {
                    if (snap.exists()) {
                        setUser({ uid: u.uid, email: u.email, photoURL: u.photoURL, displayName: u.displayName, ...snap.data() });
                    } else {
                        setUser({ uid: u.uid, email: u.email, photoURL: u.photoURL, displayName: u.displayName });
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("User fetch error:", error);
                    setLoading(false);
                });
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeUser) unsubscribeUser();
        };
    }, []);

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-dots" style={{ color: 'var(--color-text)' }}>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        );
    }

    return (
        <ThemeProvider>
            <NotificationProvider user={user}>
                <BrowserRouter>
                    <Layout user={user}>
                        <Routes>
                            <Route path="/" element={<Landing user={user} />} />
                            <Route path="/landing" element={<Landing user={user} />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/admin" element={
                                <ProtectedRoute user={user}>
                                    <AdminDashboard user={user} />
                                </ProtectedRoute>
                            } />
                            <Route path="/viewer" element={
                                <ProtectedRoute user={user}>
                                    <ViewerDashboard user={user} />
                                </ProtectedRoute>
                            } />
                            <Route path="/profile" element={
                                <ProtectedRoute user={user}>
                                    <Profile user={user} />
                                </ProtectedRoute>
                            } />
                            <Route path="/super" element={
                                user?.role === 'super_admin' ? <SuperAdmin /> : <Navigate to="/" />
                            } />
                        </Routes>
                    </Layout>
                </BrowserRouter>
            </NotificationProvider>
        </ThemeProvider>
    );
}

export default App;
