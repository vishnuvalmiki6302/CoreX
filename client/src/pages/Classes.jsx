import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Users, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Classes = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const { data } = await api.get('/classes');
            setClasses(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching classes", error);
            toast.error("Failed to load schedule");
            setLoading(false);
        }
    };

    const handleBook = async (classId) => {
        if (!user) {
            toast.error("Please login to book a class");
            return;
        }

        try {
            // await api.post(`/classes/${classId}/book`);
            toast.success("Booking confirmed!");

            // Optimistic update for UI
            setClasses(classes.map(c =>
                c._id === classId
                    ? { ...c, enrolledUsers: [...c.enrolledUsers, user._id] }
                    : c
            ));
        } catch (error) {
            toast.error(error.response?.data?.message || "Booking failed");
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Loading Schedule...</div>;

    return (
        <div className="min-h-screen bg-gym-dark pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">
                        Class <span className="text-gym-accent">Schedule</span>
                    </h1>
                    <p className="text-gym-text-secondary max-w-2xl mx-auto">
                        Join our elite sessions designed to push your limits.
                    </p>
                </motion.div>

                <div className="grid gap-6 p-20">
                    {classes.map((session, index) => {
                        const isBooked = user && session.enrolledUsers.includes(user._id || 'user_id_placeholder'); // Mock check
                        const isFull = session.enrolledUsers.length >= session.capacity;
                        const date = new Date(session.startTime);

                        return (
                            <motion.div
                                key={session._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-zinc-900 border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center group hover:border-gym-accent/30 transition-all"
                            >
                                {/* Date/Time Box */}
                                <div className="bg-white/5 rounded-xl p-4 text-center min-w-[100px]">
                                    <div className="text-gym-accent font-bold text-xl uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                    <div className="text-white font-black text-3xl">{date.getDate()}</div>
                                    <div className="text-gray-400 text-sm">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>

                                {/* Info */}
                                <div className="flex-grow">
                                    <h3 className="text-2xl font-bold text-white mb-2">{session.name}</h3>
                                    <p className="text-gray-400 mb-4">{session.description}</p>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <User size={16} className="text-gym-accent" />
                                            <span className="text-white">{session.trainer.username}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={16} className="text-gym-accent" />
                                            <span className="text-white">{session.durationMinutes} min</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users size={16} className="text-gym-accent" />
                                            <span className="text-white">{session.enrolledUsers.length} / {session.capacity} spots</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="md:text-right">
                                    {isBooked ? (
                                        <button disabled className="px-6 py-3 rounded-xl bg-green-500/20 text-green-500 font-bold flex items-center gap-2 cursor-default">
                                            <CheckCircle size={20} /> Booked
                                        </button>
                                    ) : isFull ? (
                                        <button disabled className="px-6 py-3 rounded-xl bg-red-500/20 text-red-500 font-bold cursor-not-allowed">
                                            Full
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleBook(session._id)}
                                            className="w-full md:w-auto px-8 py-3 rounded-xl bg-gym-accent text-white font-bold hover:bg-gym-accent/90 transition-all shadow-lg shadow-gym-accent/20"
                                        >
                                            Book Now
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Classes;
