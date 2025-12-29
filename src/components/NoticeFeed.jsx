import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where, doc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import NoticeCard from './NoticeCard';
import './NoticeFeed.css';

const NoticeFeed = ({ user, category, searchTerm, onEdit }) => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [columns, setColumns] = useState(3);
    const [error, setError] = useState(null);

    // Responsive setup
    useEffect(() => {
        const updateColumns = () => {
            const width = window.innerWidth;
            if (width >= 1100) setColumns(3);
            else if (width >= 768) setColumns(2);
            else setColumns(1);
        };
        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    useEffect(() => {
        if (!user || !user.collegeId) return;

        try {
            // FIXED: Filter by collegeId to ensure users ONLY see their own college's notices
            // Note: This requires a composite index on Firestore (collegeId + createdAt).
            // If it fails initially, check the browser console for the index creation link.
            const q = query(
                collection(db, 'notices'),
                where('collegeId', '==', user.collegeId),
                orderBy('createdAt', 'desc')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setNotices(data);
                setLoading(false);
            }, (err) => {
                console.error("Notice fetch error:", err);
                if (err.message.includes("index")) {
                    setError("Database index missing. Please notify admin.");
                } else {
                    setError("Failed to fetch notices. Permission denied or network issue.");
                }
                setLoading(false);
            });
            return () => unsubscribe();
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }, [user]); // Re-run if user changes

    // Filter Logic
    const filteredNotices = notices.filter(n => {
        const matchesCategory = category === 'All' || category === 'Saved' || n.category === category;
        const isSaved = category === 'Saved' ? user?.pinnedNotices?.includes(n.id) : true;
        const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && isSaved && matchesSearch;
    });

    const handlePin = async (noticeId) => {
        if (!user) return alert("Sign in to pin notices");
        const isPinned = user.pinnedNotices?.includes(noticeId);
        const userRef = doc(db, 'users', user.uid);
        try {
            await updateDoc(userRef, {
                pinnedNotices: isPinned ? arrayRemove(noticeId) : arrayUnion(noticeId)
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (noticeId) => {
        if (!window.confirm("Are you sure you want to delete this notice?")) return;
        try {
            await deleteDoc(doc(db, 'notices', noticeId));
        } catch (err) {
            console.error(err);
            alert("Failed to delete notice");
        }
    };

    // Masonry Buckets
    const columnBuckets = Array.from({ length: columns }, () => []);
    filteredNotices.forEach((notice, i) => {
        columnBuckets[i % columns].push(notice);
    });

    if (loading) return <div className="loading-screen">Loading notices...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <div className="notice-feed-container">
            <div className="masonry-grid">
                {columnBuckets.map((bucket, i) => (
                    <div key={i} className="masonry-col">
                        {bucket.map(notice => (
                            <NoticeCard
                                key={notice.id}
                                notice={notice}
                                user={user}
                                onPin={handlePin}
                                onDelete={handleDelete}
                                onEdit={onEdit}
                            />
                        ))}
                    </div>
                ))}
            </div>
            {filteredNotices.length === 0 && <p style={{ textAlign: 'center', marginTop: '2rem' }}>No notices found.</p>}
        </div>
    );
};

export default NoticeFeed;
