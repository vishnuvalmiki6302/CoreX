import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import { Calendar, Clock, User, Users, ChevronRight, Zap, Target, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

const dummyClasses = [
    { _id: '1', name: 'Alpha HIIT', description: 'High-intensity interval training for maximum metabolic burn and cardiovascular endurance. Experience the elite level of conditioning.', trainer: { username: 'Marcus Steel' }, enrolledUsers: [1, 2], capacity: 12, startTime: new Date(Date.now() + 3600000).toISOString(), difficulty: 'Elite' },
    { _id: '2', name: 'Zen Yoga', description: 'Focus on mobility, breathing, and mental clarity through traditional Vinyasa flows. Perfect for recovery and mental fortitude.', trainer: { username: 'Sarah Chen' }, enrolledUsers: [1, 2, 3, 4, 5], capacity: 15, startTime: new Date(Date.now() + 7200000).toISOString(), difficulty: 'Beginner' },
    { _id: '3', name: 'Power Strength', description: 'Fundamental compound movements focused on building raw strength and muscle density. The foundation of any elite physique.', trainer: { username: 'Alex Rivera' }, enrolledUsers: [1, 2, 3], capacity: 8, startTime: new Date(Date.now() + 10800000).toISOString(), difficulty: 'Pro' },
    { _id: '4', name: 'Combat Boxing', description: 'Technical boxing drills combined with high-intensity conditioning for total body power. Learn the art of the strike.', trainer: { username: 'Jack Hammer' }, enrolledUsers: [1, 2, 3, 4, 5, 6, 7, 8], capacity: 10, startTime: new Date(Date.now() + 86400000).toISOString(), difficulty: 'Elite' },
    { _id: '5', name: 'Core Protocol', description: 'Targeted midsection engineering focused on stability, posture, and deep abdominal strength. Build an unbreakable core.', trainer: { username: 'Elena Vance' }, enrolledUsers: [1, 2], capacity: 20, startTime: new Date(Date.now() + 90000000).toISOString(), difficulty: 'Standard' },
    { _id: '6', name: 'Spin Velocity', description: 'High-cadence cycling sessions designed to push your threshold and VO2 max limits. High energy, high results.', trainer: { username: 'Ryan Swift' }, enrolledUsers: [1, 2, 3, 4, 5], capacity: 12, startTime: new Date(Date.now() + 93600000).toISOString(), difficulty: 'Advanced' }
];

const Classes = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        const minLoadingTime = 1000; // 1 second
        const startTime = Date.now();

        try {
            const { data } = await api.get('/classes');
            setClasses([...(data || []), ...dummyClasses]);
        } catch (err) {
            setClasses(dummyClasses);
        } finally {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
            setTimeout(() => setLoading(false), remainingTime);
        }
    };

    const handleBook = async (classId) => {
        if (!user) { toast.error("Deployment requires authorization. Please login."); return; }
        try {
            toast.success("Personnel enrolled in session!");
            setClasses(classes.map(c =>
                c._id === classId ? { ...c, enrolledUsers: [...(c.enrolledUsers || []), user._id] } : c
            ));
        } catch (error) {
            toast.error(error.response?.data?.message || "Protocol deployment failed");
        }
    };

    const classImages = {
        'Yoga': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2040&auto=format&fit=crop',
        'HIIT': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop',
        'Strength': 'https://images.unsplash.com/photo-1581009146145-b5ef03a94e77?q=80&w=2070&auto=format&fit=crop',
        'Boxing': 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=2040&auto=format&fit=crop',
        'Spin': 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?q=80&w=2062&auto=format&fit=crop',
        'Core': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop',
        'Dance': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=2069&auto=format&fit=crop',
        'Jumba': 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?q=80&w=2070&auto=format&fit=crop'
    };

    return (
        <div className="min-h-screen bg-white pb-20 pt-28">
            <div className="max-w-7xl mx-auto px-6">

                {/* ─── PREMIUM HEADER ─── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                    <div>
                        <Logo className="mb-4" />
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-3 italic uppercase">
                            Training <span className="text-orange-500">Protocols</span>
                        </h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-gray-200" />
                            Operational Schedule
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="relative">
                        {/* Semi-transparent Overlay with Logo */}
                        <div className="absolute inset-0 z-20 flex items-center justify-center min-h-[400px]">
                            <LoadingScreen message="Initializing CoreX..." />
                        </div>

                        {/* Skeleton Grid for background */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 blur-sm opacity-20 pointer-events-none">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-[340px] rounded-[2rem] bg-gray-100 animate-pulse" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.map((session, index) => {
                            const isBooked = user && session.enrolledUsers.includes(user._id);
                            const isFull = session.enrolledUsers.length >= session.capacity;
                            const date = new Date(session.startTime);
                            const bgImage = classImages[Object.keys(classImages).find(k => session.name.includes(k))] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop';

                            return (
                                <motion.div
                                    key={session._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative h-[340px] rounded-[2rem] overflow-hidden border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500"
                                >
                                    {/* Background Image & Overlays */}
                                    <img
                                        src={bgImage}
                                        alt={session.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-95" />

                                    {/* Status Badge */}
                                    <div className="absolute top-5 left-5 flex gap-2">
                                        <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[8px] font-black text-white uppercase tracking-widest">
                                            {session.difficulty || 'Standard'}
                                        </span>
                                    </div>

                                    {/* Content Area */}
                                    <div className="absolute inset-x-6 bottom-6 flex flex-col">
                                        <div className="flex items-end justify-between mb-4">
                                            <div className="text-white text-center bg-orange-500 py-2 px-3 rounded-xl min-w-[50px]">
                                                <div className="text-[8px] font-black uppercase leading-none mb-1 opacity-80">
                                                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                                </div>
                                                <div className="text-lg font-black leading-none">
                                                    {date.getDate()}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest mb-0.5">Start</p>
                                                <p className="text-base font-black text-white leading-none tracking-tighter italic">
                                                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none mb-2">
                                            {session.name}
                                        </h3>

                                        <p className="text-[10px] text-gray-300 font-medium leading-relaxed mb-6 line-clamp-2">
                                            {session.description}
                                        </p>

                                        <div className="flex items-center gap-6 mb-6">
                                            <div className="flex items-center gap-2">
                                                <User size={12} className="text-orange-500" />
                                                <span className="text-[9px] font-black text-white uppercase">{session.trainer?.username || 'TBA'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users size={12} className="text-orange-500" />
                                                <span className="text-[9px] font-black text-white uppercase">{session.enrolledUsers.length}/{session.capacity}</span>
                                            </div>
                                        </div>

                                        <button
                                            disabled={isBooked || isFull}
                                            onClick={() => handleBook(session._id)}
                                            className={`w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${isBooked
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                : isFull
                                                    ? 'bg-white/5 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white text-gray-900 hover:bg-orange-500 hover:text-white'
                                                }`}
                                        >
                                            {isBooked ? 'Enrolled' : isFull ? 'Full' : (
                                                <>Book Session <ChevronRight size={12} /></>
                                            )}
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
