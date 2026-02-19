import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { Menu, X, Dumbbell, ShoppingBag, Bell, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo'; // Importing SVG component
import api from '../api/axios';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation(); // To check active path

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const toggleMenu = () => setIsOpen(!isOpen);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll for notifications every minute
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (error) { console.error("Failed to fetch notifications"); }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) { console.error("Failed to mark as read"); }
    };

    const navLinks = [
        { title: 'Home', path: '/' },
        { title: 'Classes', path: '/classes' },
        { title: 'Products', path: '/products' },
        { title: 'Diets', path: '/diets' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
            <div className="container mx-auto px-6 py-4">
                <div className="flex justify-between items-center relative">

                    {/* LEFT: Logo */}
                    <Link to="/" className="flex items-center gap-2 text-2xl font-black text-white group z-20">
                        <Logo className="w-12 h-12" />
                        <span className="tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Core<span className="text-gym-accent">X</span>
                        </span>
                    </Link>

                    {/* CENTER: Navigation Links (Absolute Centered) */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.title}
                                    to={link.path}
                                    className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive
                                        ? 'text-white bg-white/10 shadow-inner border border-white/5'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {link.title}
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-glow"
                                            className="absolute inset-0 rounded-full bg-gym-accent/5 -z-10"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* RIGHT: Auth Buttons & Cart */}
                    <div className="hidden md:flex items-center gap-6 z-20">
                        {/* Cart Icon */}
                        <Link to="/cart" className="relative group">
                            <div className="p-2 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
                                <ShoppingBag className="text-gray-300 group-hover:text-white transition-colors" size={20} />
                            </div>
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-gym-accent text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-zinc-900">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        {/* Notifications */}
                        {user && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors group"
                                >
                                    <Bell className="text-gray-300 group-hover:text-white" size={20} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-zinc-900">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {showNotifications && (
                                    <div className="absolute right-0 top-full mt-4 w-80 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
                                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40">
                                            <h3 className="font-bold text-white text-sm">Notifications</h3>
                                            <span className="text-xs text-gray-500">{unreadCount} unread</span>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map(n => (
                                                    <div key={n._id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${n.isRead ? 'opacity-60' : 'bg-gym-accent/5'}`}>
                                                        <div className="flex gap-3">
                                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'warning' ? 'bg-orange-500' : 'bg-gym-accent'}`}></div>
                                                            <div className="flex-1">
                                                                <p className="text-sm text-gray-200 leading-snug mb-1">{n.message}</p>
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-[10px] text-gray-500">{new Date(n.createdAt).toLocaleDateString()}</span>
                                                                    {!n.isRead && (
                                                                        <button onClick={() => markAsRead(n._id)} className="text-[10px] text-gym-accent hover:underline flex items-center gap-1">
                                                                            <Check size={10} /> Mark read
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center text-gray-500 text-xs italic">
                                                    No notifications
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/profile" className="text-right hidden lg:block group">
                                    <span className="block text-xs text-gray-400 uppercase tracking-wider group-hover:text-gym-accent transition-colors">Welcome</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-white group-hover:text-gym-accent transition-colors">{user.username}</span>
                                        {user.role !== 'user' && (
                                            <span className="text-[10px] bg-gym-accent text-white px-1.5 py-0.5 rounded uppercase font-bold">
                                                {user.role}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                                <div className="h-8 w-px bg-white/10"></div>
                                {user.role === 'admin' && (
                                    <Link
                                        to="/admin"
                                        className="text-sm font-bold text-gym-accent hover:text-white transition-colors uppercase tracking-wide"
                                    >
                                        Dashboard
                                    </Link>
                                )}
                                <div className="h-8 w-px bg-white/10"></div>
                                <button
                                    onClick={logout}
                                    className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-sm font-semibold text-gray-300 hover:text-white transition-colors px-2"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="group relative px-5 py-2.5 bg-gym-accent rounded-lg overflow-hidden shadow-lg shadow-gym-accent/20 transition-transform hover:scale-105 active:scale-95"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                    <span className="relative text-sm font-bold text-white">Join Now</span>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors z-20"
                        onClick={toggleMenu}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-zinc-900/95 border-b border-white/10 backdrop-blur-xl overflow-hidden"
                    >
                        <div className="flex flex-col p-6 space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.title}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`text-lg font-medium py-2 border-b border-white/5 ${location.pathname === link.path ? 'text-gym-accent' : 'text-gray-300'
                                        }`}
                                >
                                    {link.title}
                                </Link>
                            ))}

                            <div className="pt-4 flex flex-col gap-3">
                                {user ? (
                                    <button
                                        onClick={() => { logout(); setIsOpen(false); }}
                                        className="w-full bg-red-500/10 text-red-500 py-3 rounded-xl font-semibold"
                                    >
                                        Logout
                                    </button>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            onClick={() => setIsOpen(false)}
                                            className="w-full text-center text-gray-300 py-3 font-medium hover:text-white"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setIsOpen(false)}
                                            className="w-full bg-gym-accent text-center text-white py-3 rounded-xl font-bold shadow-lg shadow-gym-accent/20"
                                        >
                                            Join Now
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav >
    );
};

export default Navbar;