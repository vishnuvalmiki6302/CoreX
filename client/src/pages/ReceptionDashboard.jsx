import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import CommandPalette from '../components/CommandPalette';
import { 
    Users, Activity, IndianRupee, AlertCircle, Search, Zap, 
    LayoutDashboard, CheckSquare, Calendar, CreditCard, 
    ArrowRight, Clock, ShieldAlert, LogOut, Settings, Bell,
    PlusCircle, RefreshCw, MessageSquare, BarChart3, QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';

const StatCard = ({ label, value, icon: Icon, sub, trend }) => (
    <div className="premium-card p-8 group transition-all hover:scale-[1.02]">
        <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-orange-500 group-hover:bg-orange-50 transition-all duration-300">
                <Icon size={24} />
            </div>
            {trend && (
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                    {trend}
                </span>
            )}
        </div>
        <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-1">{value}</h3>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        {sub && <p className="text-[10px] font-bold text-orange-500/70 mt-2 italic">{sub}</p>}
    </div>
);

export default function ReceptionDashboard() {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({});
    const [members, setMembers] = useState([]);
    const [atRisk, setAtRisk] = useState([]);
    const [expiring, setExpiring] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPalette, setShowPalette] = useState(false);
    const [checkInId, setCheckInId] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const [statsRes, membersRes] = await Promise.all([
                api.get('/analytics/stats'),
                api.get('/users?role=member&status=active&limit=20'),
            ]);
            setStats(statsRes.data);
            setMembers(membersRes.data?.users || membersRes.data || []);

            try {
                const riskRes = await api.get('/ai/risk-detection');
                setAtRisk(riskRes.data?.members?.slice(0, 5) || []);
            } catch (_) {}

            const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            const expRes = await api.get(`/users?role=member&expiringBefore=${sevenDays.toISOString()}&limit=5`);
            setExpiring(expRes.data?.users || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setShowPalette(true); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [fetchData]);

    const handleQuickCheckIn = async (e) => {
        e.preventDefault();
        if (!checkInId.trim()) return;
        try {
            const res = await api.post('/attendance/check-in', { memberId: checkInId });
            toast.success(res.data.message || 'Check-in recorded!');
            setCheckInId('');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Check-in failed');
        }
    };

    const sidebarItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Command Center', active: true },
        { id: 'members', icon: <Users size={20} />, label: 'Personnel', href: '/admin' },
        { id: 'kiosk', icon: <QrCode size={20} />, label: 'Kiosk Protocol', href: '/kiosk' },
        { id: 'classes', icon: <Calendar size={20} />, label: 'Operations', href: '/classes' },
        { id: 'payments', icon: <CreditCard size={20} />, label: 'Revenue', href: '/admin' },
        { id: 'analytics', icon: <BarChart3 size={20} />, label: 'Analytics', href: '/analytics' },
    ];

    if (loading && !stats.totalMembers) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest italic">Synchronizing Reception Node</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 flex">
            {showPalette && <CommandPalette onClose={() => setShowPalette(false)} />}

            {/* SIDEBAR */}
            <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col sticky top-0 h-screen">
                <div className="p-8">
                    <div className="mb-10">
                        <Logo />
                    </div>

                    <nav className="space-y-1.5">
                        {sidebarItems.map(item => (
                            <a key={item.id} href={item.href || '#'}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                                    item.active 
                                    ? 'bg-orange-50 text-orange-500 shadow-sm' 
                                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                }`}>
                                <span className={item.active ? 'text-orange-500' : 'text-gray-300'}>{item.icon}</span>
                                {item.label}
                            </a>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-gray-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate">{user?.username}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{user?.role?.replace('_', ' ')}</p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
                        <LogOut size={18} /> Disconnect
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-6 lg:p-12 min-w-0">
                <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-3">Reception Node</h1>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowPalette(true)} className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-6 py-4 text-gray-400 text-sm font-bold transition-all shadow-sm hover:border-orange-200 hover:text-gray-900 group">
                            <Search size={18} className="group-hover:text-orange-500 transition-colors" /> Search Protocol <kbd className="bg-gray-50 border border-gray-200 text-gray-400 px-2 py-1 rounded-lg text-[10px] shadow-sm ml-2 font-mono">Ctrl+K</kbd>
                        </button>
                        <button className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors shadow-sm"><Bell size={20} /></button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard label="Total Network" value={stats.totalMembers || 0} icon={Users} trend="+12% weekly" />
                    <StatCard label="Live Check-ins" value={stats.activeCheckIns || 0} icon={Activity} sub="Authorized entries" />
                    <StatCard label="Capital Inflow" value={`₹${((stats.totalRevenue || 0)/1000).toFixed(1)}K`} icon={IndianRupee} />
                    <StatCard label="Risk Alerts" value={stats.expiringCount || expiring.length || 0} icon={AlertCircle} sub="Requires attention" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr_360px] gap-8 items-start">
                    
                    {/* QUICK ACTIONS & KIOSK */}
                    <div className="space-y-8">
                        <div className="premium-card p-8">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-3 italic">
                                <Zap size={16} className="text-orange-500" /> Quick Execution
                            </h3>

                            <form onSubmit={handleQuickCheckIn} className="mb-10 group">
                                <label className="text-[10px] font-black text-gray-400 block mb-3 uppercase tracking-[0.2em] ml-1">Manual Authorization</label>
                                <div className="flex gap-2">
                                    <input
                                        value={checkInId}
                                        onChange={e => setCheckInId(e.target.value)}
                                        placeholder="ID or Phone..."
                                        className="flex-1 bg-gray-50 border-none focus:ring-4 focus:ring-orange-500/5 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 outline-none transition-all placeholder:text-gray-300" />
                                    <button type="submit" className="bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 text-white border-none rounded-2xl px-6 py-4 transition-all active:scale-95"><ArrowRight size={20} /></button>
                                </div>
                            </form>

                            <div className="space-y-3">
                                {[
                                    { icon: <QrCode size={18} />, label: 'Kiosk Protocol', href: '/kiosk', color: 'text-orange-500', bg: 'bg-orange-50' },
                                    { icon: <PlusCircle size={18} />, label: 'Asset Registration', href: '/admin', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                    { icon: <RefreshCw size={18} />, label: 'Protocol Renewals', href: '/admin', color: 'text-blue-600', bg: 'bg-blue-50' },
                                    { icon: <MessageSquare size={18} />, label: 'Mass Uplink', href: '/admin', color: 'text-purple-600', bg: 'bg-purple-50' },
                                ].map(action => (
                                    <a key={action.label} href={action.href}
                                        className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 bg-white hover:bg-gray-50 hover:shadow-lg hover:border-gray-100 transition-all group">
                                        <span className={`w-10 h-10 rounded-xl ${action.bg} ${action.color} flex items-center justify-center`}>{action.icon}</span>
                                        <span className="text-xs font-black text-gray-700 uppercase tracking-widest">{action.label}</span>
                                        <ArrowRight size={14} className="ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-gray-300" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="premium-card p-8 bg-gray-900 text-white">
                            <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-4">Command Terminal</h3>
                            <div className="space-y-4">
                                {[
                                    ['Ctrl+K', 'Universal Search'],
                                    ['Ctrl+N', 'New Personnel'],
                                    ['Ctrl+I', 'Rapid Entry']
                                ].map(([key, label]) => (
                                    <div key={key} className="flex justify-between items-center opacity-60 hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
                                        <kbd className="bg-gray-800 border border-gray-700 text-white px-2 py-1 rounded-lg text-[10px] font-mono font-black">{key}</kbd>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* LIVE PERSONNEL FEED */}
                    <div className="premium-card overflow-hidden h-full flex flex-col">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                                <Clock size={16} className="text-orange-500" /> Live Personnel Activity
                            </h3>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">Sync Active</span>
                        </div>
                        
                        <div className="flex-1 overflow-auto custom-scrollbar p-2">
                            {members.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 opacity-20 grayscale">
                                    <Activity size={64} className="mb-4" />
                                    <p className="text-sm font-black uppercase tracking-[0.2em]">Zero Live Signals</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-50">
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Identifier</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">State</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50/50">
                                            {members.slice(0, 15).map(m => (
                                                <tr key={m._id} className="group hover:bg-orange-50/20 transition-all">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black text-sm border border-orange-100 group-hover:scale-110 transition-transform shadow-sm">
                                                                {m.username?.[0]?.toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="text-gray-900 font-black text-sm leading-none mb-1 group-hover:text-orange-600 transition-colors">{m.username}</div>
                                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{m.email?.split('@')[0]}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 font-mono text-[10px] font-black text-gray-300">#{m.memberId || 'N/A'}</td>
                                                    <td className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase italic tracking-widest">{m.membershipType || 'NONE'}</td>
                                                    <td className="px-6 py-5 text-right">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                                            ${m.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                            <span className={`w-1 h-1 rounded-full ${m.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                            {m.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ALERTS & INTELLIGENCE */}
                    <div className="space-y-6">
                        
                        {/* AT-RISK AI DETECTION */}
                        <div className="premium-card p-6 border-orange-100 bg-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-[100px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                            <h3 className="text-orange-600 m-0 mb-6 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                <ShieldAlert size={14} /> Intelligence: At-Risk ({atRisk.length})
                            </h3>
                            {atRisk.length === 0 ? (
                                <p className="text-gray-300 text-[10px] font-black uppercase tracking-widest py-10 text-center italic">Scanning for anomalies...</p>
                            ) : (
                                <div className="space-y-3">
                                    {atRisk.map(m => (
                                        <div key={m._id} className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50 hover:bg-orange-50 transition-all">
                                            <div className="text-gray-900 text-xs font-black uppercase tracking-widest mb-1">{m.name}</div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-bold text-orange-700/60 uppercase italic">{m.daysSinceVisit > 30 ? 'Inactive Protocol' : `${m.daysSinceVisit}d Offline`}</span>
                                                <span className="text-[10px] font-black text-orange-500 bg-white px-2 py-0.5 rounded-lg border border-orange-100 shadow-sm">{m.riskScore}/10</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* EXPIRING PROTOCOLS */}
                        <div className="premium-card p-6 border-rose-100 bg-white relative overflow-hidden group">
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-rose-500/5 rounded-tl-[100px] -mr-16 -mb-16 group-hover:scale-150 transition-transform duration-700" />
                            <h3 className="text-rose-600 m-0 mb-6 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                <AlertCircle size={14} /> Critical Expiration ({expiring.length})
                            </h3>
                            {expiring.length === 0 ? (
                                <p className="text-gray-300 text-[10px] font-black uppercase tracking-widest py-10 text-center italic">Perimeter Secure</p>
                            ) : (
                                <div className="space-y-3">
                                    {expiring.map(m => (
                                        <div key={m._id} className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100/50 hover:bg-rose-50 transition-all">
                                            <div className="text-gray-900 text-xs font-black uppercase tracking-widest mb-1 truncate">{m.username}</div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[9px] font-bold text-rose-700/60 uppercase">Protocol Termination</span>
                                                <span className="text-[10px] font-black text-rose-600 bg-white px-2 py-0.5 rounded-lg border border-rose-100 shadow-sm">{m.membershipExpiry ? new Date(m.membershipExpiry).toLocaleDateString('en-GB') : '—'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* RECENT REVENUE FEED (SUBTLE) */}
                        <div className="premium-card p-6 bg-gray-50 border-none shadow-inner">
                            <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Node Operations</h3>
                            <div className="text-[10px] font-bold text-gray-400 italic leading-relaxed">
                                Reception node fully operational. All data points synchronized with central CoreX database. Monitoring active member signals and subscription lifecycles.
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
