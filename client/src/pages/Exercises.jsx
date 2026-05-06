import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import api from '../api/axios';

const Exercises = () => {
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
                    <h1 className="section-title">Weekly Workout Plan</h1>
                    <p className="section-subtitle">Your personalized regimen.</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
                    <Dumbbell size={32} className="mx-auto text-zinc-700 mb-3" />
                    <h3 className="text-sm font-bold text-white mb-1">No Active Plan</h3>
                    <p className="text-xs text-zinc-500">You do not have a standard membership plan. Contact an admin to configure your workouts.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="section-header flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="section-title">Weekly Workout Plan</h1>
                    <p className="section-subtitle">{profileData.membershipType.toUpperCase()} Plan — Mon to Sat</p>
                </div>
                <span className="px-3 py-1 bg-orange-500/10 text-orange-400 text-xs font-bold uppercase rounded-lg border border-orange-500/20">
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
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                            }`}>{day}
                        </button>
                    ))}
                </div>

                {(() => {
                    const dayData = planProgram?.weeklySchedule?.find(d => d.day === activeProgramDay);
                    if (!dayData) return <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500 text-sm">No data for {activeProgramDay}</div>;
                    
                    return (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
                            <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-800/20">
                                <div>
                                    <p className="text-base font-bold text-white">{activeProgramDay}</p>
                                    {dayData.focus && <p className="text-sm text-orange-400 font-medium mt-0.5">{dayData.focus}</p>}
                                </div>
                                {dayData.isRestDay && <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg font-bold">Rest Day</span>}
                            </div>
                            
                            {dayData.isRestDay ? (
                                <div className="p-12 text-center text-zinc-500">
                                    <p className="text-sm font-medium">Active recovery — light stretching recommended.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-800/50">
                                    {dayData.exercises?.map((ex, i) => (
                                        <div key={i} className="px-6 py-5 flex items-center justify-between hover:bg-zinc-800/30 transition-all">
                                            <div>
                                                <p className="text-sm font-semibold text-white">{ex.name}</p>
                                                {ex.notes && <p className="text-xs text-zinc-500 mt-1">{ex.notes}</p>}
                                            </div>
                                            <div className="flex items-center gap-4 text-right">
                                                <span className="text-xs font-bold text-white bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700">{ex.sets} sets × {ex.reps}</span>
                                                {ex.rest && <span className="text-xs text-zinc-500 font-mono bg-zinc-900 px-2 py-1 rounded">{ex.rest} rest</span>}
                                            </div>
                                        </div>
                                    ))}
                                    {(!dayData.exercises || dayData.exercises.length === 0) && (
                                        <div className="p-8 text-center text-zinc-600 text-sm">No exercises listed for this day.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default Exercises;
