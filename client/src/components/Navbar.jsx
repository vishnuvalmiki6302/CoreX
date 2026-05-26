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
        const handleScroll = () => setScrolled(window.scrollY > 10);
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
        <div className={`fixed top-0 left-0 right-0 z-[100] w-full h-16 transition-all duration-300 ${scrolled ? 'bg-white/70 shadow-md backdrop-blur-xl border-b border-white/60' : 'bg-white/30 backdrop-blur-md border-b border-white/30'}`}>
            <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
                
                {/* Left: Logo */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="flex items-center justify-center bg-gray-900 rounded-full w-10 h-10 overflow-hidden group-hover:bg-gray-800 transition-colors">
                        <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-gray-900">
                        Core<span className="text-orange-500">X</span>
                    </span>
                </Link>

                {/* Middle: Navigation Links (Desktop) */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => {
                        const active = location.pathname === link.path;
                        return (
                            <Link key={link.name} to={link.path}
                                className={`text-sm font-semibold transition-colors relative py-1 ${
                                    active ? 'text-orange-600' : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {link.name}
                                {active && (
                                    <motion.div layoutId="navbar-indicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500 rounded-t-full" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    {/* Cart */}
                    <Link to="/cart" className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors">
                        <ShoppingCart size={20} />
                        {cart.length > 0 && (
                            <span className="absolute top-0 right-0 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                {cart.length}
                            </span>
                        )}
                    </Link>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-6 bg-gray-200 mx-1" />

                    {user ? (
                        <div className="hidden md:flex items-center gap-3">
                            <div className="flex flex-col items-end mr-1">
                                <span className="text-sm font-bold text-gray-900 leading-tight truncate max-w-[120px]">
                                    {user.username || user.email}
                                </span>
                                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                                    {user.role}
                                </span>
                            </div>

                            <Link to="/profile" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors border border-gray-200">
                                <User size={18} />
                            </Link>

                            {isStaff && (
                                <Link to={getDashboardLink()} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors border border-gray-200" title="Dashboard">
                                    <LayoutDashboard size={18} />
                                </Link>
                            )}

                            <button onClick={logout} className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors border border-red-100" title="Logout">
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-3">
                            <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 px-2 transition-colors">
                                Log in
                            </Link>
                            <Link to="/register" className="text-sm font-bold text-white bg-gray-900 hover:bg-orange-500 px-5 py-2.5 rounded-lg transition-colors">
                                Join Now
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
                    >
                        <div className="px-6 py-4 flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                {navLinks.map((link) => (
                                    <Link key={link.name} to={link.path}
                                        className={`px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
                                            location.pathname === link.path
                                                ? 'bg-orange-50 text-orange-600'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}>
                                        {link.name}
                                    </Link>
                                ))}
                            </div>

                            <div className="h-px bg-gray-100" />

                            {user ? (
                                <div className="flex flex-col gap-2">
                                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-sm font-bold transition-colors">
                                        <User size={18} className="text-orange-500" /> Profile
                                    </Link>
                                    {isStaff && (
                                        <Link to={getDashboardLink()} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-sm font-bold transition-colors">
                                            <LayoutDashboard size={18} className="text-orange-500" /> Dashboard
                                        </Link>
                                    )}
                                    <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg text-left text-sm font-bold transition-colors">
                                        <LogOut size={18} /> Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Link to="/login" className="py-3 text-center text-sm font-bold text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">Log in</Link>
                                    <Link to="/register" className="py-3 text-center text-sm font-bold text-white bg-gray-900 rounded-lg hover:bg-orange-500 transition-colors">Join Now</Link>
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