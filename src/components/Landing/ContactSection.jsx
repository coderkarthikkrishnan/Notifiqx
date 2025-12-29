import React, { useRef, useState } from 'react';
import { User, Envelope, Phone, PaperPlaneRight, Buildings } from 'phosphor-react';
import emailjs from '@emailjs/browser';
import './ContactSection.css';
import DeveloperCard from '../DeveloperCard';

const ContactSection = () => {
    const form = useRef();
    const [status, setStatus] = useState('idle'); // idle, sending, success, error

    const sendEmail = (e) => {
        e.preventDefault();
        setStatus('sending');

        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (!serviceId || !templateId || !publicKey || serviceId.includes('your_')) {
            alert('EmailJS keys are missing from .env!');
            setStatus('error');
            return;
        }

        emailjs.sendForm(serviceId, templateId, form.current, publicKey)
            .then((result) => {
                console.log(result.text);
                setStatus('success');
                form.current.reset();
                setTimeout(() => setStatus('idle'), 3000); // Reset status after 3s
            }, (error) => {
                console.log(error.text);
                setStatus('error');
                alert('Failed to send message, please try again later.');
            });
    };

    return (
        <section className="contact-section">
            <div className="contact-left">
                <h1 className="contact-headline">
                    Get <p id="noticol">Notifiqx</p> in your
                    Campus or
                    Organization
                </h1>

                <DeveloperCard />
            </div>

            <div className="contact-right">
                <div className="contact-form-card">
                    <h2 className="form-header">Contact US</h2>

                    <form ref={form} onSubmit={sendEmail}>
                        <div className="form-group">
                            <label>Organization / College Name <span>*</span></label>
                            <div className="input-wrapper">
                                <Buildings size={18} className="input-icon" />
                                <input type="text" name="organization_name" className="form-input has-icon" placeholder="e.g. Springfield University" required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Contact Person <span>*</span></label>
                            <div className="input-wrapper">
                                <User size={18} className="input-icon" />
                                <input type="text" name="user_name" className="form-input has-icon" placeholder="John Doe" required />
                            </div>
                        </div>

                        <div className="input-row">
                            <div className="form-group">
                                <label>Email Address <span>*</span></label>
                                <div className="input-wrapper">
                                    <Envelope size={18} className="input-icon" />
                                    <input type="email" name="user_email" className="form-input has-icon" placeholder="john@example.com" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <div className="input-wrapper">
                                    <Phone size={18} className="input-icon" />
                                    <input type="tel" name="user_phone" className="form-input has-icon" placeholder="+1 (555) 000-0000" />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Purpose</label>
                            <select name="purpose" className="form-select">
                                <option value="College Onboarding">College Onboarding</option>
                                <option value="Technical Support">Technical Support</option>
                                <option value="General Inquiry">General Inquiry</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Message <span>*</span></label>
                            <textarea name="message" className="form-textarea" rows="4" placeholder="How can we help you?" required></textarea>
                        </div>

                        <button type="submit" className={`submit-btn ${status}`} disabled={status === 'sending' || status === 'success'}>
                            {status === 'sending' ? 'Sending...' : status === 'success' ? 'Message Sent!' : (
                                <>Send Message <PaperPlaneRight size={18} weight="fill" /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
