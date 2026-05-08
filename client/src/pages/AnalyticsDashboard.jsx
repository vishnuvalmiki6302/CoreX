import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import { Users, CheckCircle2, IndianRupee, Activity, TrendingUp, PieChart as PieIcon, BarChart2, Target, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';

const KPICard = ({ label, value, icon: Icon, sub, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="premium-card p-8 group overflow-hidden relative"
    >
        <div className="absolute top-0 left-0 w-full h-1 orange-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform duration-300">
                <Icon size={28} />
            </div>
            {sub && <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-widest">{sub}</span>}
        </div>
        <div>
            <h3 className="text-4xl font-black text-gray-900 tracking-tighter mb-1">{value}</h3>
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.15em]">{label}</p>
        </div>
    </motion.div>
);

const chartTheme = {
    tooltip: {
        contentStyle: { 
            backgroundColor: '#ffffff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '16px', 
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
            padding: '12px 16px'
        },
        itemStyle: { fontSize: '12px', fontWeight: '700', color: '#0f172a' },
        labelStyle: { fontSize: '10px', fontWeight: '800', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }
    },
    grid: { stroke: '#f1f5f9', strokeDasharray: '4 4' },
    axis: { tick: { fill: '#94a3b8', fontSize: 10, fontWeight: '600' } }
};

const ORANGE_SHADES = ['#ff5e00', '#ff8235', '#ffa56a', '#ffc9a0', '#ffedd5'];

export default function AnalyticsDashboard() {
    const [stats, setStats] = useState({});
    const [revenue, setRevenue] = useState({});
    const [memberStats, setMemberStats] = useState({});
    const [trainerPerf, setTrainerPerf] = useState([]);
    const [genderRatio, setGenderRatio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('monthly');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [statsRes, revRes, memRes, trainerRes, genderRes] = await Promise.all([
                    api.get('/analytics/stats'),
                    api.get('/analytics/revenue'),
                    api.get('/analytics/membership-stats'),
                    api.get('/analytics/trainer-performance'),
                    api.get('/analytics/gender-ratio'),
                ]);
                setStats(statsRes.data);
                setRevenue(revRes.data);
                setMemberStats(memRes.data);
                setTrainerPerf(trainerRes.data.performance || []);
                setGenderRatio(genderRes.data.ratio || []);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchAll();
    }, []);

    const revenueData = (range === 'monthly' ? revenue.monthly : revenue.daily) || [];
    const planData = (memberStats.planDistribution || []).map(p => ({ name: p._id || 'None', value: p.count }));
    const growthData = (memberStats.memberGrowth || []).map(g => ({ month: g._id, members: g.newMembers }));
    const genderData = genderRatio.map(g => ({ name: g._id || 'Unknown', value: g.count }));

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Compiling Analytics</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pt-28 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <Logo className="mb-6" />
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-3">Intelligence Hub</h1>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Business Insights & Operational Metrics</p>
                    </div>
                    <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
                        {['monthly', 'daily'].map(r => (
                            <button 
                                key={r} 
                                onClick={() => setRange(r)}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    range === r ? 'bg-orange-gradient text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {r} view
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <KPICard label="Total Network" value={stats.totalMembers || 0} icon={Users} delay={0.1} />
                    <KPICard label="Active Units" value={stats.activeMembers || 0} icon={CheckCircle2} sub={`${stats.expiredMembers || 0} Off-grid`} delay={0.2} />
                    <KPICard label="Gross Capital" value={`₹${((revenue.totalRevenue || 0)/1000).toFixed(1)}K`} icon={IndianRupee} sub={`₹${((revenue.currentMonthRevenue || 0)/1000).toFixed(1)}K / Mo`} delay={0.3} />
                    <KPICard label="Live Occupancy" value={stats.activeCheckIns || 0} icon={Activity} sub="Check-ins Today" delay={0.4} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2 premium-card p-8">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-base font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
                                <TrendingUp className="text-orange-500" size={20} /> Revenue Dynamics
                            </h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer>
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="orangeFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff5e00" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#ff5e00" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid {...chartTheme.grid} />
                                    <XAxis dataKey="_id" {...chartTheme.axis} />
                                    <YAxis {...chartTheme.axis} />
                                    <Tooltip {...chartTheme.tooltip} />
                                    <Area type="monotone" dataKey="revenue" stroke="#ff5e00" fillOpacity={1} fill="url(#orangeFill)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="premium-card p-8">
                        <h3 className="text-base font-black text-gray-900 uppercase tracking-widest flex items-center gap-3 mb-10">
                            <PieIcon className="text-orange-500" size={20} /> Tier Analysis
                        </h3>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={planData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={8}>
                                        {planData.map((_, i) => <Cell key={i} fill={ORANGE_SHADES[i % ORANGE_SHADES.length]} />)}
                                    </Pie>
                                    <Tooltip {...chartTheme.tooltip} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-8 space-y-3">
                            {planData.map((p, i) => (
                                <div key={p.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: ORANGE_SHADES[i % ORANGE_SHADES.length] }} />
                                        <span className="text-xs font-bold text-gray-500">{p.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-gray-900">{p.value} Units</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    <div className="premium-card p-8">
                        <h3 className="text-base font-black text-gray-900 uppercase tracking-widest flex items-center gap-3 mb-8">
                            <Target className="text-orange-500" size={20} /> Expansion Velocity
                        </h3>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer>
                                <LineChart data={growthData}>
                                    <CartesianGrid {...chartTheme.grid} />
                                    <XAxis dataKey="month" {...chartTheme.axis} />
                                    <YAxis {...chartTheme.axis} />
                                    <Tooltip {...chartTheme.tooltip} />
                                    <Line type="stepAfter" dataKey="members" stroke="#ff5e00" strokeWidth={4} dot={{ fill: '#ff5e00', r: 4, strokeWidth: 2, stroke: '#fff' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="premium-card p-8">
                        <h3 className="text-base font-black text-gray-900 uppercase tracking-widest flex items-center gap-3 mb-8">
                            <ShieldAlert className="text-orange-500" size={20} /> Health Status
                        </h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Active Personnel', value: memberStats.active || 0, color: 'bg-orange-500' },
                                { label: 'Expired Lifecycle', value: memberStats.expired || 0, color: 'bg-gray-300' },
                                { label: 'Awaiting Validation', value: memberStats.pending || 0, color: 'bg-orange-300' },
                                { label: 'Decommissioned', value: memberStats.inactive || 0, color: 'bg-gray-200' },
                            ].map(item => (
                                <div key={item.label}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{item.label}</span>
                                        <span className="text-sm font-black text-gray-900">{item.value}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${memberStats.total > 0 ? (item.value / memberStats.total) * 100 : 0}%` }}
                                            className={`h-full ${item.color}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="premium-card p-8">
                        <h3 className="text-base font-black text-gray-900 uppercase tracking-widest flex items-center gap-3 mb-8">
                            <PieIcon className="text-orange-500" size={20} /> Demographics
                        </h3>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={genderData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${(percent*100).toFixed(0)}%`}>
                                        {genderData.map((_, i) => <Cell key={i} fill={ORANGE_SHADES[i % ORANGE_SHADES.length]} />)}
                                    </Pie>
                                    <Tooltip {...chartTheme.tooltip} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            {genderData.map((g, i) => (
                                <div key={g.name} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ background: ORANGE_SHADES[i % ORANGE_SHADES.length] }} />
                                    <span className="text-[10px] font-black text-gray-400 uppercase">{g.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {trainerPerf.length > 0 && (
                    <div className="premium-card p-8">
                        <h3 className="text-base font-black text-gray-900 uppercase tracking-widest flex items-center gap-3 mb-10">
                            <BarChart2 className="text-orange-500" size={20} /> Mentor Performance
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer>
                                <BarChart data={trainerPerf} barGap={8}>
                                    <CartesianGrid {...chartTheme.grid} />
                                    <XAxis dataKey="name" {...chartTheme.axis} />
                                    <YAxis {...chartTheme.axis} />
                                    <Tooltip {...chartTheme.tooltip} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '20px' }} />
                                    <Bar dataKey="assignedMembers" name="Personnel Load" fill="#ff5e00" radius={[6,6,0,0]} />
                                    <Bar dataKey="activeMembers" name="Operational Units" fill="#ffc9a0" radius={[6,6,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
