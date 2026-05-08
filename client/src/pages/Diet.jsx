import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { Utensils, Clock, Zap, Target, Apple, Beef, Wheat, Droplets, Calendar, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const Diet = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [planProgram, setPlanProgram] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [activeProgramDay, setActiveProgramDay] = useState('Monday');

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
        return <LoadingScreen message="Calculating Nutritional Intel..." />;
    }

    if (!profileData?.membershipType || profileData.membershipType === 'custom') {
        return (
            <div className="min-h-screen bg-white pt-32 pb-12 font-sans px-6">
                <div className="max-w-xl mx-auto text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                        <Apple size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">No Active Nutrition Plan</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">Your nutritional protocol hasn't been calibrated yet. Consult with your CoreX nutritionist to activate your meal plan.</p>
                    <button onClick={() => navigate('/products')} className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-all shadow-lg">
                        Explore Supplements
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
                <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar size={14} className="text-emerald-500" />
                            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">{profileData.membershipType} Nutrition</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">Nutritional Intelligence</h1>
                        <p className="text-gray-500 mt-1">Calibrated fueling strategy for {user?.name?.split(' ')[0] || 'Athlete'}.</p>
                    </div>

                    {/* Macro Summary Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col items-center">
                            <Beef size={16} className="text-red-400 mb-2" />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Protein</span>
                            <span className="text-base font-bold text-gray-900">180g</span>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col items-center">
                            <Wheat size={16} className="text-amber-400 mb-2" />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Carbs</span>
                            <span className="text-base font-bold text-gray-900">220g</span>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col items-center">
                            <Droplets size={16} className="text-blue-400 mb-2" />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Fats</span>
                            <span className="text-base font-bold text-gray-900">75g</span>
                        </div>
                        <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm flex flex-col items-center">
                            <Zap size={16} className="text-emerald-500 mb-2" />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Cal</span>
                            <span className="text-base font-bold text-gray-900">{dayData?.totalCalories || '2400'}</span>
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

                {/* ── MEAL TIMELINE ── */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeProgramDay}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                {activeProgramDay} Protocol
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span className="text-xs text-emerald-500 font-bold uppercase tracking-widest">Fueled for Performance</span>
                            </h2>
                        </div>

                        {!dayData?.meals || dayData.meals.length === 0 ? (
                            <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Clock size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Meals Configured</h3>
                                <p className="text-gray-500">Your meal plan for this day is currently pending calibration.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {dayData.meals.map((meal, i) => (
                                    <div 
                                        key={i}
                                        className="group bg-white border border-gray-100 rounded-3xl p-8 hover:border-emerald-200 transition-all hover:shadow-xl hover:shadow-gray-200/50 relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-center mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                    <Utensils size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">{meal.type}</h3>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{meal.time || 'Schedule Varies'}</p>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 group-hover:bg-white group-hover:border-emerald-100 transition-colors">
                                                <span className="text-[10px] font-black text-gray-400 group-hover:text-emerald-500 uppercase tracking-widest">Protocol {i + 1}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {meal.items?.map((item, j) => (
                                                <div key={j} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-emerald-100 hover:bg-white transition-all">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                                        <p className="text-[11px] text-gray-500 font-medium">{item.portion}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-emerald-600">{item.calories} kcal</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Professional Nutrition Note */}
                                        <div className="mt-8 pt-6 border-t border-gray-50 flex items-start gap-3">
                                            <Info size={16} className="text-gray-300 mt-0.5" />
                                            <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                                                Ensure proper hydration throughout this meal sequence. High metabolic absorption is expected.
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Diet;
