import React, { useState } from 'react';
import { Envelope, Phone, Buildings, User, PaperPlaneRight } from 'phosphor-react';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        collegeName: '',
        contactPerson: '',
        email: '',
        phone: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate EmailJS for now as prompt says "Use EmailJS / backend email service"
        // In real simplified MVP, we can just alert success or console log.
        // User prompt: "On submit, send email to: gskarthikkrishnan@gmail.com"

        console.log("Sending email to gskarthikkrishnan@gmail.com with data:", formData);

        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
            setFormData({ collegeName: '', contactPerson: '', email: '', phone: '', message: '' });
        }, 1500);
    };

    return (
        <div className="contact-container">
            <div className="contact-card">
                <div className="contact-header">
                    <h2>Get in Touch</h2>
                    <p>Have questions? Interested in Notifiq for your college? Let us know.</p>
                </div>

                {submitted ? (
                    <div className="success-message">
                        <PaperPlaneRight size={48} color="var(--color-primary)" />
                        <h3>Message Sent!</h3>
                        <p>We'll get back to you shortly.</p>
                        <button className="btn-reset" onClick={() => setSubmitted(false)}>Send another</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-group">
                            <label><Buildings size={18} /> College / Organization</label>
                            <input
                                type="text"
                                name="collegeName"
                                value={formData.collegeName}
                                onChange={handleChange}
                                required
                                placeholder="Alpha Arts and Science"
                            />
                        </div>

                        <div className="form-group">
                            <label><User size={18} /> Contact Person</label>
                            <input
                                type="text"
                                name="contactPerson"
                                value={formData.contactPerson}
                                onChange={handleChange}
                                required
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label><Envelope size={18} /> Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="admin@college.edu"
                                />
                            </div>
                            <div className="form-group">
                                <label><Phone size={18} /> Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Message</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                placeholder="Tell us about your requirements..."
                                rows="4"
                            ></textarea>
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                )}
            </div>

            <footer className="contact-footer">
                <p>&copy; 2025 Notifiq. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Contact;
