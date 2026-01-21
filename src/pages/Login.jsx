import React, { useState } from 'react';
import logo from '../assets/notifiq-logo.png';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    collection,
    query,
    where,
    getDocs
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import {
    GoogleLogo,
    Envelope,
    Lock,
    Buildings,
    WarningCircle
} from 'phosphor-react';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();

    const [mode, setMode] = useState('login'); // login | register
    const [step, setStep] = useState('auth'); // auth | college

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [collegeCode, setCollegeCode] = useState('');

    const [pendingUser, setPendingUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /* ---------------- CHECK SUPER ADMIN ---------------- */
    const checkIfSuperAdmin = async (user) => {
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                if (userData.role === 'super_admin') {
                    navigate('/super', { replace: true });
                    return true;
                }
            }
        } catch (error) {
            console.error("Error checking super admin status:", error);
        }
        return false;
    };

    /* ---------------- GOOGLE LOGIN ---------------- */
    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await signInWithPopup(auth, googleProvider);

            // Check for Super Admin bypass
            const isSuper = await checkIfSuperAdmin(result.user);
            if (isSuper) return;

            // Otherwise, always require college code step for others
            setPendingUser(result.user);
            setStep('college');
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    /* ---------------- EMAIL LOGIN / REGISTER ---------------- */
    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let user;
            if (mode === 'register') {
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                user = cred.user;
            } else {
                const cred = await signInWithEmailAndPassword(auth, email, password);
                user = cred.user;
            }

            // Check for Super Admin bypass logic (only relevant for login, new registers won't be super admin)
            if (mode === 'login') {
                const isSuper = await checkIfSuperAdmin(user);
                if (isSuper) return;
            }

            // Always require college code step
            setPendingUser(user);
            setStep('college');
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    /* ---------------- COLLEGE CODE STEP (MANDATORY) ---------------- */
    const submitCollegeCode = async () => {
        if (!collegeCode.trim()) {
            setError('College access code is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const code = collegeCode.trim().toUpperCase();

            // 1. Verify Code Exists
            let collegeData;
            try {
                // FIXED: Fetch from 'colleges' collection (which allows read) instead of 'college_codes' (which is blocked/empty)
                const collegesRef = collection(db, 'colleges');
                const snapshot = await getDocs(collegesRef);

                // Find match in memory (Robust against index/query issues)
                const match = snapshot.docs.find(doc => {
                    const data = doc.data();
                    return String(data.code).trim().toLowerCase() === String(code).trim().toLowerCase();
                });

                if (!match) {
                    throw new Error('Invalid college access code');
                }
                collegeData = { id: match.id, ...match.data() };
            } catch (err) {
                console.error("Error verifying code:", err);
                if (err.message === 'Invalid college access code') throw err;
                throw new Error(`Verification failed: ${err.message}`);
            }

            // 2. Check Permissions / Existing Data
            // If user already has this exact data, skip the write (avoids permission issues with immutable fields)
            try {
                const userRef = doc(db, 'users', pendingUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const existingData = userSnap.data();
                    if (existingData.collegeId === collegeData.collegeId &&
                        existingData.role === (collegeData.defaultRole || 'viewer')) {

                        // Data matches! Just redirect.
                        if (existingData.role === 'admin') {
                            navigate('/admin', { replace: true });
                        } else {
                            navigate('/viewer', { replace: true });
                        }
                        return;
                    }
                }
            } catch (err) {
                console.warn("Could not check existing user data:", err);
                // Continue to try writing
            }

            // 3. Write User Data
            let finalRole = collegeData.defaultRole || 'viewer';

            // PRESERVE EXISTING ROLE: If user is already an admin, don't downgrade them!
            try {
                const userRef = doc(db, 'users', pendingUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const existingData = userSnap.data();
                    if (existingData.role === 'admin' || existingData.role === 'super_admin') {
                        finalRole = existingData.role;
                    }
                }
            } catch (err) {
                console.warn("Error checking existing role:", err);
            }

            await setDoc(
                doc(db, 'users', pendingUser.uid),
                {
                    uid: pendingUser.uid,
                    email: pendingUser.email,
                    name:
                        pendingUser.displayName ||
                        pendingUser.email.split('@')[0],
                    role: finalRole,
                    collegeId: collegeData.id, // Use the document ID
                    collegeName: collegeData.name || collegeData.collegeName,
                    collegeCode: code, // Store the code used
                    createdAt: serverTimestamp()
                },
                { merge: true }
            );

            // Redirect based on role
            if (collegeData.defaultRole === 'admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/viewer', { replace: true });
            }
        } catch (err) {
            console.error("Login Error:", err);
            // Improve error message for users
            if (err.message.includes("permission")) {
                setError("Permission denied. You may strictly not be allowed to change your college/role.");
            } else {
                setError(err.message);
            }
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                {/* LEFT SIDE - BRANDING */}
                <div className="login-side">
                    <div className="side-content">
                        <img src={logo} alt="Notifiq" className="side-logo" />
                        <div className="side-text">
                            <h3>Welcome to<br />Notifiq</h3>
                            <p>
                                Your central hub for academic updates, instant notices,
                                and seamless campus connectivity.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE - AUTH FORM */}
                <div className="login-main">
                    {error && (
                        <div className="login-error">
                            <WarningCircle size={18} /> {error}
                        </div>
                    )}

                    {step === 'auth' && (
                        <div className="auth-step">
                            <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
                            <p className="subtitle">
                                Sign in to access your college notices
                            </p>

                            <button
                                className="google-btn"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                            >
                                <GoogleLogo size={20} />
                                <span>Continue with Google</span>
                            </button>

                            <div className="divider">
                                <span>or</span>
                            </div>

                            <form onSubmit={handleEmailAuth} className="auth-form">
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <div className="input-group">
                                        <Envelope size={18} />
                                        <input
                                            type="email"
                                            required
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Password</label>
                                    <div className="input-group">
                                        <Lock size={18} />
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? (
                                        <div className="loading-dots">
                                            <div></div><div></div><div></div><div></div>
                                        </div>
                                    ) : (
                                        mode === 'login' ? 'Sign in' : 'Create account'
                                    )}
                                </button>
                            </form>

                            <p className="switch-mode">
                                {mode === 'login' ? 'No account?' : 'Already have an account?'}
                                <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
                                    {mode === 'login' ? ' Sign up' : ' Log in'}
                                </button>
                            </p>
                        </div>
                    )}

                    {step === 'college' && (
                        <div className="college-step">
                            <div className="step-header">
                                <h2>Access Code Required</h2>
                                <p className="subtitle">
                                    Enter your college access code to continue.
                                </p>
                            </div>

                            <div className="form-group">
                                <label>College Code</label>
                                <div className="input-group">
                                    <Buildings size={18} />
                                    <input
                                        type="text"
                                        placeholder="e.g. ENG123"
                                        style={{ textTransform: 'uppercase' }}
                                        value={collegeCode}
                                        onChange={(e) =>
                                            setCollegeCode(e.target.value.toUpperCase())
                                        }
                                    />
                                </div>
                            </div>

                            <button onClick={submitCollegeCode} className="btn-primary" disabled={loading}>
                                {loading ? (
                                    <div className="loading-dots">
                                        <div></div><div></div><div></div><div></div>
                                    </div>
                                ) : (
                                    'Complete Setup'
                                )}
                            </button>

                            <button
                                className="btn-back"
                                onClick={() => setStep('auth')}
                                disabled={loading}
                            >
                                Change Account
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
