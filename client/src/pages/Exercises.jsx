import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { Dumbbell, Clock, Zap, Target, Info, ChevronRight, Play, Activity, Flame, Calendar, Award } from 'lucide-react';
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
        if (!user) {
            navigate('/login');
            return;
        }

        const loadData = async () => {
            const minLoadingTime = 1000;
            const startTime = Date.now();
            try {
                const { data } = await api.get('/users/profile');
                setProfileData(data);
                if (data.membershipType && data.membershipType !== 'custom') {
                    const progRes = await api.get(`/plan-programs/${data.membershipType}`);
                    setPlanProgram(progRes.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
                setTimeout(() => setLoading(false), remainingTime);
            }
        };

        loadData();
    }, [user, navigate]);

    if (loading) {
        return <LoadingScreen message="Loading your training plan..." />;
    }

    if (!profileData?.membershipType || profileData.membershipType === 'custom') {
        return (
            <div className="min-h-screen bg-white pt-32 pb-12 font-sans px-6">
                <div className="max-w-xl mx-auto text-center">
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500">
                        <Dumbbell size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">No Active Training Plan</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">Your account hasn't been assigned a specific training regimen yet. Please visit the front desk to activate your membership program.</p>
                    <button onClick={() => navigate('/classes')} className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all shadow-lg">
                        Browse Classes
                    </button>
                </div>
            </div>
        );
    }

    const dayData = planProgram?.weeklySchedule?.find(d => d.day === activeProgramDay);

    return (
        <div className="min-h-screen bg-[#fcfcfd] pt-28 pb-12 font-sans px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                
                {/* ── CLEAN HEADER ── */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar size={14} className="text-orange-500" />
                            <span className="text-[11px] font-bold text-orange-500 uppercase tracking-widest">{profileData.membershipType} Program</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Training Schedule</h1>
                        <p className="text-gray-500 mt-1">Personalized workout routine for {user?.name?.split(' ')[0] || 'Athlete'}.</p>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                        <div className="flex flex-col items-center bg-white border border-gray-100 rounded-2xl p-4 min-w-[120px] shadow-sm">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Duration</span>
                            <span className="text-lg font-bold text-gray-900">~75 Min</span>
                        </div>
                        <div className="flex flex-col items-center bg-white border border-gray-100 rounded-2xl p-4 min-w-[120px] shadow-sm">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Intensity</span>
                            <span className="text-lg font-bold text-gray-900">Advanced</span>
                        </div>
                    </div>
                </div>

                {/* ── DAY SELECTOR (TABS) ── */}
                <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
                    {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day => (
                        <button 
                            key={day} 
                            onClick={() => setActiveProgramDay(day)}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                                activeProgramDay === day 
                                    ? 'bg-gray-900 text-white shadow-md' 
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                {/* ── EXERCISE LIST ── */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeProgramDay}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                {activeProgramDay} Protocol
                                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                <span className="text-xs text-orange-500 font-bold uppercase tracking-widest">{dayData?.focus || 'Core Session'}</span>
                            </h2>
                        </div>

                        {dayData?.isRestDay ? (
                            <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
                                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Zap size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Rest & Recovery Day</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">Focus on mobility and hydration. Your muscles need this time to rebuild and grow stronger.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {dayData?.exercises?.map((ex, i) => (
                                    <div 
                                        key={i}
                                        className="group bg-white border border-gray-100 rounded-3xl p-6 hover:border-orange-200 transition-all hover:shadow-xl hover:shadow-gray-200/50 flex flex-col relative"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                                                <Play size={20} />
                                            </div>
                                            <button 
                                                onClick={() => setSelectedExercise(ex)}
                                                className="p-2 text-gray-300 hover:text-orange-500 transition-colors"
                                            >
                                                <Info size={18} />
                                            </button>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{ex.name}</h3>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-6">Primary Target: {ex.target || 'Muscular Strength'}</p>
                                        
                                        <div className="mt-auto pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sets & Reps</span>
                                                <span className="text-sm font-bold text-gray-900">{ex.sets} × {ex.reps}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rest Interval</span>
                                                <span className="text-sm font-bold text-gray-900">{ex.rest || '60s'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── PROFESSIONAL EXERCISE MODAL ── */}
            <AnimatePresence>
                {selectedExercise && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedExercise(null)}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            <div className="h-40 bg-gray-50 flex items-center justify-center relative">
                                <Dumbbell size={48} className="text-gray-200" />
                                <button 
                                    onClick={() => setSelectedExercise(null)}
                                    className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-10">
                                <div className="flex gap-2 mb-4">
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-full">Technical Overview</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">{selectedExercise.name}</h3>
                                
                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Professional Instructions</h4>
                                        <p className="text-gray-600 leading-relaxed">
                                            {selectedExercise.notes || "This exercise is designed to improve compound strength and metabolic efficiency. Ensure controlled movement through the full range of motion."}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 py-6 border-y border-gray-50">
                                        <div>
                                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Target Muscle</h4>
                                            <p className="font-bold text-gray-900">Major: {selectedExercise.muscle || 'Compound'}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Training Specs</h4>
                                            <p className="font-bold text-gray-900">RPE: 8/10</p>
                                        </div>
                                    </div>

                                    <div className="bg-orange-50 p-4 rounded-2xl flex gap-3">
                                        <Award size={20} className="text-orange-500 flex-shrink-0" />
                                        <p className="text-xs text-orange-700 font-medium leading-relaxed">
                                            Pro Tip: Maintain a consistent tempo and focus on the mind-muscle connection during each repetition.
                                        </p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setSelectedExercise(null)}
                                    className="w-full mt-10 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg"
                                >
                                    Got it
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const X = ({ size, className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export default Exercises;
