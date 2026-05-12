import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, LogOut, LayoutDashboard, Zap, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Logo from './Logo';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();
    const { cart } = useCart();

    // Base links visible to everyone
    const publicLinks = [
        { name: 'Home', path: '/' },
        { name: 'Classes', path: '/classes' },
        { name: 'Store', path: '/products' },
    ];

    // Member-only links
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
        if (user.role === 'super_admin' || user.role === 'admin' || user.role === 'gym_owner') return '/admin';
        if (user.role === 'receptionist') return '/reception';
        if (user.role?.includes('trainer')) return '/trainer';
        return '/profile';
    };

    const isStaff = user && ['super_admin', 'admin', 'gym_owner', 'receptionist', 'male_trainer', 'female_trainer', 'dietician'].includes(user.role);

    const isHomePage = location.pathname === '/';
    const isScrolled = scrolled || !isHomePage;

    return (
        <nav
            className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
                isScrolled 
                ? 'bg-white/95 backdrop-blur-[12px] border-b border-gray-100 py-3 shadow-sm' 
                : 'bg-transparent py-4'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="group">
                    <Logo className="transition-transform group-hover:scale-105" />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`text-[15px] font-semibold transition-all relative group py-2 tracking-tight ${
                                location.pathname === link.path ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            {link.name}
                            <span className={`absolute -bottom-0.5 left-0 h-[2.5px] bg-gym-orange rounded-full transition-all duration-300 ${
                                location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                            }`} />
                        </Link>
                    ))}
                </div>

                {/* Desktop Right Actions */}
                <div className="hidden md:flex items-center gap-5">
                    <Link to="/cart" className="relative text-gray-600 hover:text-gray-900 transition-colors group">
                        <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                        {cart.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gym-accent text-gray-900 text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-gym-accent/50">
                                {cart.length}
                            </span>
                        )}
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-3 pl-5 border-l border-gray-200">
                            <Link
                                to="/profile"
                                className="flex items-center gap-2.5 p-1 pr-4 rounded-full bg-gray-50 border border-gray-100 hover:border-gym-accent/30 hover:bg-gray-100 transition-all group"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                    {user.profilePhoto ? (
                                        <img 
                                            src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `${import.meta.env.VITE_API_URL || ''}${user.profilePhoto}`} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <User size={16} className="text-gym-accent" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-gray-900 leading-none uppercase tracking-tighter">
                                        {user.username}
                                    </span>
                                    <span className="text-[9px] font-bold text-gym-accent leading-none uppercase tracking-widest mt-0.5">
                                        {user.role}
                                    </span>
                                </div>
                            </Link>

                            {isStaff && (
                                <Link
                                    to={getDashboardLink()}
                                    className="flex items-center gap-2 p-2 px-3 bg-gym-accent/10 hover:bg-gym-accent/20 text-gym-accent rounded-xl transition-all border border-gym-accent/20"
                                    title="Dashboard"
                                >
                                    <LayoutDashboard size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Dashboard</span>
                                </Link>
                            )}

                            <button
                                onClick={logout}
                                className="p-2 bg-gray-50 hover:bg-red-500/10 text-gray-600 hover:text-red-500 rounded-xl transition-all border border-gray-100"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 pl-5 border-l border-gray-200">
                            <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                                Log in
                            </Link>
                            <Link to="/register" className="btn-primary text-sm px-4 py-1.5 rounded-lg">
                                Join
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-gray-700 hover:text-gray-900 p-1"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 w-full bg-gym-dark border-b border-gray-200 shadow-2xl md:hidden">
                    <div className="px-4 py-4 flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-base font-semibold px-4 py-3 rounded-lg transition-colors ${
                                    location.pathname === link.path
                                        ? 'bg-gym-accent/10 text-gym-accent'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        <div className="h-px bg-gray-50 my-2" />

                        <Link
                            to="/cart"
                            className="flex items-center justify-between text-base font-semibold px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <ShoppingCart size={18} /> Cart
                            </div>
                            {cart.length > 0 && (
                                <span className="bg-gym-accent text-gray-900 text-xs px-2 py-0.5 rounded-full">
                                    {cart.length}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <>
                                <Link
                                    to={getDashboardLink()}
                                    className="flex items-center gap-3 text-base font-semibold px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg"
                                >
                                    {isStaff ? (
                                        <><LayoutDashboard size={18} /> Dashboard</>
                                    ) : (
                                        <><User size={18} /> Profile</>
                                    )}
                                </Link>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-3 text-base font-semibold px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-lg text-left"
                                >
                                    <LogOut size={18} /> Logout
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-3 px-4 mt-2 mb-2">
                                <Link to="/login" className="btn-outline flex-1 text-center py-2 text-sm rounded-lg">Log in</Link>
                                <Link to="/register" className="btn-primary flex-1 text-center py-2 text-sm rounded-lg">Join</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;