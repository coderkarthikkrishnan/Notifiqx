import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    ShieldCheck,
    BellRinging,
    Lightning,
    UsersThree,
    ArrowRight,
    CheckCircle,
    XCircle,
    Fire,
    Ticket,
    CircleWavyCheck
} from 'phosphor-react';
import './Landing.css';
import logo from '../assets/notifiq-logo.png';
import ContactSection from '../components/Landing/ContactSection';

const Landing = ({ user }) => {
    const navigate = useNavigate();

    // Structued Data for SEO
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Notifiq",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Centralized college notice board and exam notification system."
    };

    return (
        <React.Fragment>
            <Helmet>
                <title>Notifiq | Centralized College Notices & Alerts</title>
                <meta name="description" content="Never miss an exam or urgent circular. Notifiq centralizes college notices, providing real-time alerts and verified updates for students and faculty." />
                <link rel="canonical" href="https://notifiq.app/" />
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://notifiq.app/" />
                <meta property="og:title" content="Notifiq | Chaos Free Campus Updates" />
                <meta property="og:description" content="Stop scrolling through WhatsApp groups. Get verified college notices instantly." />
                <meta property="og:image" content="https://notifiq.app/og-image.jpg" />
                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://notifiq.app/" />
                <meta property="twitter:title" content="Notifiq | Centralized College Notices" />
                <meta property="twitter:description" content="Real-time alerts for exams and circulars." />
                <meta property="twitter:image" content="https://notifiq.app/og-image.jpg" />
                {/* JSON-LD Schema */}
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            </Helmet>

            <div className="landing-container">
                {/* Navigation - Only show if NOT logged in */}
                {!user && (
                    <nav className="landing-nav" role="navigation">
                        <div className="nav-logo">
                            <img src={logo} alt="Notifiq Logo" style={{ height: '32px' }} />
                        </div>
                        <div className="nav-links">
                            <Link to="/login" className="btn-primary" role="button">Get Started</Link>
                        </div>
                    </nav>
                )}

                {/* Hero Section */}
                <main>
                    <section className="hero">
                        <div className="hero-circle-bg"></div> {/* The circle background */}

                        <div className="floating-pill pill-exam">
                            <Ticket size={16} weight="fill" /> Exam Notification
                        </div>
                        <div className="floating-pill pill-urgent">
                            <Fire size={16} weight="fill" /> Urgent Circular
                        </div>
                        <div className="floating-pill pill-verified">
                            <CircleWavyCheck size={16} weight="fill" /> Verified Notice
                        </div>

                        <div className="hero-content">
                            <h1 className="hero-title">
                                Never Miss <br />
                                <span className="highlight">What Matters.</span>
                            </h1>
                            <p className="hero-subtitle">
                                All college notices, events, and announcements — organized in one place. No more scrolling through chaotic WhatsApp groups.
                            </p>

                            <Link
                                to={user ? (user.role === 'admin' ? '/admin' : user.role === 'super_admin' ? '/super' : '/viewer') : '/login'}
                                className="cta-button"
                            >
                                {user ? 'Go to Dashboard' : 'Get Started'} <ArrowRight size={20} />
                            </Link>
                        </div>
                    </section>

                    {/* Chaos vs Clarity */}
                    <section className="comparison">
                        <div className="comparison-card chaos">
                            <span className="card-label"><XCircle size={24} /> Chaos</span>
                            <p>Notices get buried in WhatsApp chats.</p>
                            <p>Students miss deadlines and updates.</p>
                        </div>
                        <div className="arrow-divider"><ArrowRight size={32} /></div>
                        <div className="comparison-card clarity">
                            <span className="card-label"><CheckCircle size={24} /> Clarity</span>
                            <p>A centralized, verified notice board </p>
                            <p> with real-time alerts.</p>

                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="features">
                        <div className="section-header">
                            <h2>Built for modern campuses.</h2>
                            <p>Everything you need to manage communication effectively.</p>
                        </div>

                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="icon-box"><ShieldCheck size={32} /></div>
                                <h3>Verified Access</h3>
                                <p>College-based isolation ensures privacy.</p>
                            </div>
                            <div className="feature-card">
                                <div className="icon-box"><BellRinging size={32} /></div>
                                <h3>Real-time Alerts</h3>
                                <p>Instant notifications for urgent notices.</p>
                            </div>
                            <div className="feature-card">
                                <div className="icon-box"><Lightning size={32} /></div>
                                <h3>AI Powered</h3>
                                <p>Gemini AI rewrites notices professionally.</p>
                            </div>
                            <div className="feature-card">
                                <div className="icon-box"><UsersThree size={32} /></div>
                                <h3>Faculty Control</h3>
                                <p>Admins manage departments and streams.</p>
                            </div>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <ContactSection />
                </main>

                {/* Footer */}
                <footer className="landing-footer">
                    <p>&copy; 2025 Notifiq. All rights reserved.</p>
                </footer>
            </div>
        </React.Fragment>
    );
};

export default Landing;
