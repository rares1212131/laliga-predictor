import React, { useState } from 'react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';

export function EditProfileModal({ isOpen, onClose }) {
    const { user, updateUserData } = useAuth();
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/auth/update-profile', { firstName, lastName });
            updateUserData(res.data);
            alert("Profile updated!");
            onClose();
        } catch (err) {
            alert("Update failed: " + (err.response?.data?.error || "Server error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="auth-card" style={{ height: 'auto', maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                <div className="auth-form-side" style={{ padding: '2.5rem' }}>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                    <h2>Edit Account</h2>
                    <p className="subtitle">Update your profile information.</p>

                    <form onSubmit={handleSave} className="auth-form">
                        <div className="form-group">
                            <label style={{color: '#94a3b8', fontSize: '11px', fontWeight: '800'}}>FIRST NAME</label>
                            <input 
                                type="text" 
                                value={firstName} 
                                onChange={e => setFirstName(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label style={{color: '#94a3b8', fontSize: '11px', fontWeight: '800'}}>LAST NAME</label>
                            <input 
                                type="text" 
                                value={lastName} 
                                onChange={e => setLastName(e.target.value)} 
                                required 
                            />
                        </div>
                        <button type="submit" className="auth-btn-submit" disabled={loading}>
                            {loading ? 'SAVING...' : 'SAVE CHANGES'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}