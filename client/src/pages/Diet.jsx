import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { Apple, Beef, Wheat, Droplets, Calendar, Clock, Utensils, Zap, Info } from 'lucide-react';
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

    if (loading) return <LoadingScreen message="Calculating Nutritional Intel..." />;

    if (!profileData?.membershipType || profileData.membershipType === 'custom') {
        return (
            <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-6 flex items-center justify-center">
                <div className="max-w-md w-full text-center bg-white rounded-2xl p-12 border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Apple size={28} className="text-green-500" />
                    </div>
                    <h1 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight">No Active Nutrition Plan</h1>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">Your nutritional protocol hasn't been calibrated yet. Consult with your CoreX nutritionist to activate your meal plan.</p>
                    <button onClick={() => navigate('/products')} className="btn-primary w-full py-3.5 rounded-xl text-[11px] tracking-widest">Explore Supplements</button>
                </div>
            </div>
        );
    }

    const dayData = planProgram?.weeklySchedule?.find(d => d.day === activeProgramDay);
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const macros = [
        { icon: Beef, label: 'Protein', value: '180g', color: 'bg-red-50 border-red-100 text-red-500' },
        { icon: Wheat, label: 'Carbs', value: '220g', color: 'bg-amber-50 border-amber-100 text-amber-500' },
        { icon: Droplets, label: 'Fats', value: '75g', color: 'bg-blue-50 border-blue-100 text-blue-500' },
        { icon: Zap, label: 'Calories', value: dayData?.totalCalories || '2400', color: 'bg-orange-50 border-orange-100 text-orange-500' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 pt-28 pb-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar size={13} className="text-green-500" />
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em]">{profileData.membershipType} Nutrition</span>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-tight">Nutritional Intelligence</h1>
                        <p className="text-gray-500 text-sm mt-1">Calibrated fueling strategy for {user?.name?.split(' ')[0] || 'Athlete'}.</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                        {macros.map((m, i) => (
                            <div key={i} className={`bg-white border rounded-xl p-4 shadow-sm flex flex-col items-center border-gray-200`}>
                                <div className={`w-8 h-8 rounded-lg ${m.color} border flex items-center justify-center mb-2`}>
                                    <m.icon size={15} />
                                </div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{m.label}</p>
                                <p className="text-sm font-black text-gray-900">{m.value}</p>
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

                {/* Meal Timeline */}
                <AnimatePresence mode="wait">
                    <motion.div key={activeProgramDay} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">{activeProgramDay} Protocol</h2>
                            <span className="badge-success">Fueled for Performance</span>
                        </div>

                        {!dayData?.meals || dayData.meals.length === 0 ? (
                            <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Clock size={28} className="text-gray-300" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-2 uppercase">No Meals Configured</h3>
                                <p className="text-gray-500 text-sm">Your meal plan for this day is pending calibration.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {dayData.meals.map((meal, i) => (
                                    <div key={i} className="group bg-white border border-gray-200 rounded-2xl p-7 hover:border-green-200 hover:shadow-xl transition-all duration-300">
                                        <div className="flex justify-between items-center mb-7">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-green-50 border border-green-100 text-green-600 rounded-xl group-hover:bg-green-500 group-hover:text-white group-hover:border-green-500 transition-all">
                                                    <Utensils size={18} />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{meal.type}</h3>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{meal.time || 'Schedule Varies'}</p>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">Protocol {i + 1}</span>
                                        </div>

                                        <div className="space-y-2.5">
                                            {meal.items?.map((item, j) => (
                                                <div key={j} className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl hover:border-green-100 hover:bg-green-50 transition-all">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{item.portion}</p>
                                                    </div>
                                                    <p className="text-sm font-black text-green-600">{item.calories} kcal</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-6 pt-5 border-t border-gray-50 flex items-start gap-3">
                                            <Info size={14} className="text-gray-300 mt-0.5 flex-shrink-0" />
                                            <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                                                Ensure proper hydration throughout this meal sequence for optimal absorption.
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
