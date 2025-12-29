import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trash, Buildings, UserPlus, Users, ArrowCircleUp } from 'phosphor-react';
import './SuperAdmin.css';

const SuperAdmin = () => {
    const [stats, setStats] = useState({ admins: 0, notices: 0, colleges: 0 });
    const [admins, setAdmins] = useState([]);
    const [colleges, setColleges] = useState([]);

    // Forms
    const [newAdmin, setNewAdmin] = useState({ email: '', name: '', collegeId: '', collegeName: '', password: '' });
    const [newCollege, setNewCollege] = useState({ name: '', code: '' });

    useEffect(() => {
        fetchStats();
        fetchAdmins();
        fetchColleges();
    }, []);

    const fetchStats = async () => {
        // Placeholder for real stats aggregation
        setStats(prev => ({ ...prev }));
    };

    const fetchColleges = async () => {
        const q = query(collection(db, 'colleges'));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setColleges(list);
        setStats(prev => ({ ...prev, colleges: list.length }));
    };

    const fetchAdmins = async () => {
        const q = query(collection(db, 'users'), where('role', '==', 'admin'));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAdmins(list);
        setStats(prev => ({ ...prev, admins: list.length }));
    };

    /* ===========================
       COLLEGE ACTIONS
    =========================== */
    const handleAddCollege = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'colleges'), {
                name: newCollege.name,
                code: newCollege.code, // Access Code
                createdAt: new Date().toISOString()
            });
            alert('College added!');
            setNewCollege({ name: '', code: '' });
            fetchColleges();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteCollege = async (id) => {
        if (!confirm('Are you sure? This will not delete users but will affect access.')) return;
        try {
            await deleteDoc(doc(db, 'colleges', id));
            fetchColleges();
        } catch (err) {
            alert(err.message);
        }
    };

    /* ===========================
       ADMIN ACTIONS
    =========================== */
    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', newAdmin.email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // User exists: Update role
                const userDoc = querySnapshot.docs[0];
                await updateDoc(userDoc.ref, {
                    role: 'admin',
                    collegeId: newAdmin.collegeId,
                    collegeName: newAdmin.collegeName,
                    name: newAdmin.name // Update name if provided
                });
                alert(`Existing user ${newAdmin.email} has been promoted to Admin!`);
            } else {
                // New user: Pre-provision
                await addDoc(usersRef, {
                    ...newAdmin,
                    role: 'admin',
                    createdAt: new Date().toISOString()
                });
                alert('New Admin pre-provisioned! They will have admin access upon signup.');
            }

            setNewAdmin({ email: '', name: '', collegeId: '', collegeName: '', password: '' });
            fetchAdmins();
        } catch (err) {
            console.error(err);
            alert("Error assigning admin: " + err.message);
        }
    };

    const handleDeleteAdmin = async (id) => {
        if (!confirm('Revoke admin access?')) return;
        try {
            await updateDoc(doc(db, 'users', id), { role: 'viewer' });
            fetchAdmins();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="super-container">
            <header className="admin-header">
                <h1>Super Admin Console</h1>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Colleges</h3>
                    <div className="value">{stats.colleges}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Admins</h3>
                    <div className="value">{stats.admins}</div>
                </div>
            </div>

            {/* MANAGE COLLEGES */}
            <div className="admin-list-section">
                <div className="section-header-row">
                    <h2><Buildings size={24} /> Manage Colleges</h2>
                </div>

                <form className="create-admin-form" onSubmit={handleAddCollege}>
                    <div className="form-group">
                        <label>College Name</label>
                        <input
                            className="form-control"
                            value={newCollege.name}
                            onChange={e => setNewCollege({ ...newCollege, name: e.target.value })}
                            required
                            placeholder="e.g. Alpha College"
                        />
                    </div>
                    <div className="form-group">
                        <label>Access Code</label>
                        <input
                            className="form-control"
                            value={newCollege.code}
                            onChange={e => setNewCollege({ ...newCollege, code: e.target.value })}
                            required
                            placeholder="e.g. AC123"
                        />
                    </div>
                    <div className="form-group">
                        <label>&nbsp;</label>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Add College
                        </button>
                    </div>
                </form>

                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>College Name</th>
                                <th>Access Code</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {colleges.map(college => (
                                <tr key={college.id}>
                                    <td>{college.name}</td>
                                    <td><code>{college.code}</code></td>
                                    <td>
                                        <button className="btn-danger-icon" onClick={() => handleDeleteCollege(college.id)}>
                                            <Trash size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MANAGE ADMINS */}
            <div className="admin-list-section">
                <div className="section-header-row">
                    <h2><Users size={24} /> Manage Admins</h2>
                </div>

                <form className="create-admin-form" onSubmit={handleCreateAdmin}>
                    <div className="form-group">
                        <label>Email</label>
                        <input className="form-control" value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Name</label>
                        <input className="form-control" value={newAdmin.name} onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>College</label>
                        <select
                            className="form-control"
                            value={newAdmin.collegeId}
                            onChange={e => {
                                const col = colleges.find(c => c.id === e.target.value);
                                setNewAdmin({ ...newAdmin, collegeId: e.target.value, collegeName: col?.name || '' })
                            }}
                            required
                        >
                            <option value="">Select College</option>
                            {colleges.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>&nbsp;</label>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Assign Admin
                        </button>
                    </div>
                </form>

                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>College</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map(admin => (
                                <tr key={admin.id}>
                                    <td>{admin.name}</td>
                                    <td>{admin.collegeName}</td>
                                    <td>{admin.email}</td>
                                    <td>
                                        <button className="btn-danger-icon" onClick={() => handleDeleteAdmin(admin.id)}>
                                            <Trash size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SuperAdmin;
