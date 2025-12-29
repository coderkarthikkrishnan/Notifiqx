import React from 'react';
import {
    Fire,
    Ticket,
    BellRinging,
    Buildings,
    CalendarCheck,
    Briefcase,
    Tag,
    House,
    BookmarkSimple,
    User,
    SignOut,
    MagnifyingGlass,
    X
} from 'phosphor-react';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import logo from '../assets/notifiq-logo.png';

const Sidebar = ({ user, selectedCategory, onCategoryChange, onSearch, isOpen, onClose }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        auth.signOut();
        navigate('/login');
    };

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />


            <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-brand">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <img src={logo} alt="Notifiq" style={{ height: '32px' }} />
                        {user?.college && <span style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '2px', fontWeight: 'bold' }}>{user.college}</span>}
                    </div>
                    {isOpen && (
                        <button className="mobile-close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>
                    )}
                </div>

                <div className="search-box">
                    <MagnifyingGlass size={18} className="text-muted" />
                    <input
                        type="text"
                        placeholder="Search"
                        onChange={(e) => onSearch && onSearch(e.target.value)}
                    />
                </div>

                {/* Navigation Items */}
                <div className="nav-group">
                    <button className={`nav-item ${selectedCategory === 'All' ? 'active' : ''}`} onClick={() => { onCategoryChange && onCategoryChange('All'); onClose && onClose(); }}>
                        <House size={20} /> Home
                    </button>
                    <button className="nav-item">
                        <BookmarkSimple size={20} /> Saved Notices
                    </button>
                    <button className="nav-item">
                        <User size={20} /> Profile
                    </button>
                </div>

                <div className="nav-group">
                    <div className="group-title">FOLDERS</div>

                    <button className={`nav-item ${selectedCategory === 'Urgent' ? 'active' : ''}`} onClick={() => { onCategoryChange && onCategoryChange('Urgent'); onClose && onClose(); }}>
                        <Fire size={20} weight={selectedCategory === 'Urgent' ? 'fill' : 'regular'} color="#ef4444" /> Urgent
                        <span className="badge">3</span>
                    </button>

                    <button className={`nav-item ${selectedCategory === 'Exam' ? 'active' : ''}`} onClick={() => { onCategoryChange && onCategoryChange('Exam'); onClose && onClose(); }}>
                        <Ticket size={20} weight={selectedCategory === 'Exam' ? 'fill' : 'regular'} color="#3b82f6" /> Exams
                        <span className="badge">12</span>
                    </button>

                    <button className={`nav-item ${selectedCategory === 'Event' ? 'active' : ''}`} onClick={() => { onCategoryChange && onCategoryChange('Event'); onClose && onClose(); }}>
                        <CalendarCheck size={20} weight={selectedCategory === 'Event' ? 'fill' : 'regular'} color="#10b981" /> Events
                        <span className="badge">5</span>
                    </button>

                    <button className={`nav-item ${selectedCategory === 'Placement' ? 'active' : ''}`} onClick={() => { onCategoryChange && onCategoryChange('Placement'); onClose && onClose(); }}>
                        <Briefcase size={20} weight={selectedCategory === 'Placement' ? 'fill' : 'regular'} color="#f59e0b" /> Placements
                        <span className="badge">8</span>
                    </button>

                    <button className={`nav-item ${selectedCategory === 'General' ? 'active' : ''}`} onClick={() => { onCategoryChange && onCategoryChange('General'); onClose && onClose(); }}>
                        <Tag size={20} weight={selectedCategory === 'General' ? 'fill' : 'regular'} color="#8b5cf6" /> General
                    </button>
                </div>


            </aside>
        </>
    );
};

export default Sidebar;
