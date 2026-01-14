import React, { useState } from 'react';
import api from '../api/api';
import './LandingPage.css';

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (err) {
            alert("Error sending link", err);
        }
    };

    return (
        <div className="landing-wrapper">
            <div className="stadium-bg"></div>
            <div className="dark-overlay"></div>
            <div className="hero-section">
                <form className="status-card" onSubmit={handleSubmit} style={{flexDirection: 'column', width: '450px'}}>
                    <h2>Reset Password</h2>
                    {!sent ? (
                        <>
                            <p style={{color: '#94a3b8', marginBottom: '1.5rem'}}>Enter your email and we will send you a recovery link.</p>
                            <input 
                                type="email" 
                                placeholder="Email Address"
                                style={{padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: 'white'}}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button className="nav-btn-primary" style={{marginTop: '1.5rem', width: '100%'}}>Send Link</button>
                        </>
                    ) : (
                        <p style={{color: '#10b981'}}>Success! Check your inbox for instructions.</p>
                    )}
                </form>
            </div>
        </div>
    );
}