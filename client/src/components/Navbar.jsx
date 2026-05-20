import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, LogOut, LayoutDashboard, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();
    const { cart } = useCart();

    const publicLinks = [
        { name: 'Home', path: '/' },
        { name: 'Classes', path: '/classes' },
        { name: 'Store', path: '/products' },
    ];

    const memberLinks = [
        { name: 'Exercises', path: '/exercises' },
        { name: 'Diet', path: '/diets' },
        { name: 'AI Assessment', path: '/ai/assessment' },
    ];

    const navLinks = [
        ...publicLinks,
        ...((user && (user.role === 'member' || user.role === 'user')) ? memberLinks : []),
    ];

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => { setIsOpen(false); }, [location]);

    const getDashboardLink = () => {
        if (!user) return null;
        if (['super_admin', 'admin', 'gym_owner'].includes(user.role)) return '/admin';
        if (user.role === 'receptionist') return '/reception';
        if (user.role?.includes('trainer')) return '/trainer';
        return '/profile';
    };

    const isStaff = user && ['super_admin', 'admin', 'gym_owner', 'receptionist', 'male_trainer', 'female_trainer', 'dietician'].includes(user.role);

    return (
        <div className="fixed top-5 left-0 right-0 z-[100] px-4 flex justify-center pointer-events-none">
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`pointer-events-auto flex items-center gap-2 md:gap-6 rounded-full p-1.5 md:p-2 transition-all duration-500 ${
                    scrolled
                        ? 'bg-white/95 border border-gray-200 shadow-xl shadow-gray-200/60 scale-95'
                        : 'bg-white/80 border border-gray-200/80 shadow-lg shadow-gray-100/60'
                }`}
                style={{ backdropFilter: 'blur(16px)' }}
            >
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center bg-gray-900 rounded-full w-10 h-10 md:w-11 md:h-11 overflow-hidden hover:bg-gray-800 transition-all flex-shrink-0">
                    <img src="/logo.png" alt="Logo" className="w-6 h-6 md:w-7 md:h-7 object-contain" />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-0.5">
                    {navLinks.map((link) => {
                        const active = location.pathname === link.path;
                        return (
                            <Link key={link.name} to={link.path}
                                className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all relative ${
                                    active ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                {link.name}
                                {active && (
                                    <motion.span layoutId="nav-active"
                                        className="absolute inset-0 bg-orange-50 rounded-full -z-10" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5 md:gap-2">
                    {/* Cart */}
                    <Link to="/cart" className="relative p-2.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">
                        <ShoppingCart size={18} />
                        {cart.length > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-md">
                                {cart.length}
                            </span>
                        )}
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-1.5">
                            <Link to="/profile"
                                className="flex items-center gap-2 px-3 py-2 bg-gray-900 rounded-full hover:bg-gray-800 transition-all">
                                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">
                                    {(user.username || user.email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <span className="text-[12px] font-bold text-white max-w-[100px] truncate hidden md:block">
                                    {user.username || user.email}
                                </span>
                            </Link>

                            {isStaff && (
                                <Link to={getDashboardLink()}
                                    className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-all"
                                    title="Dashboard">
                                    <LayoutDashboard size={17} />
                                </Link>
                            )}

                            <button onClick={logout}
                                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                title="Logout">
                                <LogOut size={17} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5">
                            <Link to="/login"
                                className="px-4 py-2 text-[13px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all">
                                Log in
                            </Link>
                            <Link to="/register"
                                className="px-5 py-2 text-[13px] font-black text-white bg-orange-500 hover:bg-orange-600 rounded-full transition-all shadow-md shadow-orange-200">
                                Join
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu */}
                    <button className="md:hidden p-2.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all"
                        onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -10 }}
                        className="absolute top-full left-4 right-4 mt-3 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl md:hidden pointer-events-auto"
                    >
                        <div className="p-3 flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <Link key={link.name} to={link.path}
                                    className={`px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                                        location.pathname === link.path
                                            ? 'bg-orange-50 text-orange-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}>
                                    {link.name}
                                </Link>
                            ))}

                            <div className="h-px bg-gray-100 my-1" />

                            {user ? (
                                <>
                                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl text-sm font-bold">
                                        <User size={16} className="text-orange-500" /> Profile
                                    </Link>
                                    <button onClick={logout} className="flex items-center gap-3 px-4 py-3.5 text-red-500 hover:bg-red-50 rounded-xl text-left text-sm font-bold">
                                        <LogOut size={16} /> Logout
                                    </button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 p-2">
                                    <Link to="/login" className="py-3 text-center text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">Log in</Link>
                                    <Link to="/register" className="py-3 text-center text-sm font-black text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-all">Join</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Navbar;