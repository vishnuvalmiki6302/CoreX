import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Users, Search, Phone, MapPin, Activity, Plus, Dumbbell, Utensils, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const TrainerDashboard = () => {
    const { user } = useAuth();
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
        if (user.role !== 'trainer') {
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
        // Reset forms
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

    // Helper to add a simple exercise/meal for demo purposes (Detailed UI would be complex)
    const addSimpleDay = () => {
        if (planType === 'workout') {
            const day = prompt("Enter Day (e.g., Monday)");
            if (day) {
                setWorkoutForm({
                    ...workoutForm,
                    schedule: [...workoutForm.schedule, { day, exercises: [] }]
                });
            }
        } else {
            // Simple placeholder for Diet
        }
    };

    const filteredMembers = members.filter(m =>
        m.username.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="text-center text-white mt-20">Loading...</div>;

    return (
        <div className="min-h-screen bg-gym-dark pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Trainer Dashboard</h1>
                    <p className="text-gray-400">Welcome back, Coach {user?.username}.</p>
                </header>

                <div className="bg-zinc-900 border border-white/5 rounded-xl p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Users className="text-gym-accent" /> My Clients !
                        </h2>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search clients..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-gym-accent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMembers.length > 0 ? filteredMembers.map(member => (
                            <div key={member._id} className="bg-black/40 border border-white/5 rounded-xl p-6 hover:border-gym-accent/30 transition-colors flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-gym-accent/20 text-gym-accent flex items-center justify-center font-bold text-xl">
                                            {member.username.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{member.username}</h3>
                                            <p className="text-sm text-gray-400">{member.email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-start gap-3">
                                            <Phone size={16} className="text-gray-500 mt-1" />
                                            <div>
                                                <p className="text-xs text-gray-500">Phone</p>
                                                <p className="text-sm text-gray-300">{member.phoneNumber || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Activity size={16} className="text-gray-500 mt-1" />
                                            <div>
                                                <p className="text-xs text-gray-500">Goal</p>
                                                <p className="text-sm text-gray-300">{member.profile?.goals?.join(', ') || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <button
                                        onClick={() => handleOpenPlanModal(member, 'workout')}
                                        className="bg-zinc-800 hover:bg-zinc-700 text-gym-accent text-sm font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                        <Dumbbell size={16} /> Workout
                                    </button>
                                    <button
                                        onClick={() => handleOpenPlanModal(member, 'diet')}
                                        className="bg-zinc-800 hover:bg-zinc-700 text-green-500 text-sm font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                        <Utensils size={16} /> Diet
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-500 col-span-full text-center py-10">No clients assigned yet.</p>
                        )}
                    </div>
                </div>

                {/* PLAN CREATION MODAL */}
                {showPlanModal && selectedClient && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">
                                    Assign {planType === 'workout' ? 'Workout' : 'Diet'} Plan
                                </h2>
                                <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <p className="text-gray-400 mb-6">Creating plan for <span className="text-white font-bold">{selectedClient.username}</span></p>

                            <form onSubmit={planType === 'workout' ? handleCreateWorkout : handleCreateDiet} className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Plan Name</label>
                                    <input
                                        required
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none"
                                        value={planType === 'workout' ? workoutForm.name : dietForm.name}
                                        onChange={e => planType === 'workout' ? setWorkoutForm({ ...workoutForm, name: e.target.value }) : setDietForm({ ...dietForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Start Date</label>
                                        <input
                                            type="date" required
                                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none"
                                            value={planType === 'workout' ? workoutForm.startDate : dietForm.startDate}
                                            onChange={e => planType === 'workout' ? setWorkoutForm({ ...workoutForm, startDate: e.target.value }) : setDietForm({ ...dietForm, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">End Date (Optional)</label>
                                        <input
                                            type="date"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none"
                                            value={planType === 'workout' ? workoutForm.endDate : dietForm.endDate}
                                            onChange={e => planType === 'workout' ? setWorkoutForm({ ...workoutForm, endDate: e.target.value }) : setDietForm({ ...dietForm, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Description</label>
                                    <textarea
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none h-24 resize-none"
                                        value={planType === 'workout' ? workoutForm.description : dietForm.description}
                                        onChange={e => planType === 'workout' ? setWorkoutForm({ ...workoutForm, description: e.target.value }) : setDietForm({ ...dietForm, description: e.target.value })}
                                    />
                                </div>

                                {planType === 'diet' && (
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Total Daily Calories (Target)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none"
                                            value={dietForm.totalCalories}
                                            onChange={e => setDietForm({ ...dietForm, totalCalories: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                    <p className="text-yellow-500 text-sm">
                                        Note: Detailed {planType} builder (adding exercises/meals) is simplified for this demo.
                                        Creating this plan will initialize it, and you can add details later.
                                    </p>
                                </div>

                                <button type="submit" className="w-full bg-gym-accent text-white font-bold py-3 rounded-lg hover:bg-gym-accent/90 mt-4 flex items-center justify-center gap-2">
                                    <Save size={18} /> Create Plan
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainerDashboard;
