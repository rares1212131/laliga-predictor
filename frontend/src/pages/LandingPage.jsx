import React from 'react';
import './LandingPage.css';

export function LandingPage({ onOpenAuth }) {
    return (
        <div className="landing-wrapper">
            <div className="stadium-bg"></div>
            <div className="dark-overlay"></div>

            <nav className="landing-nav">
                <div className="logo">LaLiga<span>Predictor</span></div>
                <div className="nav-actions">
                    <button className="nav-link" onClick={onOpenAuth}>Sign In</button>
                    <button className="nav-btn-primary" onClick={onOpenAuth}>Get Started</button>
                </div>
            </nav>

            <main className="hero-section">
                <div className="hero-content">
                    <div className="ai-badge">
                        <span className="pulse"></span> 
                        AI MODEL ACTIVE: LA LIGA v2.1
                    </div>
                    
                    <h1>Predict the <br/>Unpredictable.</h1>
                    
                    <p className="hero-subtitle">
                        Stop guessing. Use machine learning trained on 10 years of match data 
                        to identify value and understand exactly <strong>why</strong> upsets happen.
                    </p>

                    <button className="cta-main" onClick={onOpenAuth}>ENTER THE ARENA</button>

                    <div className="status-card">
                        <div className="status-item">
                            <span className="status-label">LAST WEEK ACCURACY</span>
                            <span className="status-value">78.4%</span>
                        </div>
                        <div className="status-divider"></div>
                        <div className="status-item">
                            <span className="status-label">UPSETS PREDICTED</span>
                            <span className="status-value text-emerald">4</span>
                        </div>
                        <div className="status-divider"></div>
                        <div className="status-item">
                            <span className="status-label">COMMUNITY VOTES</span>
                            <span className="status-value">12.5k+</span>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="landing-footer">
                <p>Designed for analytical fans. No gambling, just intelligence.</p>
            </footer>
        </div>
    );
}