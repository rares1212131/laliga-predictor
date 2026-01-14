import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './LandingPage.css'; 

export function PleaseVerify() {
    const location = useLocation();

    const email = location.state?.email || "your inbox";

    return (
        <div className="landing-wrapper">
            <div className="stadium-bg"></div>
            <div className="dark-overlay"></div>
            
            <div className="hero-section">
                <div className="status-card" style={{flexDirection: 'column', textAlign: 'center', maxWidth: '500px'}}>
                    <div className="ai-badge">REGISTRATION PENDING</div>
                    
                    <h2 style={{fontSize: '2.5rem', marginBottom: '1.5rem'}}>Check Your Email</h2>
                    
                    <p style={{color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6'}}>
                        We have sent a verification link to:<br/>
                        <strong style={{color: 'white'}}>{email}</strong>
                    </p>
                    
                    <p style={{color: '#64748b', fontSize: '0.9rem', marginTop: '1rem'}}>
                        You must verify your account before you can access the AI predictions.
                    </p>

                    <Link to="/" className="nav-btn-primary" style={{marginTop: '2rem', textDecoration: 'none', display: 'inline-block'}}>
                        Return to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}