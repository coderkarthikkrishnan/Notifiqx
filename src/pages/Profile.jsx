import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { auth } from '../lib/firebase';
import { SignOut, Envelope, User, IdentificationCard, Buildings } from 'phosphor-react';
import './Profile.css';


const Profile = ({ user }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await auth.signOut();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <React.Fragment>
            <Helmet>
                <title>{user.name || 'User'} | Notifiq Profile</title>
                <meta name="robots" content="noindex, nofollow" /> {/* User profiles should usually be private */}
            </Helmet>
            <div className="profile-container">
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar-large">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" />
                            ) : (
                                <div className="profile-avatar-placeholder">
                                    {(user.name || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <h2 className="profile-name">{user.name || user.displayName || 'User'}</h2>
                        <span className="profile-role-badge">{user.role?.replace('_', ' ')}</span>
                    </div>

                    <div className="profile-details">
                        <div className="detail-row">
                            <span className="detail-label"><Envelope size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Email</span>
                            <span className="detail-value">{user.email}</span>
                        </div>
                        {user.collegeName && (
                            <div className="detail-row">
                                <span className="detail-label"><Buildings size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> College</span>
                                <span className="detail-value">{user.collegeName}</span>
                            </div>
                        )}
                        {user.college && (
                            <div className="detail-row">
                                <span className="detail-label"><IdentificationCard size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> College Code</span>
                                <span className="detail-value">{user.college}</span>
                            </div>
                        )}
                    </div>

                    <button className="logout-full-btn" onClick={handleLogout}>
                        <SignOut size={20} weight="bold" />
                        Sign Out
                    </button>

                </div>

            </div>
        </React.Fragment>
    );
};

export default Profile;
