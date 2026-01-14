import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { LandingPage } from './pages/LandingPage';
import { Arena } from './pages/Arena'; 
import { PleaseVerify } from './pages/PleaseVerify';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { MatchDetail } from './pages/MatchDetail';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AuthModal } from './components/modals/AuthModal';
import { VerifyEmail } from './components/auth/VerifyEmail';
import { OAuth2RedirectHandler } from './components/auth/OAuth2RedirectHandler';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';

function App() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const openAuth = () => setIsAuthModalOpen(true);
    const closeAuth = () => setIsAuthModalOpen(false);

    return (
        <>
            <Routes>
                <Route path="/" element={<LandingPage onOpenAuth={openAuth} />} />
                <Route path="/please-verify" element={<PleaseVerify />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <Arena /> 
                        </ProtectedRoute>
                    } 
                />
                <Route path="/match/:id" element={<ProtectedRoute><MatchDetail /></ProtectedRoute>} />

                <Route 
                    path="/admin/*" 
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    } 
                />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>

            <AuthModal isOpen={isAuthModalOpen} onClose={closeAuth} />
        </>
    );
}

export default App;