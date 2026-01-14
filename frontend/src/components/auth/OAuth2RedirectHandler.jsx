import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function OAuth2RedirectHandler() {
    const navigate = useNavigate();
    const { loading, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (isAuthenticated) {
                console.log("[RedirectHandler] User authenticated, moving to dashboard");
                navigate('/dashboard');
            } else {
                console.warn("[RedirectHandler] Authentication failed, returning home");
                navigate('/');
            }
        }
    }, [loading, isAuthenticated, navigate]);

    return (
        <div className="landing-wrapper">
            <div className="hero-section">
                <div className="ai-badge">
                    <span className="pulse"></span> 
                    SYNCHRONIZING SECURE SESSION...
                </div>
                <h2>Finalizing Login...</h2>
            </div>
        </div>
    );
}