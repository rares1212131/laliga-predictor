import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function AdminRoute({ children }) {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) return <div className="loading-screen">Authenticating Admin...</div>;

    const isAdmin = user?.roles?.includes('ROLE_ADMIN');

    if (!isAuthenticated || !isAdmin) {
        console.error("Access Denied: Admin privileges required.");
        return <Navigate to="/" replace />;
    }

    return children;
}