import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-gym-primary text-xl">Loading...</div>;
    }

    if (!user) {
        toast.error('You must be logged in to view this page');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && user.role !== 'admin') {
        // toast.error('Access denied as currently logged in user is not an admin');
        // This is commented out to avoid toast loops if multiple redirects happen, 
        // but can be enabled if desired.
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
