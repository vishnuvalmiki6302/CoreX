import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Users, Activity, Shield, Calendar, LogOut, Menu, X,
    Home as HomeIcon, Plus, Edit, Trash2, Package, Search, Info,
    TrendingUp, AlertCircle, CheckCircle, BarChart2, PieChart as PieChartIcon,
    IndianRupee, RefreshCw, ArrowUpRight, ArrowDownRight, Zap,
    UserCheck, Clock, ShoppingCart, Target, Award, Layers, Receipt, Filter
} from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer
} from 'recharts';

// ─── Chart theme ─────────────────────────────────────────────────────────────
const chartTheme = {
    tooltip: {
        contentStyle: {
            background: '#1e293b', border: '1px solid #334155',
            borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            padding: '10px 14px',
        },
        itemStyle: { fontSize: '12px', fontWeight: '700', color: '#f1f5f9' },
        labelStyle: { fontSize: '10px', fontWeight: '800', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }
    },
    grid: { stroke: '#f1f5f9', strokeDasharray: '4 4' },
    axis: { tick: { fill: '#94a3b8', fontSize: 10, fontWeight: '600' } }
};
const GRADIENT_COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

// ─── Mini Stat Card ───────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, gradient, change, changeType, sub }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl p-6 text-white ${gradient} shadow-lg`}
    >
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
        <div className="absolute -right-2 bottom-0 w-16 h-16 bg-white/5 rounded-full" />
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Icon size={20} />
                </div>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full ${changeType === 'up' ? 'bg-white/20' : 'bg-black/20'}`}>
                        {changeType === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {change}
                    </div>
                )}
            </div>
            <h3 className="text-3xl font-black mb-1">{value}</h3>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">{label}</p>
            {sub && <p className="text-white/50 text-[10px] mt-1 italic">{sub}</p>}
        </div>
    </motion.div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, desc, action }) => (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
            {desc && <p className="text-gray-500 text-sm font-medium mt-1 max-w-2xl">{desc}</p>}
        </div>
        {action}
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    // Core data
    const [stats, setStats] = useState({ userCount: 0, revenue: 0, activePlans: 0 });
    const [users, setUsers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [classes, setClasses] = useState([]);
    const [products, setProducts] = useState([]);

    // Analytics data
    const [analytics, setAnalytics] = useState({
        revenue: {}, memberStats: {}, trainerPerf: [],
        genderRatio: [], revenueData: [], attendanceData: []
    });

    // Search
    const [searchUsers, setSearchUsers] = useState('');
    const [searchPlans, setSearchPlans] = useState('');
    const [searchClasses, setSearchClasses] = useState('');
    const [searchProducts, setSearchProducts] = useState('');
    const [searchTransactions, setSearchTransactions] = useState('');
    const [txFilter, setTxFilter] = useState('all'); // 'all' | 'payment' | 'order' | 'attendance'

    // Transaction data
    const [payments, setPayments] = useState([]);
    const [orders, setOrders] = useState([]);
    const [allAttendance, setAllAttendance] = useState([]);
    const [txLoading, setTxLoading] = useState(false);

    // Modals
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userForm, setUserForm] = useState({ username: '', email: '', role: 'member', password: '', status: 'active' });

    const [showPlanModal, setShowPlanModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [planForm, setPlanForm] = useState({ name: '', price: '', durationMonths: 1, description: '' });

    const [showClassModal, setShowClassModal] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [classForm, setClassForm] = useState({ name: '', trainerId: '', startTime: '', durationMinutes: 60, capacity: 20 });

    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({ name: '', price: '', category: '', stock: 0, description: '', imageFile: null });

    useEffect(() => {
        if (!user || user.role !== 'admin') { navigate('/'); return; }
        fetchData();
        fetchAnalytics();
        fetchTransactions();
    }, [user, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, plansRes, classesRes, productsRes, statsRes] = await Promise.all([
                api.get('/users').catch(() => ({ data: [] })),
                api.get('/plans/admin').catch(() => ({ data: [] })),
                api.get('/classes').catch(() => ({ data: [] })),
                api.get('/products').catch(() => ({ data: [] })),
                api.get('/analytics/stats').catch(() => ({ data: {} })),
            ]);
            setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
            setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
            setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
            setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
            setStats(statsRes.data || {});
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const [revRes, memRes, trainerRes, genderRes, attendRes] = await Promise.all([
                api.get('/analytics/revenue').catch(() => ({ data: {} })),
                api.get('/analytics/membership-stats').catch(() => ({ data: {} })),
                api.get('/analytics/trainer-performance').catch(() => ({ data: { performance: [] } })),
                api.get('/analytics/gender-ratio').catch(() => ({ data: { ratio: [] } })),
                api.get('/analytics/attendance-chart').catch(() => ({ data: [] })),
            ]);
            setAnalytics({
                revenue: revRes.data || {},
                memberStats: memRes.data || {},
                trainerPerf: trainerRes.data?.performance || [],
                genderRatio: (genderRes.data?.ratio || []).map(g => ({ name: g._id || 'Unknown', value: g.count })),
                revenueData: (revRes.data?.monthly || []),
                attendanceData: Array.isArray(attendRes.data) ? attendRes.data : [],
            });
        } catch (e) { console.error(e); }
        finally { setAnalyticsLoading(false); }
    };

    const fetchTransactions = async () => {
        setTxLoading(true);
        try {
            const [payRes, ordRes] = await Promise.all([
                api.get('/payments').catch(() => ({ data: [] })),
                api.get('/orders/all').catch(() => ({ data: [] })),
            ]);
            setPayments(Array.isArray(payRes.data) ? payRes.data : []);
            setOrders(Array.isArray(ordRes.data) ? ordRes.data : []);
        } catch (e) { console.error(e); }
        finally { setTxLoading(false); }
    };

    // ── User CRUD ─────────────────────────────────────────────────────────────
    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                const { data } = await api.put(`/users/${editingUser._id}`, userForm);
                setUsers(users.map(u => u._id === editingUser._id ? data : u));
                toast.success('User updated');
            } else {
                const { data } = await api.post('/users', userForm);
                setUsers([data, ...users]);
                toast.success('User created');
            }
            setShowUserModal(false); setEditingUser(null);
            setShowUserModal(false); setEditingUser(null);
            setUserForm({ username: '', email: '', role: 'member', password: '', status: 'active' });
        } catch (error) { 
            toast.error(error.response?.data?.message || 'Failed to save user'); 
            console.error(error);
        }
    };
    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user permanently?')) return;
        try { await api.delete(`/users/${id}`); setUsers(users.filter(u => u._id !== id)); toast.success('User deleted'); }
        catch { toast.error('Failed to delete user'); }
    };

    // ── Plan CRUD ─────────────────────────────────────────────────────────────
    const handleSavePlan = async (e) => {
        e.preventDefault();
        try {
            if (editingPlan) {
                const { data } = await api.put(`/plans/${editingPlan._id}`, planForm);
                setPlans(plans.map(p => p._id === editingPlan._id ? data : p));
                toast.success('Plan updated');
            } else {
                const { data } = await api.post('/plans', planForm);
                setPlans([data, ...plans]);
                toast.success('Plan created');
            }
            setShowPlanModal(false); setEditingPlan(null);
            setPlanForm({ name: '', price: '', durationMonths: 1, description: '' });
        } catch { toast.error('Failed to save plan'); }
    };
    const handleDeletePlan = async (id) => {
        if (!window.confirm('Delete this plan?')) return;
        try { await api.delete(`/plans/${id}`); setPlans(plans.filter(p => p._id !== id)); toast.success('Plan deleted'); }
        catch { toast.error('Failed to delete'); }
    };

    // ── Class CRUD ────────────────────────────────────────────────────────────
    const handleSaveClass = async (e) => {
        e.preventDefault();
        try {
            if (editingClass) {
                const { data } = await api.put(`/classes/${editingClass._id}`, classForm);
                setClasses(classes.map(c => c._id === editingClass._id ? data : c));
                toast.success('Class updated');
            } else {
                const { data } = await api.post('/classes', classForm);
                setClasses([data, ...classes]);
                toast.success('Class created');
            }
            setShowClassModal(false); setEditingClass(null);
            setClassForm({ name: '', trainerId: '', startTime: '', durationMinutes: 60, capacity: 20 });
        } catch { toast.error('Failed to save class'); }
    };
    const handleDeleteClass = async (id) => {
        if (!window.confirm('Delete this class?')) return;
        try { await api.delete(`/classes/${id}`); setClasses(classes.filter(c => c._id !== id)); toast.success('Class deleted'); }
        catch { toast.error('Failed to delete'); }
    };

    // ── Product CRUD ──────────────────────────────────────────────────────────
    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', productForm.name);
            formData.append('price', productForm.price);
            formData.append('category', productForm.category);
            formData.append('stock', productForm.stock);
            formData.append('description', productForm.description);

            if (productForm.imageFile) {
                // New image selected — upload it
                formData.append('image', productForm.imageFile);
            } else if (productForm.image) {
                // No new image — pass existing image URL as text so server keeps it
                formData.append('image', productForm.image);
            }

            if (editingProduct) {
                const { data } = await api.put(`/products/${editingProduct._id}`, formData);
                setProducts(products.map(p => p._id === editingProduct._id ? data : p));
                toast.success('Product updated');
            } else {
                const { data } = await api.post('/products', formData);
                setProducts([data, ...products]);
                toast.success('Product created');
            }
            setShowProductModal(false); setEditingProduct(null);
            setProductForm({ name: '', price: '', category: '', stock: 0, description: '', imageFile: null, image: '' });
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save product';
            toast.error(msg);
            console.error('Product save error:', err.response?.data);
        }
    };
    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try { await api.delete(`/products/${id}`); setProducts(products.filter(p => p._id !== id)); toast.success('Product deleted'); }
        catch { toast.error('Failed to delete'); }
    };

    const navItems = [
        { id: 'overview', label: 'Overview', icon: BarChart2 },
        { id: 'users', label: 'Members', icon: Users },
        { id: 'plans', label: 'Memberships', icon: Shield },
        { id: 'classes', label: 'Schedule', icon: Calendar },
        { id: 'products', label: 'Inventory', icon: Package },
        { id: 'transactions', label: 'Transactions', icon: Receipt },
    ];

    const memberCount = users.filter(u => u.role === 'member').length;
    const trainerCount = users.filter(u => ['male_trainer', 'female_trainer', 'trainer'].includes(u.role)).length;
    const activeUsersCount = users.filter(u => u.status === 'active').length;
    const totalRevenue = analytics.revenue?.totalRevenue || 0;
    const planData = (analytics.memberStats?.planDistribution || []).map(p => ({ name: p._id || 'None', value: p.count }));
    const growthData = (analytics.memberStats?.memberGrowth || []).map(g => ({ month: g._id, members: g.newMembers }));
    const revenueData = analytics.revenueData;

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-semibold text-sm">Loading Admin Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full overflow-hidden bg-[#F5F6FA] flex font-sans">

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside className={`
                w-64 flex-shrink-0 flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300
                lg:relative lg:translate-x-0 lg:flex
                ${mobileMenuOpen ? 'translate-x-0 flex shadow-2xl' : '-translate-x-full hidden lg:flex'}
                bg-gray-900 text-white
            `}>
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                                <span className="text-white font-black text-sm">CX</span>
                            </div>
                            <div>
                                <p className="font-black text-white text-sm">CoreX</p>
                                <p className="text-orange-400 text-[10px] font-bold uppercase tracking-widest">Admin Panel</p>
                            </div>
                        </Link>
                        <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-white/50 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest px-3 mb-3">Navigation</p>
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                    : 'text-white/50 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <Icon size={18} />
                                {item.label}
                                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
                            </button>
                        );
                    })}

                    <div className="pt-4">
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-widest px-3 mb-3">Quick Stats</p>
                        <div className="space-y-2">
                            {[
                                { label: 'Members', value: memberCount, color: 'text-blue-400' },
                                { label: 'Trainers', value: trainerCount, color: 'text-emerald-400' },
                                { label: 'Products', value: products.length, color: 'text-purple-400' },
                                { label: 'Classes', value: classes.length, color: 'text-yellow-400' },
                            ].map(s => (
                                <div key={s.label} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5">
                                    <span className="text-white/50 text-xs font-semibold">{s.label}</span>
                                    <span className={`text-sm font-black ${s.color}`}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* Bottom */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4 px-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center font-black text-sm">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.username}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-wider">Administrator</p>
                        </div>
                    </div>
                    <Link to="/" className="flex items-center gap-2 px-3 py-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-xl text-sm font-semibold transition-all mb-1">
                        <HomeIcon size={16} /> Back to Site
                    </Link>
                    <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-semibold transition-all">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
            )}

            {/* ── Main ───────────────────────────────────────────────────── */}
            <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shrink-0 justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden text-gray-600 hover:text-gray-900">
                            <Menu size={22} />
                        </button>
                        <div>
                            <h1 className="text-base font-black text-gray-900">{navItems.find(n => n.id === activeTab)?.label}</h1>
                            <p className="text-xs text-gray-400 font-medium hidden sm:block">
                                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => { fetchData(); fetchAnalytics(); }} className="p-2.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all" title="Refresh data">
                            <RefreshCw size={18} />
                        </button>
                        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-sm">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-xs font-black text-gray-900">{user?.username}</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Admin</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content area */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <AnimatePresence mode="wait">

                        {/* ══ OVERVIEW TAB ══════════════════════════════════ */}
                        {activeTab === 'overview' && (
                            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">

                                {/* KPI Cards */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                                    <StatCard label="Total Members" value={memberCount} icon={Users} gradient="bg-gradient-to-br from-blue-500 to-blue-700" change="+12%" changeType="up" sub={`${activeUsersCount} active`} />
                                    <StatCard label="Total Revenue" value={`₹${(totalRevenue / 1000).toFixed(1)}K`} icon={IndianRupee} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" change="+8%" changeType="up" />
                                    <StatCard label="Active Plans" value={plans.length} icon={Shield} gradient="bg-gradient-to-br from-orange-500 to-orange-700" />
                                    <StatCard label="Total Trainers" value={trainerCount} icon={Award} gradient="bg-gradient-to-br from-purple-500 to-purple-700" sub={`${classes.length} classes`} />
                                </div>

                                {/* Row 2: Secondary stats */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Products in Store', value: products.length, icon: Package, bg: 'bg-yellow-50', color: 'text-yellow-600', border: 'border-yellow-100' },
                                        { label: 'Scheduled Classes', value: classes.length, icon: Calendar, bg: 'bg-sky-50', color: 'text-sky-600', border: 'border-sky-100' },
                                        { label: 'Low Stock Items', value: products.filter(p => p.stock <= 10).length, icon: AlertCircle, bg: 'bg-red-50', color: 'text-red-500', border: 'border-red-100' },
                                        { label: 'Admin Users', value: users.filter(u => u.role === 'admin').length, icon: Shield, bg: 'bg-indigo-50', color: 'text-indigo-600', border: 'border-indigo-100' },
                                    ].map(s => {
                                        const Icon = s.icon;
                                        return (
                                            <div key={s.label} className={`bg-white border ${s.border} rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all`}>
                                                <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                                    <Icon size={22} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-2xl font-black text-gray-900">{s.value}</p>
                                                    <p className="text-xs text-gray-400 font-semibold truncate">{s.label}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Charts Row 1: Revenue + Membership distribution */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Revenue Chart */}
                                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Revenue Trend</h3>
                                                <p className="text-xs text-gray-400 mt-0.5">Monthly revenue performance</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-emerald-500 text-xs font-black bg-emerald-50 px-3 py-1.5 rounded-full">
                                                <TrendingUp size={12} /> Growing
                                            </div>
                                        </div>
                                        {analyticsLoading ? (
                                            <div className="h-52 flex items-center justify-center">
                                                <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                                            </div>
                                        ) : (
                                            <div className="h-52">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={revenueData}>
                                                        <defs>
                                                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid {...chartTheme.grid} />
                                                        <XAxis dataKey="_id" {...chartTheme.axis} />
                                                        <YAxis {...chartTheme.axis} />
                                                        <Tooltip {...chartTheme.tooltip} />
                                                        <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fill="url(#revGrad)" dot={{ fill: '#f97316', r: 4, strokeWidth: 2, stroke: '#fff' }} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}
                                    </div>

                                    {/* Plan distribution pie */}
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-1">Plan Distribution</h3>
                                        <p className="text-xs text-gray-400 mb-6">Membership tier breakdown</p>
                                        {analyticsLoading ? (
                                            <div className="h-52 flex items-center justify-center">
                                                <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                                            </div>
                                        ) : planData.length > 0 ? (
                                            <>
                                                <div className="h-36">
                                                    <ResponsiveContainer>
                                                        <PieChart>
                                                            <Pie data={planData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={4}>
                                                                {planData.map((_, i) => <Cell key={i} fill={GRADIENT_COLORS[i % GRADIENT_COLORS.length]} />)}
                                                            </Pie>
                                                            <Tooltip {...chartTheme.tooltip} />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div className="space-y-2 mt-4">
                                                    {planData.slice(0, 4).map((p, i) => (
                                                        <div key={p.name} className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: GRADIENT_COLORS[i % GRADIENT_COLORS.length] }} />
                                                                <span className="text-xs text-gray-600 font-semibold truncate max-w-[100px]">{p.name}</span>
                                                            </div>
                                                            <span className="text-xs font-black text-gray-900">{p.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="h-52 flex flex-col items-center justify-center text-gray-300">
                                                <PieChartIcon size={48} className="mb-3 opacity-30" />
                                                <p className="text-xs font-semibold">No plan data yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Charts Row 2: Member Growth + Gender + Trainer Perf */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Member Growth */}
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-1">Member Growth</h3>
                                        <p className="text-xs text-gray-400 mb-6">New members per month</p>
                                        {analyticsLoading ? <div className="h-40 flex items-center justify-center"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div> : (
                                            <div className="h-40">
                                                <ResponsiveContainer>
                                                    <LineChart data={growthData}>
                                                        <CartesianGrid {...chartTheme.grid} />
                                                        <XAxis dataKey="month" {...chartTheme.axis} />
                                                        <YAxis {...chartTheme.axis} />
                                                        <Tooltip {...chartTheme.tooltip} />
                                                        <Line type="monotone" dataKey="members" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 4, stroke: '#fff', strokeWidth: 2 }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}
                                    </div>

                                    {/* Gender ratio */}
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-1">Demographics</h3>
                                        <p className="text-xs text-gray-400 mb-4">Member gender ratio</p>
                                        {analyticsLoading ? <div className="h-40 flex items-center justify-center"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div> : (
                                            <>
                                                <div className="h-32">
                                                    <ResponsiveContainer>
                                                        <PieChart>
                                                            <Pie data={analytics.genderRatio} cx="50%" cy="50%" outerRadius={55} dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                                                {analytics.genderRatio.map((_, i) => <Cell key={i} fill={GRADIENT_COLORS[i % GRADIENT_COLORS.length]} />)}
                                                            </Pie>
                                                            <Tooltip {...chartTheme.tooltip} />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div className="flex justify-center gap-4 mt-2">
                                                    {analytics.genderRatio.map((g, i) => (
                                                        <div key={g.name} className="flex items-center gap-1.5">
                                                            <div className="w-2 h-2 rounded-full" style={{ background: GRADIENT_COLORS[i % GRADIENT_COLORS.length] }} />
                                                            <span className="text-[10px] font-bold text-gray-500 uppercase">{g.name}: {g.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Trainer Performance */}
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-1">Trainer Load</h3>
                                        <p className="text-xs text-gray-400 mb-4">Assigned members per trainer</p>
                                        {analyticsLoading ? <div className="h-40 flex items-center justify-center"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div> : analytics.trainerPerf.length > 0 ? (
                                            <div className="h-40">
                                                <ResponsiveContainer>
                                                    <BarChart data={analytics.trainerPerf.slice(0, 5)} layout="vertical" barSize={12}>
                                                        <CartesianGrid horizontal={false} stroke="#f1f5f9" />
                                                        <XAxis type="number" {...chartTheme.axis} />
                                                        <YAxis dataKey="name" type="category" width={60} {...chartTheme.axis} />
                                                        <Tooltip {...chartTheme.tooltip} />
                                                        <Bar dataKey="assignedMembers" fill="#f97316" radius={[0, 6, 6, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="h-40 flex flex-col items-center justify-center text-gray-300">
                                                <BarChart2 size={48} className="mb-2 opacity-30" />
                                                <p className="text-xs font-semibold">No trainer data</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Recent Members + Low Stock */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                            <h3 className="text-sm font-black text-gray-900">Recent Members</h3>
                                            <button onClick={() => setActiveTab('users')} className="text-xs text-orange-500 font-bold hover:underline flex items-center gap-1">View all <ArrowUpRight size={12} /></button>
                                        </div>
                                        <div className="divide-y divide-gray-50">
                                            {users.slice(0, 5).map(u => (
                                                <div key={u._id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50/50 transition-colors">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                                                        {u.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold text-gray-900 truncate">{u.username}</p>
                                                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'trainer' || u.role === 'male_trainer' || u.role === 'female_trainer' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                            <h3 className="text-sm font-black text-gray-900">Inventory Alerts</h3>
                                            <button onClick={() => setActiveTab('products')} className="text-xs text-orange-500 font-bold hover:underline flex items-center gap-1">Manage <ArrowUpRight size={12} /></button>
                                        </div>
                                        <div className="divide-y divide-gray-50">
                                            {products.filter(p => p.stock <= 10).length === 0 ? (
                                                <div className="px-6 py-8 text-center">
                                                    <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
                                                    <p className="text-sm font-semibold text-gray-400">All products well-stocked</p>
                                                </div>
                                            ) : products.filter(p => p.stock <= 10).slice(0, 5).map(p => (
                                                <div key={p._id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50/50 transition-colors">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${p.stock <= 0 ? 'bg-red-100 text-red-500' : 'bg-orange-100 text-orange-500'}`}>
                                                        <Package size={16} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold text-gray-900 truncate">{p.name}</p>
                                                        <p className="text-xs text-gray-400">{p.category}</p>
                                                    </div>
                                                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${p.stock <= 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                                        {p.stock <= 0 ? 'Out' : `${p.stock} left`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ══ MEMBERS TAB ═══════════════════════════════════ */}
                        {activeTab === 'users' && (
                            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <SectionHeader
                                    title="Member Directory"
                                    desc="Manage all registered members, trainers, and administrators. Update roles, account status, or remove users."
                                    action={
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-orange-400 transition-all flex-1 sm:w-72">
                                                <Search size={15} className="text-gray-400 flex-shrink-0" />
                                                <input type="text" placeholder="Search by name or email..." className="outline-none text-sm w-full bg-transparent" value={searchUsers} onChange={e => setSearchUsers(e.target.value)} />
                                            </div>
                                            <button onClick={() => { setEditingUser(null); setUserForm({ username: '', email: '', role: 'member', password: '', status: 'active' }); setShowUserModal(true); }}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors whitespace-nowrap shadow-md">
                                                <Plus size={16} /> Add User
                                            </button>
                                        </div>
                                    }
                                />

                                {/* Stats bar */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    {[
                                        { label: 'Members', value: memberCount, color: 'bg-blue-500' },
                                        { label: 'Trainers', value: trainerCount, color: 'bg-emerald-500' },
                                        { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'bg-purple-500' },
                                    ].map(s => (
                                        <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                                            <div className={`w-3 h-8 ${s.color} rounded-full`} />
                                            <div>
                                                <p className="text-xl font-black text-gray-900">{s.value}</p>
                                                <p className="text-xs text-gray-400 font-semibold">{s.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Member</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {users.filter(u =>
                                                    u.username.toLowerCase().includes(searchUsers.toLowerCase()) ||
                                                    (u.email && u.email.toLowerCase().includes(searchUsers.toLowerCase()))
                                                ).map(u => (
                                                    <tr key={u._id} className="hover:bg-orange-50/30 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                                                                    {u.username.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900">{u.username}</p>
                                                                    <p className="text-gray-400 text-xs font-mono">{u.memberId || '#' + u._id.slice(-6).toUpperCase()}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-gray-700 font-medium text-sm">{u.email}</p>
                                                            <p className="text-gray-400 text-xs">{u.phoneNumber || '—'}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'trainer' ? 'bg-blue-100 text-blue-700' : u.role === 'receptionist' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                                                                <span className={`text-xs font-bold capitalize ${u.status === 'active' ? 'text-emerald-700' : 'text-red-600'}`}>{u.status || 'Active'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => { setEditingUser(u); setUserForm({ username: u.username, email: u.email || '', role: u.role, status: u.status || 'active', password: '' }); setShowUserModal(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={15} /></button>
                                                                <button onClick={() => handleDeleteUser(u._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={15} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {users.length === 0 && <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">No users found.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ══ PLANS TAB ═════════════════════════════════════ */}
                        {activeTab === 'plans' && (
                            <motion.div key="plans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <SectionHeader
                                    title="Memberships & Plans"
                                    desc="Create and manage subscription plans. Configure pricing, duration, and features for each tier."
                                    action={
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-orange-400 transition-all flex-1 sm:w-56">
                                                <Search size={15} className="text-gray-400" />
                                                <input type="text" placeholder="Search plans..." className="outline-none text-sm w-full bg-transparent" value={searchPlans} onChange={e => setSearchPlans(e.target.value)} />
                                            </div>
                                            <button onClick={() => { setEditingPlan(null); setPlanForm({ name: '', price: '', durationMonths: 1, description: '' }); setShowPlanModal(true); }}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors whitespace-nowrap shadow-md">
                                                <Plus size={16} /> Create Plan
                                            </button>
                                        </div>
                                    }
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {plans.filter(p => p.name.toLowerCase().includes(searchPlans.toLowerCase())).map((p, i) => (
                                        <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all group relative p-8 flex flex-col">
                                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingPlan(p); setPlanForm(p); setShowPlanModal(true); }} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all"><Edit size={14} /></button>
                                                <button onClick={() => handleDeletePlan(p._id)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={14} /></button>
                                            </div>
                                            <div className="mb-4">
                                                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-black uppercase tracking-widest">{p.durationMonths} Month{p.durationMonths > 1 ? 's' : ''}</span>
                                            </div>
                                            <h3 className="text-xl font-black text-gray-900 mb-3">{p.name}</h3>
                                            <div className="flex items-baseline gap-1 mb-4">
                                                <span className="text-4xl font-black text-gray-900">₹{p.price}</span>
                                                <span className="text-gray-400 text-sm">/ plan</span>
                                            </div>
                                            <div className="h-px bg-gray-100 mb-4" />
                                            <p className="text-gray-500 text-sm font-medium leading-relaxed flex-grow">{p.description || 'No description provided.'}</p>
                                            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400 font-semibold">
                                                <Layers size={14} /> {p.durationMonths * 30} days access
                                            </div>
                                        </motion.div>
                                    ))}
                                    {plans.length === 0 && (
                                        <div className="col-span-3 py-16 text-center">
                                            <Shield size={48} className="text-gray-200 mx-auto mb-4" />
                                            <p className="text-gray-400 font-semibold">No plans configured yet.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* ══ CLASSES TAB ═══════════════════════════════════ */}
                        {activeTab === 'classes' && (
                            <motion.div key="classes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <SectionHeader
                                    title="Class Schedule"
                                    desc="Organize the gym's daily schedule. Assign trainers, set timings, and configure capacity limits."
                                    action={
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-orange-400 transition-all flex-1 sm:w-56">
                                                <Search size={15} className="text-gray-400" />
                                                <input type="text" placeholder="Search classes..." className="outline-none text-sm w-full bg-transparent" value={searchClasses} onChange={e => setSearchClasses(e.target.value)} />
                                            </div>
                                            <button onClick={() => { setEditingClass(null); setClassForm({ name: '', trainerId: '', startTime: '', durationMinutes: 60, capacity: 20 }); setShowClassModal(true); }}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors whitespace-nowrap shadow-md">
                                                <Plus size={16} /> Schedule Class
                                            </button>
                                        </div>
                                    }
                                />
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Date & Time</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Class</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Trainer</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Capacity</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {classes.filter(c => c.name.toLowerCase().includes(searchClasses.toLowerCase())).map(c => {
                                                    const d = new Date(c.startTime);
                                                    const enrolled = c.enrolledUsers?.length || 0;
                                                    const pct = Math.min((enrolled / c.capacity) * 100, 100);
                                                    return (
                                                        <tr key={c._id} className="hover:bg-orange-50/30 transition-colors group">
                                                            <td className="px-6 py-4">
                                                                <p className="font-bold text-gray-900">{d.toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                                                                <p className="text-orange-500 font-bold text-sm">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="font-bold text-gray-900">{c.name}</p>
                                                                <p className="text-gray-400 text-xs">{c.durationMinutes} minutes</p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">{c.trainer?.username || 'Unassigned'}</span>
                                                            </td>
                                                            <td className="px-6 py-4 w-44">
                                                                <div className="flex justify-between text-xs mb-1 font-semibold text-gray-500">
                                                                    <span>{enrolled}/{c.capacity}</span>
                                                                    <span>{pct.toFixed(0)}%</span>
                                                                </div>
                                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                                    <div className={`h-2 rounded-full ${pct >= 100 ? 'bg-red-500' : pct > 75 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={() => { setEditingClass(c); setClassForm({ name: c.name, trainerId: c.trainer?._id || '', startTime: c.startTime, durationMinutes: c.durationMinutes, capacity: c.capacity }); setShowClassModal(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={15} /></button>
                                                                    <button onClick={() => handleDeleteClass(c._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={15} /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {classes.length === 0 && <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">No classes scheduled.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ══ PRODUCTS TAB ══════════════════════════════════ */}
                        {activeTab === 'products' && (
                            <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <SectionHeader
                                    title="Store Inventory"
                                    desc="Manage gym merchandise, supplements, and accessories. Monitor stock levels to avoid running out."
                                    action={
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-orange-400 transition-all flex-1 sm:w-56">
                                                <Search size={15} className="text-gray-400" />
                                                <input type="text" placeholder="Search products..." className="outline-none text-sm w-full bg-transparent" value={searchProducts} onChange={e => setSearchProducts(e.target.value)} />
                                            </div>
                                            <button onClick={() => { setEditingProduct(null); setProductForm({ name: '', price: '', category: '', stock: 0, description: '', imageFile: null }); setShowProductModal(true); }}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors whitespace-nowrap shadow-md">
                                                <Plus size={16} /> Add Product
                                            </button>
                                        </div>
                                    }
                                />

                                {/* Stock summary */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    {[
                                        { label: 'In Stock', value: products.filter(p => p.stock > 10).length, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                                        { label: 'Low Stock', value: products.filter(p => p.stock > 0 && p.stock <= 10).length, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
                                        { label: 'Out of Stock', value: products.filter(p => p.stock <= 0).length, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
                                    ].map(s => (
                                        <div key={s.label} className={`bg-white border ${s.border} rounded-2xl p-4 shadow-sm text-center`}>
                                            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                                            <p className="text-xs text-gray-400 font-semibold mt-1">{s.label}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Stock</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {products.filter(p => p.name.toLowerCase().includes(searchProducts.toLowerCase())).map(p => (
                                                    <tr key={p._id} className="hover:bg-orange-50/30 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                                    <Package size={18} className="text-gray-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900">{p.name}</p>
                                                                    <p className="text-gray-400 text-xs">{p.description?.slice(0, 40) || '—'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4"><span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wider">{p.category || '—'}</span></td>
                                                        <td className="px-6 py-4 font-black text-gray-900 text-base">₹{p.price}</td>
                                                        <td className="px-6 py-4">
                                                            {p.stock <= 0 ? (
                                                                <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1 rounded-lg w-max text-xs font-bold"><AlertCircle size={12} /> Out of Stock</div>
                                                            ) : p.stock <= 10 ? (
                                                                <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-3 py-1 rounded-lg w-max text-xs font-bold"><AlertCircle size={12} /> Low ({p.stock})</div>
                                                            ) : (
                                                                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg w-max text-xs font-bold"><CheckCircle size={12} /> In Stock ({p.stock})</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => { setEditingProduct(p); setProductForm({ ...p, imageFile: null }); setShowProductModal(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={15} /></button>
                                                                <button onClick={() => handleDeleteProduct(p._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={15} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {products.length === 0 && <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">No products in inventory.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ══ TRANSACTIONS TAB ══════════════════════════════ */}
                        {activeTab === 'transactions' && (
                            <motion.div key="transactions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <SectionHeader
                                    title="All Transactions"
                                    desc="Complete audit trail of every plan payment, store order, and gym attendance event across all members."
                                    action={
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-orange-400 transition-all flex-1 sm:w-64">
                                                <Search size={15} className="text-gray-400 flex-shrink-0" />
                                                <input type="text" placeholder="Search user or description..." className="outline-none text-sm w-full bg-transparent" value={searchTransactions} onChange={e => setSearchTransactions(e.target.value)} />
                                            </div>
                                            <button onClick={fetchTransactions} className="p-2.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl border border-gray-200 bg-white transition-all" title="Refresh">
                                                <RefreshCw size={18} />
                                            </button>
                                        </div>
                                    }
                                />

                                {/* Filter tabs */}
                                <div className="flex items-center gap-2 mb-6 flex-wrap">
                                    {[
                                        { key: 'all', label: 'All Activity' },
                                        { key: 'payment', label: 'Plan Payments' },
                                        { key: 'order', label: 'Store Orders' },
                                    ].map(f => (
                                        <button
                                            key={f.key}
                                            onClick={() => setTxFilter(f.key)}
                                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${txFilter === f.key ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Summary cards */}
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0"><IndianRupee size={22} /></div>
                                        <div>
                                            <p className="text-2xl font-black text-gray-900">₹{payments.reduce((s, p) => s + (p.amount || 0), 0).toLocaleString()}</p>
                                            <p className="text-xs text-gray-400 font-semibold">Total Plan Revenue</p>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0"><ShoppingCart size={22} /></div>
                                        <div>
                                            <p className="text-2xl font-black text-gray-900">₹{orders.reduce((s, o) => s + (o.totalAmount || 0), 0).toLocaleString()}</p>
                                            <p className="text-xs text-gray-400 font-semibold">Store Orders Revenue</p>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center flex-shrink-0"><Receipt size={22} /></div>
                                        <div>
                                            <p className="text-2xl font-black text-gray-900">{payments.length + orders.length}</p>
                                            <p className="text-xs text-gray-400 font-semibold">Total Transactions</p>
                                        </div>
                                    </div>
                                </div>

                                {txLoading ? (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                                        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
                                        <p className="text-gray-400 text-sm font-semibold">Loading transactions...</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-gray-50 border-b border-gray-100">
                                                    <tr>
                                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">User</th>
                                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {/* Payments rows */}
                                                    {(txFilter === 'all' || txFilter === 'payment') && payments
                                                        .filter(p => {
                                                            const q = searchTransactions.toLowerCase();
                                                            return !q || (p.user?.username || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
                                                        })
                                                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                                        .map(p => (
                                                            <tr key={`pay-${p._id}`} className="hover:bg-emerald-50/30 transition-colors">
                                                                <td className="px-6 py-4">
                                                                    <p className="font-bold text-gray-900 text-xs">{new Date(p.createdAt).toLocaleDateString('en-IN')}</p>
                                                                    <p className="text-gray-400 text-[10px]">{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-black text-xs flex-shrink-0">
                                                                            {(p.user?.username || 'U').charAt(0).toUpperCase()}
                                                                        </div>
                                                                        <span className="font-semibold text-gray-800 text-xs">{p.user?.username || p.user || 'Member'}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase">Plan Payment</span>
                                                                </td>
                                                                <td className="px-6 py-4 text-gray-600 text-xs font-medium">{p.description || p.planName || 'Membership Plan'}</td>
                                                                <td className="px-6 py-4 text-right font-black text-gray-900">₹{(p.amount || 0).toLocaleString()}</td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${p.status === 'paid' || p.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                                                                        {p.status || 'paid'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }
                                                    {/* Orders rows */}
                                                    {(txFilter === 'all' || txFilter === 'order') && orders
                                                        .filter(o => {
                                                            const q = searchTransactions.toLowerCase();
                                                            return !q || (o.user?.username || '').toLowerCase().includes(q);
                                                        })
                                                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                                        .map(o => (
                                                            <tr key={`ord-${o._id}`} className="hover:bg-blue-50/30 transition-colors">
                                                                <td className="px-6 py-4">
                                                                    <p className="font-bold text-gray-900 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                                                                    <p className="text-gray-400 text-[10px]">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-black text-xs flex-shrink-0">
                                                                            {(o.user?.username || 'U').charAt(0).toUpperCase()}
                                                                        </div>
                                                                        <span className="font-semibold text-gray-800 text-xs">{o.user?.username || 'Member'}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase">Store Order</span>
                                                                </td>
                                                                <td className="px-6 py-4 text-gray-600 text-xs font-medium">
                                                                    {o.items?.map(i => i.name || i.product?.name).filter(Boolean).slice(0, 2).join(', ') || `Order #${o._id?.slice(-6).toUpperCase()}`}
                                                                    {o.items?.length > 2 && ` +${o.items.length - 2} more`}
                                                                </td>
                                                                <td className="px-6 py-4 text-right font-black text-gray-900">₹{(o.totalAmount || 0).toLocaleString()}</td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${o.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : o.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'}`}>
                                                                        {o.status || 'pending'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }
                                                    {payments.length === 0 && orders.length === 0 && (
                                                        <tr>
                                                            <td colSpan="6" className="px-6 py-16 text-center">
                                                                <Receipt size={40} className="text-gray-200 mx-auto mb-3" />
                                                                <p className="text-gray-400 font-semibold text-sm">No transactions found</p>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* ══ MODALS ════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {/* User Modal */}
                {showUserModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-black text-gray-900">{editingUser ? 'Edit User' : 'Register New User'}</h3>
                                <button onClick={() => setShowUserModal(false)} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-xl"><X size={18} /></button>
                            </div>
                            <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex gap-3">
                                <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={16} />
                                <p className="text-xs text-blue-700 font-medium">Changing a user's role updates their permissions immediately.</p>
                            </div>
                            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                                {[
                                    { label: 'Name', field: 'username', type: 'text', required: true },
                                    { label: 'Email', field: 'email', type: 'email', required: !editingUser, disabled: !!editingUser },
                                ].map(({ label, field, type, required, disabled }) => (
                                    <div key={field}>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">{label}</label>
                                        <input required={required} type={type} disabled={disabled} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all disabled:bg-gray-50 disabled:text-gray-400" value={userForm[field]} onChange={e => setUserForm({ ...userForm, [field]: e.target.value })} />
                                    </div>
                                ))}
                                {!editingUser && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Password</label>
                                        <input required type="password" minLength="6" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} />
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Role</label>
                                        <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-orange-400 transition-all bg-white" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                                            {['member', 'trainer', 'receptionist', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Status</label>
                                        <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-orange-400 transition-all bg-white" value={userForm.status} onChange={e => setUserForm({ ...userForm, status: e.target.value })}>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">Cancel</button>
                                    <button type="submit" className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-md">{editingUser ? 'Update User' : 'Create User'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Plan Modal */}
                {showPlanModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-black text-gray-900">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h3>
                                <button onClick={() => setShowPlanModal(false)} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-xl"><X size={18} /></button>
                            </div>
                            <form onSubmit={handleSavePlan} className="p-6 space-y-4">
                                <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Plan Name</label><input required type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })} placeholder="e.g. Gold Membership" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Price (₹)</label><input required type="number" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" value={planForm.price} onChange={e => setPlanForm({ ...planForm, price: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Duration (months)</label><input required type="number" min="1" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" value={planForm.durationMonths} onChange={e => setPlanForm({ ...planForm, durationMonths: e.target.value })} /></div>
                                </div>
                                <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Description</label><textarea rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none" value={planForm.description} onChange={e => setPlanForm({ ...planForm, description: e.target.value })} placeholder="Describe what's included..." /></div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowPlanModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">Cancel</button>
                                    <button type="submit" className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-md">{editingPlan ? 'Update Plan' : 'Create Plan'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Class Modal */}
                {showClassModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-black text-gray-900">{editingClass ? 'Edit Class' : 'Schedule New Class'}</h3>
                                <button onClick={() => setShowClassModal(false)} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-xl"><X size={18} /></button>
                            </div>
                            <form onSubmit={handleSaveClass} className="p-6 space-y-4">
                                <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Class Name</label><input required type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-orange-400 transition-all" value={classForm.name} onChange={e => setClassForm({ ...classForm, name: e.target.value })} placeholder="e.g. Morning Yoga" /></div>
                                <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Trainer ID</label><input type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-orange-400 transition-all" value={classForm.trainerId} onChange={e => setClassForm({ ...classForm, trainerId: e.target.value })} placeholder="Trainer's user ID" /></div>
                                <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Start Time</label><input required type="datetime-local" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-orange-400 transition-all" value={classForm.startTime} onChange={e => setClassForm({ ...classForm, startTime: e.target.value })} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Duration (min)</label><input required type="number" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-orange-400 transition-all" value={classForm.durationMinutes} onChange={e => setClassForm({ ...classForm, durationMinutes: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Capacity</label><input required type="number" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-orange-400 transition-all" value={classForm.capacity} onChange={e => setClassForm({ ...classForm, capacity: e.target.value })} /></div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowClassModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">Cancel</button>
                                    <button type="submit" className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-md">{editingClass ? 'Update Class' : 'Schedule Class'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Product Modal */}
                {showProductModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-black text-gray-900">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
                                <button onClick={() => setShowProductModal(false)} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-xl"><X size={18} /></button>
                            </div>
                            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
                                <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Product Name</label><input required type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-orange-400 transition-all" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Price (₹)</label><input required type="number" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-orange-400 transition-all" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Stock</label><input required type="number" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-orange-400 transition-all" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} /></div>
                                </div>
                                <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Category</label>
                                    <select required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-orange-400 transition-all bg-white" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}>
                                        <option value="">Select category...</option>
                                        {['Supplements', 'Gear', 'Apparel', 'Equipment', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Description</label><textarea rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-orange-400 transition-all resize-none" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} /></div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Product Image {editingProduct && productForm.image ? '(leave blank to keep current)' : !editingProduct ? '(required)' : ''}</label>
                                    {editingProduct && productForm.image && !productForm.imageFile && (
                                        <img src={productForm.image} alt="current" className="w-16 h-16 object-cover rounded-xl mb-2 border border-gray-200" />
                                    )}
                                    <input type="file" accept="image/*" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-orange-400 transition-all bg-white" onChange={e => setProductForm({ ...productForm, imageFile: e.target.files[0] || null })} />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowProductModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">Cancel</button>
                                    <button type="submit" className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-md">{editingProduct ? 'Update Product' : 'Add Product'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
