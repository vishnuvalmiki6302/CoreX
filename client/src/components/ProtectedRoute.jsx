import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ADMIN_ROLES = ['super_admin', 'gym_owner'];

const ProtectedRoute = ({ children, adminOnly = false, allowedRoles = null }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const [notified, setNotified] = useState(false);

    useEffect(() => {
        if (!loading && !user && !notified) {
            toast.error('You must be logged in to view this page');
            setNotified(true);
        }
    }, [loading, user, notified]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-gym-primary text-xl">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Legacy adminOnly check — supports both old 'admin' and new RBAC roles
    if (adminOnly && !ADMIN_ROLES.includes(user.role) && user.role !== 'admin') {
        toast.error('Admin access required');
        return <Navigate to="/" replace />;
    }

    // New RBAC check — pass allowedRoles={['receptionist','super_admin']} etc.
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        toast.error('You do not have permission to view this page');
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
