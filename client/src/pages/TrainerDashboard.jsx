import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import {
    Users, Search, Phone, Activity, Plus, Dumbbell, Utensils,
    X, Save, LayoutDashboard, LogOut, Zap, Bell, Settings,
    Target, ArrowRight, UserCheck, Calendar, Home, ChevronDown,
    ChevronUp, Trash2, RefreshCw, Clock, Mail, Eye, Award,
    CheckCircle, FlameKindling, Apple, BarChart3, Heart, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TrainerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('members');
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Member detail
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberWorkouts, setMemberWorkouts] = useState([]);
    const [memberDiets, setMemberDiets] = useState([]);
    const [memberDetailLoading, setMemberDetailLoading] = useState(false);

    // Workout plan modal
    const [showWorkoutModal, setShowWorkoutModal] = useState(false);
    const [workoutClient, setWorkoutClient] = useState(null);
    const [workoutForm, setWorkoutForm] = useState({
        name: '', description: '', startDate: '', endDate: '',
        schedule: DAYS.map(day => ({ day, exercises: [] }))
    });
    const [expandedDay, setExpandedDay] = useState('Monday');

    // Diet plan modal
    const [showDietModal, setShowDietModal] = useState(false);
    const [dietClient, setDietClient] = useState(null);
    const [dietForm, setDietForm] = useState({
        name: '', description: '', startDate: '', endDate: '',
        totalCalories: '', protein: '', carbs: '', fats: '',
        dailyMeals: [
            { name: 'Breakfast', time: '07:00', calories: '', items: [''] },
            { name: 'Lunch', time: '13:00', calories: '', items: [''] },
            { name: 'Dinner', time: '20:00', calories: '', items: [''] },
        ],
        isCustom: true
    });

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (!['male_trainer', 'female_trainer', 'trainer'].includes(user.role)) {
            navigate('/');
            return;
        }
        fetchAssignedMembers();
    }, [user, navigate]);

    const fetchAssignedMembers = async () => {
        try {
            const { data } = await api.get('/users/my-clients');
            setMembers(data);
        } catch (error) {
            console.error('Failed to load clients', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewMember = async (member) => {
        setSelectedMember(member);
        setMemberDetailLoading(true);
        try {
            const [workoutsRes, dietsRes] = await Promise.all([
                api.get(`/workouts?memberId=${member._id}`).catch(() => ({ data: [] })),
                api.get(`/diets?memberId=${member._id}`).catch(() => ({ data: [] })),
            ]);
            setMemberWorkouts(Array.isArray(workoutsRes.data) ? workoutsRes.data : []);
            setMemberDiets(Array.isArray(dietsRes.data) ? dietsRes.data : []);
        } catch (e) { console.error(e); }
        finally { setMemberDetailLoading(false); }
    };

    // ── Exercise helpers ────────────────────────────────────────────────────
    const addExercise = (day) => {
        setWorkoutForm(prev => ({
            ...prev,
            schedule: prev.schedule.map(s =>
                s.day === day
                    ? { ...s, exercises: [...s.exercises, { name: '', sets: 3, reps: 10, weight: '', notes: '' }] }
                    : s
            )
        }));
    };

    const updateExercise = (day, idx, field, val) => {
        setWorkoutForm(prev => ({
            ...prev,
            schedule: prev.schedule.map(s =>
                s.day === day
                    ? { ...s, exercises: s.exercises.map((ex, i) => i === idx ? { ...ex, [field]: val } : ex) }
                    : s
            )
        }));
    };

    const removeExercise = (day, idx) => {
        setWorkoutForm(prev => ({
            ...prev,
            schedule: prev.schedule.map(s =>
                s.day === day
                    ? { ...s, exercises: s.exercises.filter((_, i) => i !== idx) }
                    : s
            )
        }));
    };

    // ── Meal helpers ────────────────────────────────────────────────────────
    const updateMeal = (idx, field, val) => {
        setDietForm(prev => ({
            ...prev,
            dailyMeals: prev.dailyMeals.map((m, i) => i === idx ? { ...m, [field]: val } : m)
        }));
    };

    const updateMealItem = (mealIdx, itemIdx, val) => {
        setDietForm(prev => ({
            ...prev,
            dailyMeals: prev.dailyMeals.map((m, i) =>
                i === mealIdx
                    ? { ...m, items: m.items.map((it, j) => j === itemIdx ? val : it) }
                    : m
            )
        }));
    };

    const addMealItem = (mealIdx) => {
        setDietForm(prev => ({
            ...prev,
            dailyMeals: prev.dailyMeals.map((m, i) =>
                i === mealIdx ? { ...m, items: [...m.items, ''] } : m
            )
        }));
    };

    const removeMealItem = (mealIdx, itemIdx) => {
        setDietForm(prev => ({
            ...prev,
            dailyMeals: prev.dailyMeals.map((m, i) =>
                i === mealIdx ? { ...m, items: m.items.filter((_, j) => j !== itemIdx) } : m
            )
        }));
    };

    const addMeal = () => {
        setDietForm(prev => ({
            ...prev,
            dailyMeals: [...prev.dailyMeals, { name: 'Snack', time: '16:00', calories: '', items: [''] }]
        }));
    };

    // ── Submitters ──────────────────────────────────────────────────────────
    const handleCreateWorkout = async (e) => {
        e.preventDefault();
        try {
            const cleanSchedule = workoutForm.schedule.filter(s => s.exercises.length > 0);
            await api.post('/workouts', { memberId: workoutClient._id, ...workoutForm, schedule: cleanSchedule });
            toast.success('Workout plan assigned to ' + workoutClient.username + '!');
            setShowWorkoutModal(false);
            if (selectedMember?._id === workoutClient._id) handleViewMember(workoutClient);
        } catch { toast.error('Failed to assign workout plan'); }
    };

    const handleCreateDiet = async (e) => {
        e.preventDefault();
        try {
            const cleanMeals = dietForm.dailyMeals.map(m => ({
                ...m,
                items: m.items.filter(i => i.trim())
            }));
            await api.post('/diets', { memberId: dietClient._id, ...dietForm, dailyMeals: cleanMeals });
            toast.success('Diet plan assigned to ' + dietClient.username + '!');
            setShowDietModal(false);
            if (selectedMember?._id === dietClient._id) handleViewMember(dietClient);
        } catch { toast.error('Failed to assign diet plan'); }
    };

    const openWorkoutModal = (member) => {
        setWorkoutClient(member);
        setWorkoutForm({
            name: '', description: '',
            startDate: new Date().toISOString().split('T')[0], endDate: '',
            schedule: DAYS.map(day => ({ day, exercises: [] }))
        });
        setExpandedDay('Monday');
        setShowWorkoutModal(true);
    };

    const openDietModal = (member) => {
        setDietClient(member);
        setDietForm({
            name: '', description: '',
            startDate: new Date().toISOString().split('T')[0], endDate: '',
            totalCalories: '', protein: '', carbs: '', fats: '',
            dailyMeals: [
                { name: 'Breakfast', time: '07:00', calories: '', items: [''] },
                { name: 'Lunch', time: '13:00', calories: '', items: [''] },
                { name: 'Dinner', time: '20:00', calories: '', items: [''] },
            ],
            isCustom: true
        });
        setShowDietModal(true);
    };

    const filteredMembers = members.filter(m =>
        m.username?.toLowerCase().includes(search.toLowerCase()) ||
        m.email?.toLowerCase().includes(search.toLowerCase())
    );

    const navItems = [
        { id: 'members', label: 'My Clients', icon: Users },
        { id: 'plans', label: 'Plan Center', icon: Dumbbell },
    ];

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-14 h-14 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400 text-sm font-semibold">Loading Trainer Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full overflow-hidden bg-[#F5F6FA] flex font-sans">

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside className="w-64 flex-shrink-0 bg-gray-900 text-white hidden lg:flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Dumbbell size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="font-black text-white text-sm">CoreX</p>
                            <p className="text-orange-400 text-[10px] font-bold uppercase tracking-widest">Trainer Portal</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest px-3 mb-3">Navigation</p>
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button key={item.id} onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-white/50 hover:text-white hover:bg-white/10'}`}>
                                <Icon size={18} /> {item.label}
                                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
                            </button>
                        );
                    })}

                    <div className="pt-4">
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-widest px-3 mb-3">Stats</p>
                        {[
                            { label: 'My Clients', value: members.length, color: 'text-orange-400' },
                            { label: 'Active Plans', value: members.filter(m => m.membershipExpiry && new Date(m.membershipExpiry) > new Date()).length, color: 'text-emerald-400' },
                        ].map(s => (
                            <div key={s.label} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5">
                                <span className="text-white/50 text-xs font-semibold">{s.label}</span>
                                <span className={`text-sm font-black ${s.color}`}>{s.value}</span>
                            </div>
                        ))}
                    </div>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4 px-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center font-black text-sm">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.username}</p>
                            <p className="text-[10px] text-white/40 uppercase">{user?.role?.replace('_', ' ')}</p>
                        </div>
                    </div>
                    <Link to="/" className="flex items-center gap-2 px-3 py-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl text-sm font-semibold transition-all mb-1">
                        <Home size={16} /> Back to Site
                    </Link>
                    <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-semibold transition-all">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* ── Main ───────────────────────────────────────────────────── */}
            <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shrink-0 justify-between shadow-sm">
                    <div>
                        <h1 className="text-base font-black text-gray-900">{navItems.find(n => n.id === activeTab)?.label}</h1>
                        <p className="text-xs text-gray-400 font-medium">{members.length} clients assigned</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-orange-400 transition-all">
                            <Search size={14} className="text-gray-400" />
                            <input type="text" placeholder="Search clients..." className="outline-none text-sm bg-transparent w-40" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <button onClick={fetchAssignedMembers} className="p-2.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all border border-gray-200 bg-white">
                            <RefreshCw size={16} />
                        </button>
                        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-sm">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <AnimatePresence mode="wait">

                        {/* ══ MY CLIENTS TAB ════════════════════════════════ */}
                        {activeTab === 'members' && (
                            <motion.div key="members" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-black text-gray-900">My Clients</h2>
                                    <p className="text-gray-500 text-sm font-medium mt-1">Assign workout and diet plans to each member based on their goals and fitness level.</p>
                                </div>

                                {filteredMembers.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-gray-100 py-24 flex flex-col items-center justify-center text-center shadow-sm">
                                        <Users size={56} className="text-gray-200 mb-4" />
                                        <h3 className="text-lg font-black text-gray-400 mb-2">No Clients Assigned</h3>
                                        <p className="text-sm text-gray-300">Ask your admin to assign members to you.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredMembers.map((member, i) => (
                                            <motion.div
                                                key={member._id}
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all group overflow-hidden"
                                            >
                                                <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-600" />
                                                <div className="p-6">
                                                    <div className="flex items-center gap-4 mb-5">
                                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-orange-500/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                                                            {member.username?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h3 className="font-black text-gray-900 text-base truncate">{member.username}</h3>
                                                            <p className="text-xs text-gray-400 truncate">{member.email}</p>
                                                        </div>
                                                    </div>

                                                    {/* Goals */}
                                                    <div className="mb-5 space-y-2">
                                                        <div className="flex items-center gap-2 bg-orange-50 rounded-xl px-3 py-2.5 border border-orange-100">
                                                            <Target size={14} className="text-orange-500 flex-shrink-0" />
                                                            <p className="text-xs font-bold text-gray-700 truncate">{member.profile?.goals?.join(', ') || 'No goals set'}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                                                            <Phone size={14} className="text-gray-400 flex-shrink-0" />
                                                            <p className="text-xs font-medium text-gray-500">{member.phoneNumber || 'No phone'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Membership badge */}
                                                    <div className="flex items-center justify-between mb-5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                        <span className="text-xs text-gray-400 font-semibold">Plan</span>
                                                        <span className="text-xs font-black text-gray-700 bg-white px-2 py-0.5 rounded-lg border border-gray-200">{member.membershipType || 'Standard'}</span>
                                                    </div>

                                                    {/* Action buttons */}
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <button onClick={() => handleViewMember(member)}
                                                            className="flex flex-col items-center gap-1.5 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-orange-600 transition-all">
                                                            <Eye size={16} /> View
                                                        </button>
                                                        <button onClick={() => openWorkoutModal(member)}
                                                            className="flex flex-col items-center gap-1.5 py-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-100 transition-all">
                                                            <Dumbbell size={16} /> Workout
                                                        </button>
                                                        <button onClick={() => openDietModal(member)}
                                                            className="flex flex-col items-center gap-1.5 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-100 transition-all">
                                                            <Utensils size={16} /> Diet
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ══ PLAN CENTER TAB ═══════════════════════════════ */}
                        {activeTab === 'plans' && (
                            <motion.div key="plans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-black text-gray-900">Plan Center</h2>
                                    <p className="text-gray-500 text-sm font-medium mt-1">Select a client below to view and manage their assigned workout and diet plans.</p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Client list */}
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="px-5 py-4 border-b border-gray-100">
                                            <h3 className="text-sm font-black text-gray-900">Select Client</h3>
                                        </div>
                                        <div className="divide-y divide-gray-50 overflow-y-auto max-h-[70vh]">
                                            {members.map(m => (
                                                <button key={m._id} onClick={() => handleViewMember(m)}
                                                    className={`w-full flex items-center gap-3 px-5 py-3.5 hover:bg-orange-50 transition-colors text-left ${selectedMember?._id === m._id ? 'bg-orange-50 border-r-2 border-orange-500' : ''}`}>
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                                                        {m.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-900 text-sm truncate">{m.username}</p>
                                                        <p className="text-xs text-gray-400 truncate">{m.membershipType || 'Standard'}</p>
                                                    </div>
                                                    {selectedMember?._id === m._id && <div className="ml-auto w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />}
                                                </button>
                                            ))}
                                            {members.length === 0 && (
                                                <div className="p-8 text-center text-gray-300">
                                                    <Users size={32} className="mx-auto mb-2" />
                                                    <p className="text-sm font-semibold">No clients assigned</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Plans detail */}
                                    <div className="lg:col-span-2 space-y-4">
                                        {!selectedMember ? (
                                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                                                <Award size={48} className="text-gray-200 mx-auto mb-4" />
                                                <p className="text-gray-400 font-semibold">Select a client to view their plans</p>
                                            </div>
                                        ) : memberDetailLoading ? (
                                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                                                <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
                                            </div>
                                        ) : (
                                            <>
                                                {/* Member header */}
                                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-black text-lg">
                                                            {selectedMember.username?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-black text-gray-900">{selectedMember.username}</h3>
                                                            <p className="text-xs text-gray-400">{selectedMember.email} · {selectedMember.membershipType || 'Standard'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => openWorkoutModal(selectedMember)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all flex items-center gap-1.5">
                                                            <Dumbbell size={14} /> Assign Workout
                                                        </button>
                                                        <button onClick={() => openDietModal(selectedMember)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all flex items-center gap-1.5">
                                                            <Utensils size={14} /> Assign Diet
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Workout Plans */}
                                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                                        <h4 className="text-sm font-black text-gray-900 flex items-center gap-2"><Dumbbell size={15} className="text-blue-500" /> Workout Plans ({memberWorkouts.length})</h4>
                                                    </div>
                                                    {memberWorkouts.length === 0 ? (
                                                        <div className="p-10 text-center">
                                                            <Dumbbell size={32} className="text-gray-200 mx-auto mb-3" />
                                                            <p className="text-gray-400 text-sm font-semibold">No workout plans assigned yet</p>
                                                        </div>
                                                    ) : (
                                                        <div className="divide-y divide-gray-50">
                                                            {memberWorkouts.map(w => (
                                                                <div key={w._id} className="p-5">
                                                                    <div className="flex items-start justify-between mb-3">
                                                                        <div>
                                                                            <h5 className="font-black text-gray-900">{w.name}</h5>
                                                                            <p className="text-xs text-gray-400 mt-0.5">{new Date(w.startDate).toLocaleDateString('en-IN')} → {w.endDate ? new Date(w.endDate).toLocaleDateString('en-IN') : 'Ongoing'}</p>
                                                                        </div>
                                                                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase">Active</span>
                                                                    </div>
                                                                    {w.description && <p className="text-xs text-gray-500 mb-3">{w.description}</p>}
                                                                    {w.schedule?.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1.5">
                                                                            {w.schedule.filter(s => s.exercises?.length > 0).map(s => (
                                                                                <span key={s.day} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-[10px] font-bold">
                                                                                    {s.day}: {s.exercises.length} ex
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Diet Plans */}
                                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                                    <div className="px-5 py-4 border-b border-gray-100">
                                                        <h4 className="text-sm font-black text-gray-900 flex items-center gap-2"><Utensils size={15} className="text-emerald-500" /> Diet Plans ({memberDiets.length})</h4>
                                                    </div>
                                                    {memberDiets.length === 0 ? (
                                                        <div className="p-10 text-center">
                                                            <Apple size={32} className="text-gray-200 mx-auto mb-3" />
                                                            <p className="text-gray-400 text-sm font-semibold">No diet plans assigned yet</p>
                                                        </div>
                                                    ) : (
                                                        <div className="divide-y divide-gray-50">
                                                            {memberDiets.map(d => (
                                                                <div key={d._id} className="p-5">
                                                                    <div className="flex items-start justify-between mb-3">
                                                                        <div>
                                                                            <h5 className="font-black text-gray-900">{d.name}</h5>
                                                                            <p className="text-xs text-gray-400 mt-0.5">{new Date(d.startDate).toLocaleDateString('en-IN')} → {d.endDate ? new Date(d.endDate).toLocaleDateString('en-IN') : 'Ongoing'}</p>
                                                                        </div>
                                                                        {d.totalCalories && <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black">{d.totalCalories} kcal</span>}
                                                                    </div>
                                                                    {d.dailyMeals?.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1.5">
                                                                            {d.dailyMeals.map((m, i) => (
                                                                                <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-bold">
                                                                                    {m.name} ({m.items?.filter(Boolean).length} items)
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* ══ WORKOUT MODAL ════════════════════════════════════════════ */}
            <AnimatePresence>
                {showWorkoutModal && workoutClient && (
                    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0, y: 60 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 60 }}
                            className="bg-white w-full sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-w-2xl"
                        >
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2"><Dumbbell size={18} className="text-blue-500" /> Assign Workout Plan</h3>
                                    <p className="text-xs text-gray-400 mt-0.5 font-medium">For: <span className="font-black text-gray-700">{workoutClient.username}</span></p>
                                </div>
                                <button onClick={() => setShowWorkoutModal(false)} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-xl"><X size={18} /></button>
                            </div>

                            <div className="overflow-y-auto flex-1">
                                <form onSubmit={handleCreateWorkout}>
                                    <div className="p-6 space-y-5">
                                        {/* Basic info */}
                                        <div>
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Plan Name *</label>
                                            <input required type="text" placeholder="e.g. 12-Week Strength Program" value={workoutForm.name} onChange={e => setWorkoutForm({ ...workoutForm, name: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
                                            <textarea rows={2} placeholder="Overall goal and notes for this plan..." value={workoutForm.description} onChange={e => setWorkoutForm({ ...workoutForm, description: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Start Date *</label>
                                                <input required type="date" value={workoutForm.startDate} onChange={e => setWorkoutForm({ ...workoutForm, startDate: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-blue-400 transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">End Date</label>
                                                <input type="date" value={workoutForm.endDate} onChange={e => setWorkoutForm({ ...workoutForm, endDate: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-blue-400 transition-all" />
                                            </div>
                                        </div>

                                        {/* Day-by-day schedule */}
                                        <div>
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Weekly Exercise Schedule</label>
                                            <div className="space-y-2">
                                                {DAYS.map(day => {
                                                    const dayData = workoutForm.schedule.find(s => s.day === day);
                                                    const isOpen = expandedDay === day;
                                                    return (
                                                        <div key={day} className="border border-gray-200 rounded-xl overflow-hidden">
                                                            <button type="button" onClick={() => setExpandedDay(isOpen ? null : day)}
                                                                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors ${isOpen ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                                                                <div className="flex items-center gap-3">
                                                                    <span>{day}</span>
                                                                    {dayData?.exercises?.length > 0 && (
                                                                        <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{dayData.exercises.length} exercises</span>
                                                                    )}
                                                                </div>
                                                                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                            </button>
                                                            {isOpen && (
                                                                <div className="p-4 space-y-3 border-t border-gray-100">
                                                                    {dayData?.exercises?.map((ex, idx) => (
                                                                        <div key={idx} className="bg-gray-50 rounded-xl p-3 space-y-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <input placeholder="Exercise name (e.g. Bench Press)" value={ex.name} onChange={e => updateExercise(day, idx, 'name', e.target.value)}
                                                                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold focus:border-blue-400 outline-none" />
                                                                                <button type="button" onClick={() => removeExercise(day, idx)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                                                                            </div>
                                                                            <div className="grid grid-cols-3 gap-2">
                                                                                {[['sets', 'Sets'], ['reps', 'Reps'], ['weight', 'Weight (kg)']].map(([field, label]) => (
                                                                                    <div key={field}>
                                                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">{label}</label>
                                                                                        <input type={field === 'weight' ? 'text' : 'number'} placeholder={field === 'weight' ? 'BW / 60' : ''} value={ex[field]} onChange={e => updateExercise(day, idx, field, e.target.value)}
                                                                                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:border-blue-400 outline-none mt-1" />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            <input placeholder="Notes (e.g. slow negatives, pause at bottom)" value={ex.notes} onChange={e => updateExercise(day, idx, 'notes', e.target.value)}
                                                                                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:border-blue-400 outline-none" />
                                                                        </div>
                                                                    ))}
                                                                    <button type="button" onClick={() => addExercise(day)}
                                                                        className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-blue-200 text-blue-500 rounded-xl text-xs font-bold hover:border-blue-400 hover:bg-blue-50 transition-all">
                                                                        <Plus size={14} /> Add Exercise
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
                                        <button type="button" onClick={() => setShowWorkoutModal(false)} className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all">Cancel</button>
                                        <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2">
                                            <Save size={16} /> Assign Workout Plan
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ══ DIET MODAL ═══════════════════════════════════════════════ */}
            <AnimatePresence>
                {showDietModal && dietClient && (
                    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0, y: 60 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 60 }}
                            className="bg-white w-full sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-w-xl"
                        >
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2"><Utensils size={18} className="text-emerald-500" /> Assign Diet Plan</h3>
                                    <p className="text-xs text-gray-400 mt-0.5 font-medium">For: <span className="font-black text-gray-700">{dietClient.username}</span></p>
                                </div>
                                <button onClick={() => setShowDietModal(false)} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-xl"><X size={18} /></button>
                            </div>

                            <div className="overflow-y-auto flex-1">
                                <form onSubmit={handleCreateDiet}>
                                    <div className="p-6 space-y-5">
                                        <div>
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Plan Name *</label>
                                            <input required type="text" placeholder="e.g. Lean Bulk Phase 1" value={dietForm.name} onChange={e => setDietForm({ ...dietForm, name: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
                                            <textarea rows={2} placeholder="Goal, restrictions, notes..." value={dietForm.description} onChange={e => setDietForm({ ...dietForm, description: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm resize-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Start Date *</label>
                                                <input required type="date" value={dietForm.startDate} onChange={e => setDietForm({ ...dietForm, startDate: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-emerald-400 transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">End Date</label>
                                                <input type="date" value={dietForm.endDate} onChange={e => setDietForm({ ...dietForm, endDate: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm focus:border-emerald-400 transition-all" />
                                            </div>
                                        </div>

                                        {/* Macros */}
                                        <div>
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Daily Macros</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {[
                                                    { field: 'totalCalories', label: 'Calories', unit: 'kcal', color: 'border-orange-200 focus:border-orange-400' },
                                                    { field: 'protein', label: 'Protein', unit: 'g', color: 'border-red-200 focus:border-red-400' },
                                                    { field: 'carbs', label: 'Carbs', unit: 'g', color: 'border-yellow-200 focus:border-yellow-400' },
                                                    { field: 'fats', label: 'Fats', unit: 'g', color: 'border-blue-200 focus:border-blue-400' },
                                                ].map(m => (
                                                    <div key={m.field} className="text-center">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase">{m.label}</label>
                                                        <input type="number" placeholder="0" value={dietForm[m.field]} onChange={e => setDietForm({ ...dietForm, [m.field]: e.target.value })}
                                                            className={`w-full px-2 py-2 border ${m.color} rounded-xl outline-none text-sm font-black text-center mt-1 transition-all`} />
                                                        <span className="text-[10px] text-gray-300">{m.unit}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Meals */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Daily Meal Schedule</label>
                                                <button type="button" onClick={addMeal} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                                    <Plus size={12} /> Add Meal
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                {dietForm.dailyMeals.map((meal, mIdx) => (
                                                    <div key={mIdx} className="border border-gray-200 rounded-xl overflow-hidden">
                                                        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border-b border-emerald-100">
                                                            <input placeholder="Meal name" value={meal.name} onChange={e => updateMeal(mIdx, 'name', e.target.value)}
                                                                className="flex-1 bg-transparent font-black text-emerald-800 text-sm outline-none" />
                                                            <input type="time" value={meal.time} onChange={e => updateMeal(mIdx, 'time', e.target.value)}
                                                                className="bg-transparent text-emerald-700 text-xs font-bold outline-none" />
                                                            <input type="number" placeholder="kcal" value={meal.calories} onChange={e => updateMeal(mIdx, 'calories', e.target.value)}
                                                                className="w-16 bg-white border border-emerald-200 rounded-lg px-2 py-1 text-xs font-black text-center outline-none" />
                                                        </div>
                                                        <div className="p-3 space-y-2">
                                                            {meal.items.map((item, iIdx) => (
                                                                <div key={iIdx} className="flex items-center gap-2">
                                                                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-black flex items-center justify-center flex-shrink-0">{iIdx + 1}</span>
                                                                    <input placeholder="Food item (e.g. Oats 100g, 2 eggs...)" value={item} onChange={e => updateMealItem(mIdx, iIdx, e.target.value)}
                                                                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium focus:border-emerald-400 outline-none" />
                                                                    <button type="button" onClick={() => removeMealItem(mIdx, iIdx)} className="p-1 text-gray-300 hover:text-red-400 transition-colors"><X size={12} /></button>
                                                                </div>
                                                            ))}
                                                            <button type="button" onClick={() => addMealItem(mIdx)} className="w-full py-1.5 border border-dashed border-gray-200 text-gray-400 rounded-lg text-xs font-bold hover:border-emerald-300 hover:text-emerald-600 transition-all flex items-center justify-center gap-1">
                                                                <Plus size={12} /> Add food item
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
                                        <button type="button" onClick={() => setShowDietModal(false)} className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all">Cancel</button>
                                        <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-2">
                                            <Save size={16} /> Assign Diet Plan
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TrainerDashboard;
