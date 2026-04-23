import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, User, Users } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Classes = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchClasses(); }, []);

    const fetchClasses = async () => {
        try {
            const { data } = await api.get('/classes');
            setClasses(data);
        } catch {
            toast.error("Failed to load schedule");
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (classId) => {
        if (!user) { toast.error("Please login to book a class"); return; }
        try {
            toast.success("Booking confirmed!");
            setClasses(classes.map(c =>
                c._id === classId ? { ...c, enrolledUsers: [...c.enrolledUsers, user._id] } : c
            ));
        } catch (error) {
            toast.error(error.response?.data?.message || "Booking failed");
        }
    };

    return (
        <div className="page-container">
            <div className="section-header">
                <h1 className="section-title">Class Schedule</h1>
                <p className="section-subtitle">Book your next session.</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="spinner" />
                </div>
            ) : (
                <div className="space-y-3">
                    {classes.length === 0 ? (
                        <div className="text-center py-16 text-zinc-500 border border-white/5 rounded-xl border-dashed">
                            <Calendar size={32} className="mx-auto mb-3 opacity-50" />
                            <p>No classes scheduled yet.</p>
                        </div>
                    ) : (
                        classes.map((session) => {
                            const isBooked = user && session.enrolledUsers.includes(user._id);
                            const isFull = session.enrolledUsers.length >= session.capacity;
                            const date = new Date(session.startTime);

                            return (
                                <div key={session._id} className="clean-card p-4 flex flex-col md:flex-row gap-4 md:items-center">
                                    {/* Date Column */}
                                    <div className="bg-white/5 rounded-lg p-3 text-center min-w-[80px] flex-shrink-0">
                                        <div className="text-gym-accent font-semibold text-xs uppercase">
                                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                        </div>
                                        <div className="text-white font-bold text-2xl leading-tight">
                                            {date.getDate()}
                                        </div>
                                        <div className="text-zinc-400 text-xs mt-0.5">
                                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>

                                    {/* Info Column */}
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-base font-semibold text-white">{session.name}</h3>
                                            {session.difficulty && (
                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-300 uppercase">
                                                    {session.difficulty}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-zinc-400 mb-3 line-clamp-1">{session.description}</p>
                                        
                                        <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                                            <div className="flex items-center gap-1.5">
                                                <User size={14} className="text-zinc-400" />
                                                <span>{session.trainer?.username || 'TBA'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} className="text-zinc-400" />
                                                <span>{session.durationMinutes} min</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users size={14} className="text-zinc-400" />
                                                <span>{session.enrolledUsers.length} / {session.capacity}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Column */}
                                    <div className="flex-shrink-0">
                                        {isBooked ? (
                                            <div className="px-4 py-2 text-sm rounded-lg bg-green-500/10 text-green-400 font-medium text-center">
                                                Booked
                                            </div>
                                        ) : isFull ? (
                                            <div className="px-4 py-2 text-sm rounded-lg bg-white/5 text-zinc-500 font-medium text-center">
                                                Full
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleBook(session._id)}
                                                className="btn-primary w-full md:w-auto"
                                            >
                                                Book Class
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default Classes;
