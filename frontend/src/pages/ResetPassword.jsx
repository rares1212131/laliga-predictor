import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import './LandingPage.css'; 

export function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        try {
            const token = searchParams.get('token');
            await api.post('/auth/reset-password', { 
                token: token, 
                newPassword: password 
            });
            
            setSuccess(true);
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            setError(err.response?.data?.error || "Reset failed. The link may have expired.");
        }
    };

    return (
        <div className="landing-wrapper">
            <div className="stadium-bg"></div>
            <div className="dark-overlay"></div>
            
            <div className="hero-section">
                <div className="status-card" style={{flexDirection: 'column', width: '450px'}}>
                    <h2>Set New Password</h2>
                    
                    {success ? (
                        <div style={{textAlign: 'center'}}>
                            <h3 style={{color: '#10b981', marginBottom: '1rem'}}>Success!</h3>
                            <p>Your password has been updated. Redirecting to login...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{width: '100%'}}>
                            <p style={{color: '#94a3b8', marginBottom: '1.5rem'}}>Enter your new secure password below.</p>
                            
                            {error && <div className="error-msg" style={{marginBottom: '1rem'}}>{error}</div>}
                            
                            <input 
                                type="password" 
                                placeholder="New Password" 
                                className="auth-input"
                                style={{
                                    width: '100%', padding: '0.8rem', borderRadius: '8px', 
                                    border: '1px solid #334155', background: '#1e293b', color: 'white',
                                    marginBottom: '1rem'
                                }}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <input 
                                type="password" 
                                placeholder="Confirm New Password" 
                                style={{
                                    width: '100%', padding: '0.8rem', borderRadius: '8px', 
                                    border: '1px solid #334155', background: '#1e293b', color: 'white'
                                }}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />

                            <button className="nav-btn-primary" style={{marginTop: '2rem', width: '100%'}}>
                                Update Password
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}