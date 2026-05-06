import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, LogOut, LayoutDashboard, Zap, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

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

    // Member-only links (not for admin or trainer — they run the gym, not use it)
    const memberLinks = [
        { name: 'Exercises', path: '/exercises' },
        { name: 'Diet', path: '/diets' },
    ];

    const navLinks = [
        ...publicLinks,
        ...((user && user.role === 'user') ? memberLinks : []),
    ];

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => { setIsOpen(false); }, [location]);

    const getDashboardLink = () => {
        if (!user) return null;
        if (user.role === 'admin') return '/admin';
        if (user.role === 'trainer') return '/trainer';
        return '/profile';
    };

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                scrolled ? 'bg-gym-dark/80 backdrop-blur-md border-b border-white/10 py-3 shadow-lg' : 'bg-gym-dark/50 backdrop-blur-sm border-b border-transparent py-4'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <img src="/logo.png" alt="CoreX" className="w-8 h-8 object-contain transform group-hover:scale-105 transition-transform" />
                    <span className="text-xl font-bold tracking-tight text-white uppercase">
                        CoreX
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`text-sm font-semibold transition-colors relative group ${
                                location.pathname === link.path ? 'text-white' : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            {link.name}
                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-gym-accent transition-all duration-300 ${
                                location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                            }`} />
                        </Link>
                    ))}
                </div>

                {/* Desktop Right Actions */}
                <div className="hidden md:flex items-center gap-5">
                    <Link to="/cart" className="relative text-zinc-400 hover:text-white transition-colors group">
                        <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                        {cart.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gym-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-gym-accent/50">
                                {cart.length}
                            </span>
                        )}
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-3 pl-5 border-l border-white/10">
                            <Link
                                to="/profile"
                                className="flex items-center gap-2.5 p-1 pr-3 rounded-xl bg-white/5 border border-white/5 hover:border-gym-accent/30 hover:bg-white/10 transition-all group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10">
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
                                    <span className="text-xs font-black text-white leading-none uppercase tracking-tighter">
                                        {user.username}
                                    </span>
                                    <span className="text-[9px] font-bold text-gym-accent leading-none uppercase tracking-widest mt-0.5">
                                        {user.role}
                                    </span>
                                </div>
                            </Link>

                            {(user.role === 'admin' || user.role === 'trainer') && (
                                <Link
                                    to={user.role === 'admin' ? "/admin" : "/trainer"}
                                    className="p-2 bg-white/5 hover:bg-gym-accent/10 text-zinc-400 hover:text-gym-accent rounded-xl transition-all border border-white/5"
                                    title="Dashboard"
                                >
                                    <LayoutDashboard size={18} />
                                </Link>
                            )}

                            <button
                                onClick={logout}
                                className="p-2 bg-white/5 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 rounded-xl transition-all border border-white/5"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 pl-5 border-l border-white/10">
                            <Link to="/login" className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors">
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
                    className="md:hidden text-zinc-300 hover:text-white p-1"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 w-full bg-gym-dark border-b border-white/10 shadow-2xl md:hidden">
                    <div className="px-4 py-4 flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-base font-semibold px-4 py-3 rounded-lg transition-colors ${
                                    location.pathname === link.path
                                        ? 'bg-gym-accent/10 text-gym-accent'
                                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        <div className="h-px bg-white/5 my-2" />

                        <Link
                            to="/cart"
                            className="flex items-center justify-between text-base font-semibold px-4 py-3 text-zinc-400 hover:bg-white/5 hover:text-white rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <ShoppingCart size={18} /> Cart
                            </div>
                            {cart.length > 0 && (
                                <span className="bg-gym-accent text-white text-xs px-2 py-0.5 rounded-full">
                                    {cart.length}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <>
                                <Link
                                    to={getDashboardLink()}
                                    className="flex items-center gap-3 text-base font-semibold px-4 py-3 text-zinc-400 hover:bg-white/5 hover:text-white rounded-lg"
                                >
                                    {user.role === 'admin' || user.role === 'trainer' ? (
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