import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api/api';

export function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying');

    useEffect(() => {
        const verify = async () => {
            const token = searchParams.get('token');
            try {
                await api.get(`/auth/verify-email?token=${token}`);
                setStatus('success');
            } catch (err) {
                setStatus('error', err);
            }
        };
        verify();
    }, [searchParams]);

    return (
        <div className="landing-wrapper">
            <div className="dark-overlay"></div>
            <div className="hero-section">
                <div className="status-card" style={{flexDirection: 'column', textAlign: 'center'}}>
                    {status === 'verifying' && <h2>Confirming Identity...</h2>}
                    {status === 'success' && (
                        <>
                            <h2 style={{color: '#10b981'}}>Verified!</h2>
                            <p>Your account is now active.</p>
                            <Link to="/" className="cta-main" style={{marginTop: '2rem', textDecoration: 'none'}}>Login Now</Link>
                        </>
                    )}
                    {status === 'error' && <h2 style={{color: '#ef4444'}}>Link Expired or Invalid</h2>}
                </div>
            </div>
        </div>
    );
}