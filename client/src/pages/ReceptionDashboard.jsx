import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
    Users, Activity, IndianRupee, AlertCircle, Search, Zap,
    LayoutDashboard, Calendar, CreditCard, ArrowRight, Clock,
    ShieldAlert, LogOut, Bell, PlusCircle, RefreshCw, BarChart3,
    QrCode, Package, ShoppingCart, UserCheck, Phone, Mail, Home,
    CheckCircle, X, ChevronRight, TrendingUp, Eye, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';

// ─── Stat Card Component ──────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, gradient, sub }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl p-5 text-white ${gradient} shadow-md`}
    >
        <div className="absolute -right-3 -top-3 w-20 h-20 bg-white/10 rounded-full" />
        <div className="relative z-10">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3 backdrop-blur-sm">
                <Icon size={18} />
            </div>
            <h3 className="text-2xl font-black mb-0.5">{value}</h3>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">{label}</p>
            {sub && <p className="text-white/50 text-[10px] mt-1">{sub}</p>}
        </div>
    </motion.div>
);

export default function ReceptionDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('command');
    const [stats, setStats] = useState({});
    const [members, setMembers] = useState([]);
    const [atRisk, setAtRisk] = useState([]);
    const [expiring, setExpiring] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Check-in
    const [checkInId, setCheckInId] = useState('');

    // Member detail modal
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberAttendance, setMemberAttendance] = useState([]);
    const [searchMembers, setSearchMembers] = useState('');
    const [searchProducts, setSearchProducts] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const [statsRes, membersRes, productsRes, ordersRes] = await Promise.all([
                api.get('/analytics/stats').catch(() => ({ data: {} })),
                api.get('/users').catch(() => ({ data: [] })),
                api.get('/products').catch(() => ({ data: [] })),
                api.get('/orders/all').catch(() => ({ data: [] })),
            ]);
            setStats(statsRes.data || {});
            const usersArr = Array.isArray(membersRes.data) ? membersRes.data : membersRes.data?.users || [];
            setMembers(usersArr.filter(u => u.role === 'member'));
            setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
            setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);

            try {
                const riskRes = await api.get('/ai/risk-detection');
                setAtRisk(riskRes.data?.members?.slice(0, 5) || []);
            } catch (_) { }

            const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            const expRes = await api.get(`/users?role=member&expiringBefore=${sevenDays.toISOString()}&limit=6`).catch(() => ({ data: [] }));
            setExpiring(expRes.data?.users || []);

            try {
                const attRes = await api.get('/attendance/active');
                setAttendance(Array.isArray(attRes.data) ? attRes.data : []);
            } catch (_) { }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (user.role !== 'receptionist' && user.role !== 'admin') {
            toast.error('Receptionist access required');
            navigate('/');
            return;
        }
        fetchData();
    }, [user, navigate, fetchData]);

    const handleQuickCheckIn = async (e) => {
        e.preventDefault();
        if (!checkInId.trim()) return;
        try {
            const res = await api.post('/attendance/check-in', { memberId: checkInId });
            toast.success(res.data.message || 'Check-in successful!');
            setCheckInId('');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Check-in failed');
        }
    };

    const handleViewMember = async (member) => {
        setSelectedMember(member);
        try {
            const res = await api.get(`/attendance/user/${member._id}`);
            setMemberAttendance(Array.isArray(res.data) ? res.data.slice(0, 10) : []);
        } catch (_) { setMemberAttendance([]); }
    };

    const navItems = [
        { id: 'command', label: 'Command Center', icon: LayoutDashboard },
        { id: 'personnel', label: 'Members & Attendance', icon: Users },
        { id: 'store', label: 'Store & Orders', icon: ShoppingCart },
    ];

    const filteredMembers = members.filter(m =>
        m.username?.toLowerCase().includes(searchMembers.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchMembers.toLowerCase()) ||
        m.memberId?.toLowerCase().includes(searchMembers.toLowerCase())
    );
    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchProducts.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchProducts.toLowerCase())
    );

    if (loading && !stats.totalMembers) {
        return (
            <div className="h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-14 h-14 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400 text-sm font-semibold">Loading Reception Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full overflow-hidden bg-[#F5F6FA] flex font-sans">

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside className="w-64 flex-shrink-0 bg-gray-900 text-white flex flex-col hidden lg:flex">
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-black text-sm">RX</span>
                        </div>
                        <div>
                            <p className="font-black text-white text-sm">CoreX</p>
                            <p className="text-teal-400 text-[10px] font-bold uppercase tracking-widest">Reception Desk</p>
                        </div>
                    </Link>
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
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive
                                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                                    : 'text-white/50 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <Icon size={18} />
                                {item.label}
                                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
                            </button>
                        );
                    })}

                    {/* Live stats */}
                    <div className="pt-4">
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-widest px-3 mb-3">Live Data</p>
                        <div className="space-y-2">
                            {[
                                { label: 'Total Members', value: members.length, color: 'text-teal-400' },
                                { label: 'Live Check-ins', value: attendance.length, color: 'text-emerald-400' },
                                { label: 'Expiring Soon', value: expiring.length, color: 'text-orange-400' },
                                { label: 'At Risk', value: atRisk.length, color: 'text-red-400' },
                            ].map(s => (
                                <div key={s.label} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5">
                                    <span className="text-white/50 text-xs font-semibold">{s.label}</span>
                                    <span className={`text-sm font-black ${s.color}`}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick links */}
                    <div className="pt-4">
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-widest px-3 mb-3">Quick Links</p>
                        <Link to="/kiosk" className="flex items-center gap-3 px-3 py-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-xl text-sm font-semibold transition-all">
                            <QrCode size={16} /> QR Kiosk
                        </Link>
                    </div>
                </nav>

                {/* Bottom */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4 px-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center font-black text-sm">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.username}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-wider">Receptionist</p>
                        </div>
                    </div>
                    <Link to="/" className="flex items-center gap-2 px-3 py-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-xl text-sm font-semibold transition-all mb-1">
                        <Home size={16} /> Back to Site
                    </Link>
                    <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-semibold transition-all">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* ── Main ───────────────────────────────────────────────────── */}
            <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shrink-0 justify-between shadow-sm">
                    <div>
                        <h1 className="text-base font-black text-gray-900">{navItems.find(n => n.id === activeTab)?.label}</h1>
                        <p className="text-xs text-gray-400 font-medium">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchData} className="p-2.5 text-gray-400 hover:text-teal-500 hover:bg-teal-50 rounded-xl transition-all" title="Refresh">
                            <RefreshCw size={18} />
                        </button>
                        {/* Mobile tab pills */}
                        <div className="flex lg:hidden gap-1 bg-gray-100 rounded-xl p-1">
                            {navItems.map(item => {
                                const Icon = item.icon;
                                return (
                                    <button key={item.id} onClick={() => setActiveTab(item.id)}
                                        className={`p-2 rounded-lg transition-all ${activeTab === item.id ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400'}`}>
                                        <Icon size={16} />
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center font-black text-sm">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-black text-gray-700 hidden sm:block">{user?.username}</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <AnimatePresence mode="wait">

                        {/* ══ COMMAND CENTER ════════════════════════════════ */}
                        {activeTab === 'command' && (
                            <motion.div key="command" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

                                {/* KPI Row */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <StatCard label="Total Members" value={members.length} icon={Users} gradient="bg-gradient-to-br from-teal-500 to-teal-700" sub={`${members.filter(m => m.status === 'active').length} active`} />
                                    <StatCard label="Live Check-ins" value={attendance.length} icon={Activity} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" sub="Currently in gym" />
                                    <StatCard label="Expiring Plans" value={expiring.length} icon={AlertCircle} gradient="bg-gradient-to-br from-orange-500 to-orange-700" sub="Within 7 days" />
                                    <StatCard label="At-Risk Members" value={atRisk.length} icon={ShieldAlert} gradient="bg-gradient-to-br from-red-500 to-red-700" sub="AI detected" />
                                </div>

                                {/* Main grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                    {/* Quick Check-in */}
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-2">
                                            <Zap size={16} className="text-teal-500" /> Quick Check-in
                                        </h3>
                                        <p className="text-xs text-gray-400 mb-5">Enter member ID, phone, or QR code</p>

                                        <form onSubmit={handleQuickCheckIn} className="mb-6">
                                            <div className="flex gap-2">
                                                <input
                                                    value={checkInId}
                                                    onChange={e => setCheckInId(e.target.value)}
                                                    placeholder="Member ID / Phone..."
                                                    className="flex-1 bg-gray-50 border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-300"
                                                />
                                                <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-4 transition-all shadow-md shadow-teal-500/20">
                                                    <ArrowRight size={18} />
                                                </button>
                                            </div>
                                        </form>

                                        <div className="space-y-2.5">
                                            {[
                                                { icon: QrCode, label: 'QR Kiosk', href: '/kiosk', color: 'text-teal-600', bg: 'bg-teal-50' },
                                                { icon: PlusCircle, label: 'Register New Member', href: '/admin', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                                { icon: CreditCard, label: 'Plan Renewals', href: '/admin', color: 'text-blue-600', bg: 'bg-blue-50' },
                                                { icon: BarChart3, label: 'Analytics', href: '/analytics', color: 'text-purple-600', bg: 'bg-purple-50' },
                                            ].map(action => {
                                                const Icon = action.icon;
                                                return (
                                                    <Link key={action.label} to={action.href}
                                                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group">
                                                        <span className={`w-8 h-8 rounded-lg ${action.bg} ${action.color} flex items-center justify-center flex-shrink-0`}><Icon size={15} /></span>
                                                        <span className="text-xs font-bold text-gray-700 flex-1">{action.label}</span>
                                                        <ChevronRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Live Personnel Feed */}
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                                                <Clock size={15} className="text-teal-500" /> Live Personnel
                                            </h3>
                                            <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
                                            </span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                                            {members.slice(0, 8).map(m => (
                                                <div key={m._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => handleViewMember(m)}>
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                                                        {m.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold text-gray-900 truncate">{m.username}</p>
                                                        <p className="text-xs text-gray-400 truncate">{m.email}</p>
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                                        {m.status || 'active'}
                                                    </span>
                                                </div>
                                            ))}
                                            {members.length === 0 && (
                                                <div className="py-12 text-center text-gray-300">
                                                    <Users size={48} className="mx-auto mb-3 opacity-30" />
                                                    <p className="text-sm font-semibold">No members found</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Alerts Panel */}
                                    <div className="space-y-4">
                                        {/* At Risk */}
                                        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5">
                                            <h3 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <ShieldAlert size={14} /> At-Risk Members ({atRisk.length})
                                            </h3>
                                            {atRisk.length === 0 ? (
                                                <p className="text-gray-300 text-xs font-semibold py-4 text-center">No at-risk members detected</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {atRisk.map(m => (
                                                        <div key={m._id} className="p-3 bg-orange-50/50 rounded-xl border border-orange-100/50">
                                                            <p className="text-xs font-black text-gray-900 mb-1">{m.name}</p>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] text-orange-600 font-bold">{m.daysSinceVisit > 30 ? 'Inactive 30d+' : `${m.daysSinceVisit}d offline`}</span>
                                                                <span className="text-[10px] font-black text-orange-500 bg-white px-2 py-0.5 rounded-lg border border-orange-100">{m.riskScore}/10</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Expiring Plans */}
                                        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
                                            <h3 className="text-xs font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <AlertCircle size={14} /> Expiring Plans ({expiring.length})
                                            </h3>
                                            {expiring.length === 0 ? (
                                                <p className="text-gray-300 text-xs font-semibold py-4 text-center italic">All plans active ✓</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {expiring.map(m => (
                                                        <div key={m._id} className="p-3 bg-red-50/50 rounded-xl border border-red-100/50">
                                                            <p className="text-xs font-black text-gray-900 truncate mb-1">{m.username}</p>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] text-red-600 font-bold">Expires</span>
                                                                <span className="text-[10px] font-black text-red-600">{m.membershipExpiry ? new Date(m.membershipExpiry).toLocaleDateString('en-IN') : '—'}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Keyboard shortcuts */}
                                        <div className="bg-gray-900 rounded-2xl p-5">
                                            <h3 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-3">Quick Shortcuts</h3>
                                            <div className="space-y-2">
                                                {[['Ctrl+K', 'Universal Search'], ['Ctrl+I', 'Quick Check-in'], ['Ctrl+N', 'New Member']].map(([k, l]) => (
                                                    <div key={k} className="flex justify-between items-center">
                                                        <span className="text-[10px] font-bold text-gray-400">{l}</span>
                                                        <kbd className="bg-gray-800 border border-gray-700 text-white px-2 py-0.5 rounded text-[10px] font-mono">{k}</kbd>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ══ MEMBERS & ATTENDANCE ══════════════════════════ */}
                        {activeTab === 'personnel' && (
                            <motion.div key="personnel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900">Members & Attendance</h2>
                                        <p className="text-sm text-gray-500 font-medium mt-1">View member details, check-in history, and attendance records.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-teal-400 transition-all w-full sm:w-72">
                                            <Search size={15} className="text-gray-400 flex-shrink-0" />
                                            <input type="text" placeholder="Search members..." className="outline-none text-sm w-full bg-transparent" value={searchMembers} onChange={e => setSearchMembers(e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                {/* Stats bar */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Total', value: members.length, color: 'text-gray-900', bg: 'bg-gray-100' },
                                        { label: 'Active', value: members.filter(m => m.status === 'active').length, color: 'text-emerald-700', bg: 'bg-emerald-100' },
                                        { label: 'Inactive', value: members.filter(m => m.status !== 'active').length, color: 'text-red-600', bg: 'bg-red-100' },
                                        { label: 'Live Today', value: attendance.length, color: 'text-teal-700', bg: 'bg-teal-100' },
                                    ].map(s => (
                                        <div key={s.label} className={`${s.bg} rounded-2xl p-4 flex items-center gap-3`}>
                                            <div>
                                                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                                                <p className={`text-xs font-bold ${s.color} opacity-70`}>{s.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Members Table */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Member</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Membership</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Expiry</th>
                                                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filteredMembers.map(m => {
                                                    const isExpired = m.membershipExpiry && new Date(m.membershipExpiry) < new Date();
                                                    const isExpiringSoon = m.membershipExpiry && !isExpired && (new Date(m.membershipExpiry) - new Date()) < 7 * 24 * 60 * 60 * 1000;
                                                    return (
                                                        <tr key={m._id} className="hover:bg-teal-50/30 transition-colors group">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                                                                        {m.username?.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-gray-900">{m.username}</p>
                                                                        <p className="text-xs text-gray-400 font-mono">{m.memberId ? `#${m.memberId}` : `#${m._id?.slice(-6).toUpperCase()}`}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <div className="flex items-center gap-1 text-xs text-gray-600"><Mail size={11} className="text-gray-300" /> {m.email}</div>
                                                                    <div className="flex items-center gap-1 text-xs text-gray-400"><Phone size={11} className="text-gray-300" /> {m.phoneNumber || '—'}</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="px-2.5 py-1 bg-teal-100 text-teal-700 rounded-lg text-xs font-bold uppercase">
                                                                    {m.membershipType || 'Standard'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-1.5">
                                                                    <div className={`w-2 h-2 rounded-full ${m.status === 'active' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                                                                    <span className={`text-xs font-bold capitalize ${m.status === 'active' ? 'text-emerald-700' : 'text-red-600'}`}>{m.status || 'active'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {m.membershipExpiry ? (
                                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isExpired ? 'bg-red-100 text-red-600' : isExpiringSoon ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-700'}`}>
                                                                        {new Date(m.membershipExpiry).toLocaleDateString('en-IN')}
                                                                    </span>
                                                                ) : <span className="text-gray-300 text-xs">—</span>}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <button onClick={() => handleViewMember(m)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all" title="View Details">
                                                                        <Eye size={15} />
                                                                    </button>
                                                                    <button onClick={async () => {
                                                                        try {
                                                                            const res = await api.post('/attendance/check-in', { memberId: m._id });
                                                                            toast.success(res.data.message || 'Checked in!');
                                                                            fetchData();
                                                                        } catch (e) { toast.error(e.response?.data?.message || 'Check-in failed'); }
                                                                    }} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Quick Check-in">
                                                                        <UserCheck size={15} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {filteredMembers.length === 0 && (
                                                    <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-medium">No members found.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ══ STORE & ORDERS ════════════════════════════════ */}
                        {activeTab === 'store' && (
                            <motion.div key="store" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900">Store & Orders</h2>
                                        <p className="text-sm text-gray-500 font-medium mt-1">Monitor product inventory and manage customer orders from the front desk.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-teal-400 transition-all w-full sm:w-64">
                                            <Search size={15} className="text-gray-400 flex-shrink-0" />
                                            <input type="text" placeholder="Search products..." className="outline-none text-sm w-full bg-transparent" value={searchProducts} onChange={e => setSearchProducts(e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                {/* Inventory summary */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Total Products', value: products.length, color: 'text-gray-900', bg: 'bg-white border border-gray-100', icon: Package, iconColor: 'text-gray-500 bg-gray-100' },
                                        { label: 'In Stock', value: products.filter(p => p.stock > 10).length, color: 'text-emerald-700', bg: 'bg-white border border-emerald-100', icon: CheckCircle, iconColor: 'text-emerald-600 bg-emerald-50' },
                                        { label: 'Low Stock', value: products.filter(p => p.stock > 0 && p.stock <= 10).length, color: 'text-orange-700', bg: 'bg-white border border-orange-100', icon: AlertCircle, iconColor: 'text-orange-600 bg-orange-50' },
                                        { label: 'Out of Stock', value: products.filter(p => p.stock <= 0).length, color: 'text-red-700', bg: 'bg-white border border-red-100', icon: X, iconColor: 'text-red-600 bg-red-50' },
                                    ].map(s => {
                                        const Icon = s.icon;
                                        return (
                                            <div key={s.label} className={`${s.bg} rounded-2xl p-4 shadow-sm flex items-center gap-3`}>
                                                <div className={`w-10 h-10 rounded-xl ${s.iconColor} flex items-center justify-center flex-shrink-0`}>
                                                    <Icon size={18} />
                                                </div>
                                                <div>
                                                    <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                                                    <p className="text-xs text-gray-400 font-semibold">{s.label}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Product grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {filteredProducts.map((p, i) => (
                                        <motion.div
                                            key={p._id}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all p-5 flex flex-col"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                                                    <Package size={22} />
                                                </div>
                                                {p.stock <= 0 ? (
                                                    <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Out</span>
                                                ) : p.stock <= 10 ? (
                                                    <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Low</span>
                                                ) : (
                                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">✓ Stocked</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-gray-900 text-sm mb-1">{p.name}</h4>
                                                <p className="text-xs text-gray-400 mb-3">{p.category || 'General'}</p>
                                                {p.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.description}</p>}
                                            </div>
                                            <div className="border-t border-gray-100 pt-3 mt-1 flex items-center justify-between">
                                                <span className="text-lg font-black text-gray-900">₹{p.price}</span>
                                                <span className="text-xs font-bold text-gray-400">{p.stock} in stock</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <div className="col-span-full py-16 text-center">
                                            <Package size={48} className="text-gray-200 mx-auto mb-4" />
                                            <p className="text-gray-400 font-semibold">No products found</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* ── Member Detail Modal ─────────────────────────────────────── */}
            <AnimatePresence>
                {selectedMember && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center font-black text-xl">
                                            {selectedMember.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white">{selectedMember.username}</h3>
                                            <p className="text-teal-200 text-sm font-medium">{selectedMember.email}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedMember(null)} className="p-2 text-white/70 hover:text-white bg-white/10 rounded-xl">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Member Info */}
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Member ID', value: selectedMember.memberId || selectedMember._id?.slice(-6).toUpperCase() },
                                        { label: 'Phone', value: selectedMember.phoneNumber || '—' },
                                        { label: 'Status', value: selectedMember.status || 'Active' },
                                        { label: 'Plan', value: selectedMember.membershipType || 'Standard' },
                                        { label: 'Joined', value: selectedMember.createdAt ? new Date(selectedMember.createdAt).toLocaleDateString('en-IN') : '—' },
                                        { label: 'Expires', value: selectedMember.membershipExpiry ? new Date(selectedMember.membershipExpiry).toLocaleDateString('en-IN') : '—' },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                                            <p className="text-sm font-bold text-gray-900">{value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Attendance History */}
                                <div>
                                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Recent Attendance</h4>
                                    {memberAttendance.length === 0 ? (
                                        <p className="text-center text-gray-300 text-xs py-4">No attendance records found</p>
                                    ) : (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {memberAttendance.map((a, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-teal-500 rounded-full" />
                                                        <span className="font-semibold text-gray-700">{new Date(a.checkIn).toLocaleDateString('en-IN')}</span>
                                                    </div>
                                                    <div className="flex gap-4 text-gray-400 font-medium">
                                                        <span>In: {new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        {a.checkOut && <span>Out: {new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2 border-t border-gray-100">
                                    <button onClick={async () => {
                                        try {
                                            const res = await api.post('/attendance/check-in', { memberId: selectedMember._id });
                                            toast.success(res.data.message || 'Checked in!');
                                            setSelectedMember(null);
                                            fetchData();
                                        } catch (e) { toast.error(e.response?.data?.message || 'Check-in failed'); }
                                    }} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-bold hover:bg-teal-600 transition-all">
                                        <UserCheck size={16} /> Check In
                                    </button>
                                    <button onClick={() => setSelectedMember(null)} className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
