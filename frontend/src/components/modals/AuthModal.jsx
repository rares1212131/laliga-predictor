import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AuthModal.css';

export function AuthModal({ isOpen, onClose }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const GOOGLE_AUTH_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace('/api', '') + '/oauth2/authorization/google';

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await login(formData.email, formData.password);
                onClose();
                navigate('/dashboard');
            } else {
                if (formData.password !== formData.confirmPassword) {
                    setError("Passwords do not match");
                    return;
                }
                await register(formData);
                onClose();
                navigate('/please-verify', { state: { email: formData.email } });
            }
        } catch (err) {
            setError(err.response?.data?.error || "Authentication failed");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="auth-card" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>&times;</button>
                
                <div className="auth-split">
                    <div className="auth-form-side">
                        <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
                        <p className="subtitle">{isLogin ? 'Enter your credentials to access the arena.' : 'Join the elite football analysts today.'}</p>
                        
                        {error && <div className="error-msg">{error}</div>}

                        <form onSubmit={handleSubmit} className="auth-form">
                            {!isLogin && (
                                <div className="name-row">
                                    <input type="text" placeholder="First Name" onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                                    <input type="text" placeholder="Last Name" onChange={e => setFormData({...formData, lastName: e.target.value})} required />
                                </div>
                            )}
                            <input type="email" placeholder="Email Address" onChange={e => setFormData({...formData, email: e.target.value})} required />
                            <input type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} required />
                            
                            {!isLogin && (
                                <input type="password" placeholder="Confirm Password" onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required />
                            )}
                            
                            <button type="submit" className="auth-btn-submit">
                                {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>OR</span>
                        </div>

                        <a href={GOOGLE_AUTH_URL} className="google-auth-btn">
                            <img src="/google-icon.png" alt="Google" />
                            Continue with Google
                        </a>
                    </div>
                    <div className="auth-switch-side">
                        <div className="switch-content">
                            <h3>{isLogin ? "New here?" : "Already a member?"}</h3>
                            <p>{isLogin ? "Sign up to start predicting and climb the global leaderboard." : "Sign in to see your latest streaks and analysis."}</p>
                            <button className="btn-switch" onClick={() => {setIsLogin(!isLogin); setError('');}}>
                                {isLogin ? "CREATE ACCOUNT" : "SIGN IN"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}