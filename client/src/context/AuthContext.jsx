import { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser, logoutUser, googleLoginUser } from '../api/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Failed to parse user from local storage", error);
                localStorage.removeItem('user'); // Clear corrupted data
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        try {
            const user = await loginUser({ email, password });
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            toast.success('Login successful!');
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false, error: error.message };
        }
    };

    const register = async (username, email, password) => {
        try {
            const user = await registerUser({ username, email, password });
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            toast.success('Registration successful!');
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await logoutUser();
            localStorage.removeItem('user');
            setUser(null);
            toast.success('Logged out successfully');
        } catch (error) {
            console.error(error);
            toast.error('Logout failed');
        }
    };

    const googleLogin = async (token) => {
        try {
            const user = await googleLoginUser(token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            toast.success('Google Login successful!');
            return { success: true };
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Google Login failed');
            return { success: false, error: error.message };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, googleLogin, loading }}>
            {loading ? <div className="flex justify-center items-center h-screen text-gym-primary text-xl">Loading...</div> : children}
        </AuthContext.Provider>
    );
};
