import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { Dumbbell, Zap, Target, Info, Play, Calendar, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const Exercises = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [planProgram, setPlanProgram] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [activeProgramDay, setActiveProgramDay] = useState('Monday');
    const [selectedExercise, setSelectedExercise] = useState(null);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        const loadData = async () => {
            const startTime = Date.now();
            try {
                const { data } = await api.get('/users/profile');
                setProfileData(data);
                if (data.membershipType && data.membershipType !== 'custom') {
                    const progRes = await api.get(`/plan-programs/${data.membershipType}`);
                    setPlanProgram(progRes.data);
                }
            } catch (error) { console.error(error); }
            finally {
                const remaining = Math.max(0, 1000 - (Date.now() - startTime));
                setTimeout(() => setLoading(false), remaining);
            }
        };
        loadData();
    }, [user, navigate]);

    if (loading) return <LoadingScreen message="Loading your training plan..." />;

    if (!profileData?.membershipType || profileData.membershipType === 'custom') {
        return (
            <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-6 flex items-center justify-center">
                <div className="max-w-md w-full text-center bg-white rounded-2xl p-12 border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Dumbbell size={28} className="text-orange-500" />
                    </div>
                    <h1 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight">No Active Training Plan</h1>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">Your account hasn't been assigned a training regimen yet. Please visit the front desk to activate your plan.</p>
                    <button onClick={() => navigate('/classes')} className="btn-primary w-full py-3.5 rounded-xl text-[11px] tracking-widest">Browse Classes</button>
                </div>
            </div>
        );
    }

    const dayData = planProgram?.weeklySchedule?.find(d => d.day === activeProgramDay);
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <div className="min-h-screen bg-gray-200 pt-28 pb-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Zap size={13} className="text-orange-500" />
                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em]">{profileData.membershipType} Program</span>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Training Schedule</h1>
                        <p className="text-gray-500 text-sm mt-1">Personalized routine for {user?.name?.split(' ')[0] || 'Athlete'}.</p>
                    </div>
                    <div className="flex gap-3">
                        {[{ label: 'Duration', value: '~75 Min' }, { label: 'Intensity', value: 'Advanced' }].map((s, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                                <p className="text-sm font-black text-gray-900">{s.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Day Tabs */}
                <div className="flex gap-1.5 mb-8 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto no-scrollbar">
                    {DAYS.map(day => (
                        <button key={day} onClick={() => setActiveProgramDay(day)}
                            className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeProgramDay === day ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}>
                            {day}
                        </button>
                    ))}
                </div>

                {/* Exercise Grid */}
                <AnimatePresence mode="wait">
                    <motion.div key={activeProgramDay} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">{activeProgramDay} Protocol</h2>
                            <span className="badge-orange">{dayData?.focus || 'Core Session'}</span>
                        </div>

                        {dayData?.isRestDay ? (
                            <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
                                <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Zap size={28} className="text-blue-500" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-2 uppercase">Rest & Recovery Day</h3>
                                <p className="text-gray-500 text-sm max-w-xs mx-auto">Focus on mobility and hydration. Your muscles need this time to rebuild and grow stronger.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {dayData?.exercises?.map((ex, i) => (
                                    <div key={i} className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-orange-200 hover:shadow-xl transition-all duration-300 flex flex-col">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl group-hover:bg-orange-500 group-hover:border-orange-500 transition-all">
                                                <Play size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                                            </div>
                                            <button onClick={() => setSelectedExercise(ex)} className="p-2 text-gray-300 hover:text-orange-500 transition-colors rounded-lg hover:bg-orange-50">
                                                <Info size={18} />
                                            </button>
                                        </div>
                                        <h3 className="text-base font-black text-gray-900 mb-1 leading-tight">{ex.name}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Target: {ex.target || 'Muscular Strength'}</p>
                                        <div className="mt-auto pt-5 border-t border-gray-50 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Sets & Reps</p>
                                                <p className="text-sm font-black text-gray-900">{ex.sets} × {ex.reps}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Rest</p>
                                                <p className="text-sm font-black text-gray-900">{ex.rest || '60s'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Exercise Modal */}
            <AnimatePresence>
                {selectedExercise && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedExercise(null)} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                            <div className="h-36 bg-gray-50 border-b border-gray-100 flex items-center justify-center relative">
                                <Dumbbell size={44} className="text-gray-200" />
                                <button onClick={() => setSelectedExercise(null)}
                                    className="absolute top-5 right-5 w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-200 border border-transparent transition-all">✕</button>
                            </div>
                            <div className="p-8">
                                <span className="badge-orange mb-4 inline-block">Technical Overview</span>
                                <h3 className="text-xl font-black text-gray-900 mb-6">{selectedExercise.name}</h3>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Instructions</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">{selectedExercise.notes || "Maintain controlled movement through the full range of motion for optimal muscle activation."}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 py-5 border-y border-gray-100">
                                        <div>
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Target Muscle</h4>
                                            <p className="font-black text-gray-900">{selectedExercise.muscle || 'Compound'}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">RPE</h4>
                                            <p className="font-black text-gray-900">8 / 10</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                                        <Award size={18} className="text-orange-500 flex-shrink-0" />
                                        <p className="text-xs text-orange-700 font-semibold leading-relaxed">Pro Tip: Focus on the mind-muscle connection and maintain a consistent tempo on each rep.</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedExercise(null)}
                                    className="w-full mt-8 btn-primary py-4 rounded-xl text-[11px] tracking-widest">Got it</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Exercises;
