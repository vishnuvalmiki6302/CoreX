import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import { User, Users, ChevronRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';

const dummyClasses = [
    { _id: '1', name: 'Alpha HIIT', description: 'High-intensity interval training for maximum metabolic burn and cardiovascular endurance.', trainer: { username: 'Marcus Steel' }, enrolledUsers: [1, 2], capacity: 12, startTime: new Date(Date.now() + 3600000).toISOString(), difficulty: 'Elite' },
    { _id: '2', name: 'Zen Yoga', description: 'Focus on mobility, breathing, and mental clarity through traditional Vinyasa flows.', trainer: { username: 'Sarah Chen' }, enrolledUsers: [1, 2, 3, 4, 5], capacity: 15, startTime: new Date(Date.now() + 7200000).toISOString(), difficulty: 'Beginner' },
    { _id: '3', name: 'Power Strength', description: 'Fundamental compound movements focused on building raw strength and muscle density.', trainer: { username: 'Alex Rivera' }, enrolledUsers: [1, 2, 3], capacity: 8, startTime: new Date(Date.now() + 10800000).toISOString(), difficulty: 'Pro' },
    { _id: '4', name: 'Combat Boxing', description: 'Technical boxing drills combined with high-intensity conditioning for total body power.', trainer: { username: 'Jack Hammer' }, enrolledUsers: [1, 2, 3, 4, 5, 6, 7, 8], capacity: 10, startTime: new Date(Date.now() + 86400000).toISOString(), difficulty: 'Elite' },
    { _id: '5', name: 'Core Protocol', description: 'Targeted midsection engineering focused on stability, posture, and deep abdominal strength.', trainer: { username: 'Elena Vance' }, enrolledUsers: [1, 2], capacity: 20, startTime: new Date(Date.now() + 90000000).toISOString(), difficulty: 'Standard' },
    { _id: '6', name: 'Spin Velocity', description: 'High-cadence cycling sessions designed to push your threshold and VO2 max limits.', trainer: { username: 'Ryan Swift' }, enrolledUsers: [1, 2, 3, 4, 5], capacity: 12, startTime: new Date(Date.now() + 93600000).toISOString(), difficulty: 'Advanced' }
];

const difficultyColors = {
    'Elite':    { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' },
    'Pro':      { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
    'Advanced': { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
    'Standard': { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    'Beginner': { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
};

const classImages = {
    'Yoga': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2040&auto=format&fit=crop',
    'HIIT': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop',
    'Strength': 'https://images.unsplash.com/photo-1581009146145-b5ef03a94e77?q=80&w=2070&auto=format&fit=crop',
    'Boxing': 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=2040&auto=format&fit=crop',
    'Spin': 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?q=80&w=2062&auto=format&fit=crop',
    'Core': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop',
};

const Classes = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchClasses(); }, []);

    const fetchClasses = async () => {
        const startTime = Date.now();
        try {
            const { data } = await api.get('/classes');
            setClasses([...(data || []), ...dummyClasses]);
        } catch { setClasses(dummyClasses); }
        finally {
            const remaining = Math.max(0, 1000 - (Date.now() - startTime));
            setTimeout(() => setLoading(false), remaining);
        }
    };

    const handleBook = async (classId) => {
        if (!user) { toast.error("Please login to book a session."); return; }
        toast.success("Successfully enrolled in session!");
        setClasses(classes.map(c =>
            c._id === classId ? { ...c, enrolledUsers: [...(c.enrolledUsers || []), user._id] } : c
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-28">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 border"
                            style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
                            <Zap size={12} className="text-orange-500" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-orange-600">Operational Schedule</span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none uppercase italic">
                            Training <span className="orange-text-gradient">Protocols</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                            {classes.length} sessions available
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="h-[360px] rounded-2xl skeleton" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.map((session, index) => {
                            const isBooked = user && session.enrolledUsers.includes(user._id);
                            const isFull = session.enrolledUsers.length >= session.capacity;
                            const date = new Date(session.startTime);
                            const bgImage = classImages[Object.keys(classImages).find(k => session.name.includes(k))] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop';
                            const diff = difficultyColors[session.difficulty] || difficultyColors['Standard'];
                            const fillPct = Math.round((session.enrolledUsers.length / session.capacity) * 100);

                            return (
                                <motion.div
                                    key={session._id}
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.06 }}
                                    className="group relative h-[380px] overflow-hidden rounded-2xl border border-gray-200 bg-white hover:border-orange-200 hover:shadow-2xl transition-all duration-400 cursor-pointer"
                                    style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
                                >
                                    {/* Background Image */}
                                    <img src={bgImage} alt={session.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0"
                                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.1) 100%)' }} />

                                    {/* Difficulty Badge */}
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                                            style={{ background: diff.bg, color: diff.text, border: `1px solid ${diff.border}` }}>
                                            {session.difficulty || 'Standard'}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="absolute inset-x-5 bottom-5 flex flex-col">
                                        <div className="flex items-end justify-between mb-4">
                                            <div className="text-center px-3 py-2 rounded-xl bg-orange-500">
                                                <div className="text-[9px] font-black uppercase text-white/75 mb-0.5">
                                                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                                </div>
                                                <div className="text-base font-black text-white leading-none">{date.getDate()}</div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-0.5">Start Time</p>
                                                <p className="text-xl font-black text-white leading-none tracking-tighter italic">
                                                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none mb-2">
                                            {session.name}
                                        </h3>
                                        <p className="text-[11px] text-gray-300 mb-4 line-clamp-2">{session.description}</p>

                                        <div className="flex items-center gap-5 mb-4">
                                            <div className="flex items-center gap-1.5">
                                                <User size={11} className="text-orange-400" />
                                                <span className="text-[10px] font-black uppercase text-white tracking-wide">{session.trainer?.username || 'TBA'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users size={11} className="text-orange-400" />
                                                <span className="text-[10px] font-black uppercase text-white tracking-wide">{session.enrolledUsers.length}/{session.capacity}</span>
                                            </div>
                                        </div>

                                        {/* Capacity bar */}
                                        <div className="mb-4">
                                            <div className="h-1 rounded-full bg-white/20">
                                                <div className="h-full rounded-full transition-all"
                                                    style={{ width: `${fillPct}%`, background: fillPct >= 80 ? '#ef4444' : '#f97316' }} />
                                            </div>
                                        </div>

                                        <button
                                            disabled={isBooked || isFull}
                                            onClick={() => handleBook(session._id)}
                                            className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                            style={isBooked ? {
                                                background: 'rgba(22,163,74,0.2)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)'
                                            } : isFull ? {
                                                background: 'rgba(255,255,255,0.1)', color: '#9ca3af', cursor: 'not-allowed', border: '1px solid rgba(255,255,255,0.1)'
                                            } : {
                                                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                                color: 'white',
                                                boxShadow: '0 4px 20px rgba(249,115,22,0.4)'
                                            }}
                                        >
                                            {isBooked ? '✓ Enrolled' : isFull ? 'Class Full' : <>Book Session <ChevronRight size={13} /></>}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Classes;
