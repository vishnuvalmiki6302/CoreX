import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const [redirectReason, setRedirectReason] = useState(null);

    useEffect(() => {
        if (!loading && !user) {
            setRedirectReason('login');
        } else if (!loading && adminOnly && user && user.role !== 'admin') {
            setRedirectReason('admin');
        }
    }, [loading, user, adminOnly]);

    useEffect(() => {
        if (redirectReason === 'login') {
            toast.error('You must be logged in to view this page');
        }
    }, [redirectReason]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-gym-primary text-xl">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
