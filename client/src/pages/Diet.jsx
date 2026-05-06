import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Utensils } from 'lucide-react';
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
                setLoading(false);
            }
        };

        loadData();
    }, [user, navigate]);

    if (loading) {
        return (
            <div className="page-container flex justify-center items-center min-h-[60vh]">
                <div className="spinner" />
            </div>
        );
    }

    if (!profileData?.membershipType || profileData.membershipType === 'custom') {
        return (
            <div className="page-container">
                <div className="section-header">
                    <h1 className="section-title">Weekly Nutrition Plan</h1>
                    <p className="section-subtitle">Your personalized regimen.</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
                    <Utensils size={32} className="mx-auto text-zinc-700 mb-3" />
                    <h3 className="text-sm font-bold text-white mb-1">No Active Plan</h3>
                    <p className="text-xs text-zinc-500">You do not have a standard membership plan. Contact an admin to configure your diet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="section-header flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="section-title">Weekly Nutrition Plan</h1>
                    <p className="section-subtitle">{profileData.membershipType.toUpperCase()} Plan — Mon to Sat</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase rounded-lg border border-emerald-500/20">
                    {profileData.membershipType}
                </span>
            </div>

            <div className="space-y-4">
                {/* Day selector */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day => (
                        <button key={day} onClick={() => setActiveProgramDay(day)}
                            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                activeProgramDay === day
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                            }`}>{day}
                        </button>
                    ))}
                </div>

                {(() => {
                    const dayData = planProgram?.weeklySchedule?.find(d => d.day === activeProgramDay);
                    if (!dayData) return <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500 text-sm">No data for {activeProgramDay}</div>;
                    
                    return (
                        <div className="space-y-4">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
                                <span className="text-sm font-bold text-white">{activeProgramDay} Nutrition</span>
                                {dayData.totalCalories && <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-bold">{dayData.totalCalories} kcal Total</span>}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {dayData.meals?.map((meal, i) => (
                                    <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
                                        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-800/20">
                                            <h4 className="text-sm font-bold text-white uppercase">{meal.type}</h4>
                                            {meal.time && <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-1 rounded">{meal.time}</span>}
                                        </div>
                                        <div className="p-5 space-y-3">
                                            {meal.items?.map((item, j) => (
                                                <div key={j} className="flex items-center justify-between border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                                                    <span className="text-sm text-zinc-200">{item.name}</span>
                                                    <div className="flex gap-3 text-xs text-right">
                                                        <span className="text-zinc-500 w-16">{item.portion}</span>
                                                        {item.calories && <span className="text-emerald-400 font-bold w-12">{item.calories} cal</span>}
                                                    </div>
                                                </div>
                                            ))}
                                            {(!meal.items || meal.items.length === 0) && (
                                                <p className="text-xs text-zinc-600 text-center py-2">No items listed</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {(!dayData.meals || dayData.meals.length === 0) && (
                                    <div className="col-span-full p-8 text-center text-zinc-600 text-sm border border-dashed border-zinc-800 rounded-xl">
                                        No meals specified for this day.
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default Diet;
