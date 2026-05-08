import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
    Users, Search, Phone, Activity, Plus, Dumbbell, Utensils, 
    X, Save, LayoutDashboard, LogOut, Zap, Bell, Settings,
    Target, ArrowRight, UserCheck, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';
import toast from 'react-hot-toast';

const TrainerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal States
    const [selectedClient, setSelectedClient] = useState(null);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [planType, setPlanType] = useState('workout'); // 'workout' or 'diet'

    // Workout Form State
    const [workoutForm, setWorkoutForm] = useState({
        name: '', description: '', startDate: '', endDate: '',
        schedule: [] // { day: 'Monday', exercises: [] }
    });
    // Diet Form State
    const [dietForm, setDietForm] = useState({
        name: '', description: '', startDate: '', endDate: '', totalCalories: '',
        dailyMeals: [], isCustom: true
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'male_trainer' && user.role !== 'female_trainer') {
            navigate('/');
            return;
        }
        fetchAssignedMembers();
    }, [user, navigate]);

    const fetchAssignedMembers = async () => {
        try {
            const { data } = await api.get('/users/my-clients');
            setMembers(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to load clients", error);
            setLoading(false);
        }
    };

    const handleOpenPlanModal = (client, type) => {
        setSelectedClient(client);
        setPlanType(type);
        setShowPlanModal(true);
        setWorkoutForm({ name: '', description: '', startDate: new Date().toISOString().split('T')[0], endDate: '', schedule: [] });
        setDietForm({ name: '', description: '', startDate: new Date().toISOString().split('T')[0], endDate: '', totalCalories: '', dailyMeals: [], isCustom: true });
    };

    const handleCreateWorkout = async (e) => {
        e.preventDefault();
        try {
            await api.post('/workouts', {
                memberId: selectedClient._id,
                ...workoutForm
            });
            toast.success("Workout plan assigned!");
            setShowPlanModal(false);
        } catch (error) {
            toast.error("Failed to assign workout plan");
        }
    };

    const handleCreateDiet = async (e) => {
        e.preventDefault();
        try {
            await api.post('/diets', {
                memberId: selectedClient._id,
                ...dietForm
            });
            toast.success("Diet plan assigned!");
            setShowPlanModal(false);
        } catch (error) {
            toast.error("Failed to assign diet plan");
        }
    };

    const filteredMembers = members.filter(m =>
        m.username.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest italic">Synchronizing Tactical Node</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 flex">
            
            {/* SIDEBAR */}
            <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col sticky top-0 h-screen">
                <div className="p-8">
                    <div className="mb-10">
                        <Logo />
                    </div>

                    <nav className="space-y-1.5">
                        <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold bg-orange-50 text-orange-500 shadow-sm">
                            <LayoutDashboard size={20} /> Tactical View
                        </button>
                        <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-50">
                            <Users size={20} /> Personnel
                        </button>
                        <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-50">
                            <Calendar size={20} /> Schedule
                        </button>
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-gray-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center font-black text-orange-500">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate">Coach {user?.username}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{user?.role?.replace('_', ' ')}</p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
                        <LogOut size={18} /> Disconnect
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-6 lg:p-12 min-w-0">
                <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-3">Tactical Dashboard</h1>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">Overseeing {members.length} assigned personnel</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search personnel..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-white border border-gray-200 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-orange-500/5 transition-all shadow-sm w-64 lg:w-80"
                            />
                        </div>
                        <button className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors shadow-sm"><Settings size={20} /></button>
                        <button className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors shadow-sm"><Bell size={20} /></button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredMembers.length > 0 ? filteredMembers.map(member => (
                        <motion.div 
                            layout
                            key={member._id} 
                            className="premium-card group overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center font-black text-2xl border border-orange-100 group-hover:scale-110 transition-transform shadow-sm">
                                        {member.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1.5">{member.username}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{member.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 group-hover:bg-white transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                                            <Target size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Primary Objective</p>
                                            <p className="text-xs font-black text-gray-900 uppercase italic truncate max-w-[150px]">{member.profile?.goals?.join(', ') || 'General Fitness'}</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 group-hover:bg-white transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                                            <Phone size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Comm Uplink</p>
                                            <p className="text-xs font-black text-gray-900 uppercase italic">{member.phoneNumber || 'RED-ACTED'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleOpenPlanModal(member, 'workout')}
                                        className="bg-gray-900 hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-gray-900/10">
                                        <Dumbbell size={16} /> Protocol
                                    </button>
                                    <button
                                        onClick={() => handleOpenPlanModal(member, 'diet')}
                                        className="bg-white border border-gray-200 hover:border-orange-200 hover:text-orange-500 text-gray-400 text-[10px] font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm">
                                        <Utensils size={16} /> Nutrition
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-20 grayscale">
                            <Users size={64} className="mb-4" />
                            <p className="text-xl font-black uppercase tracking-[0.2em] text-gray-900">Zero Personnel Detected</p>
                        </div>
                    )}
                </div>

                {/* MODALS */}
                <AnimatePresence>
                    {showPlanModal && selectedClient && (
                        <div className="fixed inset-0 bg-black/10 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white border border-gray-200 rounded-[40px] p-12 max-w-lg w-full shadow-2xl"
                            >
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-3">
                                            Deploy {planType === 'workout' ? 'Tactical' : 'Nutritional'} Plan
                                        </h2>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Assigning to {selectedClient.username}</p>
                                    </div>
                                    <button onClick={() => setShowPlanModal(false)} className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={planType === 'workout' ? handleCreateWorkout : handleCreateDiet} className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Protocol Name</label>
                                        <input
                                            required
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-orange-500/5 transition-all"
                                            value={planType === 'workout' ? workoutForm.name : dietForm.name}
                                            onChange={e => planType === 'workout' ? setWorkoutForm({ ...workoutForm, name: e.target.value }) : setDietForm({ ...dietForm, name: e.target.value })}
                                            placeholder="Alpha Phase / Cutting Stack..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Activation</label>
                                            <input
                                                type="date" required
                                                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[10px] font-black text-gray-900 outline-none uppercase tracking-widest"
                                                value={planType === 'workout' ? workoutForm.startDate : dietForm.startDate}
                                                onChange={e => planType === 'workout' ? setWorkoutForm({ ...workoutForm, startDate: e.target.value }) : setDietForm({ ...dietForm, startDate: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Termination</label>
                                            <input
                                                type="date"
                                                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[10px] font-black text-gray-900 outline-none uppercase tracking-widest"
                                                value={planType === 'workout' ? workoutForm.endDate : dietForm.endDate}
                                                onChange={e => planType === 'workout' ? setWorkoutForm({ ...workoutForm, endDate: e.target.value }) : setDietForm({ ...dietForm, endDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Tactical Overview</label>
                                        <textarea
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 h-32 outline-none resize-none"
                                            value={planType === 'workout' ? workoutForm.description : dietForm.description}
                                            onChange={e => planType === 'workout' ? setWorkoutForm({ ...workoutForm, description: e.target.value }) : setDietForm({ ...dietForm, description: e.target.value })}
                                            placeholder="Detailed instructions for the operative..."
                                        />
                                    </div>

                                    {planType === 'diet' && (
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Caloric Ceiling (Target)</label>
                                            <input
                                                type="number"
                                                placeholder="2500"
                                                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 outline-none"
                                                value={dietForm.totalCalories}
                                                onChange={e => setDietForm({ ...dietForm, totalCalories: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl">
                                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest leading-relaxed">
                                            Notice: Creating this protocol will immediately uplink to the operative's device. Detailed exercise/meal matrices can be added post-deployment.
                                        </p>
                                    </div>

                                    <div className="flex gap-4 pt-6">
                                        <button type="button" onClick={() => setShowPlanModal(false)} className="flex-1 py-5 rounded-3xl font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors">Abort</button>
                                        <button type="submit" className="flex-[2] bg-orange-gradient text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-[1.01] transition-all">
                                            Confirm Deployment
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default TrainerDashboard;
