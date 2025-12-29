import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Bell,
    BellSlash,
    Sun,
    Moon,
    Buildings,
    SignOut,
    List,
    X,
    House
} from 'phosphor-react';
import { useTheme } from '../../lib/ThemeContext';
import { useNotification } from '../../lib/NotificationContext';
import { auth } from '../../lib/firebase';
import './Navbar.css';
import logo from '../../assets/notifiq-logo.png';

const Navbar = ({ user }) => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false); // Restored state
    const { theme, toggleTheme } = useTheme();
    const { unreadCount, toggleDropdown, isOpen, notifications, setIsOpen, notificationsEnabled, toggleNotifications } = useNotification();

    const handleLogout = async () => {
        await auth.signOut();
        navigate('/login');
    };

    const getDashboardLabel = () => {
        if (!user) return '';
        if (user.role === 'super_admin') return 'Super Admin';
        if (user.role === 'admin') return 'Admin Panel';
        return 'Dashboard';
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">

                {/* LEFT */}
                <div className="navbar-left">
                    <Link to="/landing" className="navbar-brand">
                        <img src={logo} alt="Notifiq" style={{ height: '32px' }} />
                    </Link>

                    {user?.collegeName && user.role !== 'super_admin' && (
                        <div className="college-badge">
                            <Buildings size={14} />
                            <span>{user.collegeName}</span>
                        </div>
                    )}
                </div>

                {/* MOBILE TOGGLE (Visible on small screens) */}
                <button className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={24} /> : <List size={24} />}
                </button>

                {/* RIGHT (Desktop & Mobile Slide-out) */}
                <div className={`navbar-right ${isMenuOpen ? 'active' : ''}`}>
                    {/* Home Link (Mobile Only) */}
                    <Link
                        to="/landing"
                        className="icon-btn mobile-home-btn"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <House size={18} />
                        <span className="mobile-text">Home</span>
                    </Link>

                    <button className="icon-btn theme-toggle" onClick={toggleTheme}>
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        <span className="mobile-text">Switch Theme</span>
                    </button>

                    {user && (
                        <>
                            <Link
                                to={user.role === 'super_admin' ? '/super' : user.role === 'admin' ? '/admin' : '/viewer'}
                                className="role-label"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {getDashboardLabel()}
                            </Link>

                            <button className="icon-btn" onClick={toggleNotifications}>
                                {notificationsEnabled ? <Bell size={18} /> : <BellSlash size={18} />}
                                <span className="mobile-text">Notifications</span>
                            </button>

                            <button className="profile-menu-btn" onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}>
                                <div className="avatar">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="Profile" />
                                    ) : (
                                        <div className="avatar-fallback" />
                                    )}
                                </div>
                                <span className="mobile-text">My Profile</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
