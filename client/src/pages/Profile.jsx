import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Mail, Calendar, Activity, Save, Ruler, Weight, Phone, 
    MapPin, HeartPulse, AlertCircle, Settings, Dumbbell, Utensils,
    CreditCard, CheckCircle2, ChevronRight, Camera, LogOut,
    TrendingUp, Clock, Info
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    
    // States for data
    const [attendance, setAttendance] = useState([]);
    const [payments, setPayments] = useState([]);
    const [workoutPlans, setWorkoutPlans] = useState([]);
    const [dietPlans, setDietPlans] = useState([]);
    
    // Form state
    const [formData, setFormData] = useState({
        age: '',
        weight: '',
        height: '',
        goals: '',
        phoneNumber: '',
        address: '',
        medicalNotes: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: ''
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchUserProfile();
        fetchInitialData();
    }, [user]);

    const fetchInitialData = async () => {
        try {
            const [attRes, payRes, workRes, dietRes] = await Promise.all([
                api.get('/attendance/me'),
                api.get('/payments/my-history'),
                api.get('/workouts/my-plans'),
                api.get('/diets/my-plans')
            ]);
            setAttendance(attRes.data);
            setPayments(payRes.data);
            setWorkoutPlans(workRes.data);
            setDietPlans(dietRes.data);
        } catch (error) {
            console.error("Error fetching supplemental data", error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const { data } = await api.get('/users/profile');
            setProfileData(data);
            setFormData({
                age: data.profile?.age || '',
                weight: data.profile?.weight || '',
                height: data.profile?.height || '',
                goals: data.profile?.goals ? data.profile.goals.join(', ') : '',
                phoneNumber: data.phoneNumber || '',
                address: data.address || '',
                medicalNotes: data.medicalNotes || '',
                emergencyContactName: data.emergencyContact?.name || '',
                emergencyContactPhone: data.emergencyContact?.phone || '',
                emergencyContactRelation: data.emergencyContact?.relation || ''
            });

            if (data.profilePhoto) {
                const serverUrl = import.meta.env.VITE_API_URL || '';
                const photoUrl = data.profilePhoto.startsWith('http') ? data.profilePhoto : `${serverUrl}${data.profilePhoto}`;
                setPreviewImage(photoUrl);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching profile", error);
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const goalsArray = formData.goals.split(',').map(g => g.trim()).filter(g => g);
            const formDataPayload = new FormData();

            formDataPayload.append('profile', JSON.stringify({
                age: Number(formData.age),
                weight: Number(formData.weight),
                height: Number(formData.height),
                goals: goalsArray
            }));

            formDataPayload.append('phoneNumber', formData.phoneNumber);
            formDataPayload.append('address', formData.address);
            formDataPayload.append('medicalNotes', formData.medicalNotes);
            formDataPayload.append('emergencyContact', JSON.stringify({
                name: formData.emergencyContactName,
                phone: formData.emergencyContactPhone,
                relation: formData.emergencyContactRelation
            }));

            if (selectedFile) {
                formDataPayload.append('profilePhoto', selectedFile);
            }

            const { data } = await api.put('/users/profile', formDataPayload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setProfileData(data);
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-gym-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-zinc-400 font-medium">Loading your profile...</p>
            </div>
        </div>
    );

    const tabs = [
        { id: 'overview', name: 'Overview', icon: <Activity size={18} /> },
        { id: 'details', name: 'Health & Details', icon: <HeartPulse size={18} /> },
        { id: 'attendance', name: 'Attendance', icon: <Calendar size={18} /> },
        { id: 'workout', name: 'My Workouts', icon: <Dumbbell size={18} /> },
        { id: 'diet', name: 'Diet Plans', icon: <Utensils size={18} /> },
        { id: 'payments', name: 'Billing', icon: <CreditCard size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-[#09090b] text-white pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Modern Hero Header */}
                <div className="relative mb-8">
                    <div className="h-64 md:h-80 w-full rounded-3xl overflow-hidden relative border border-white/5 shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-gym-accent/30 via-black to-red-900/40" />
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
                    </div>
                    
                    <div className="absolute -bottom-12 left-6 md:left-12 flex flex-col md:flex-row items-end md:items-center gap-6">
                        <div className="relative group">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-zinc-900 border-4 border-[#09090b] shadow-2xl overflow-hidden flex items-center justify-center text-5xl font-black text-gym-accent uppercase">
                                {previewImage ? (
                                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                ) : (
                                    profileData?.username?.charAt(0) || user?.username?.charAt(0) || 'U'
                                )}
                            </div>
                            <label className="absolute bottom-2 right-2 p-2 bg-gym-accent text-white rounded-xl shadow-lg cursor-pointer hover:scale-110 transition-transform border border-white/20">
                                <Camera size={18} />
                                <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                            </label>
                        </div>
                        
                        <div className="mb-4 md:mb-2">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                                    {profileData?.username || user?.username}
                                </h1>
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${profileData.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                    {profileData.status || 'Active'}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-zinc-400 text-sm font-medium">
                                <span className="flex items-center gap-1.5"><Mail size={14} className="text-gym-accent" /> {profileData.email}</span>
                                {profileData.memberId && <span className="flex items-center gap-1.5"><Info size={14} className="text-gym-accent" /> Member #{profileData.memberId}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="absolute -bottom-12 right-6 md:right-12 hidden md:flex items-center gap-3">
                        <button 
                            onClick={() => setIsEditing(!isEditing)} 
                            className="px-5 py-2.5 bg-white text-black font-black rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2 text-sm shadow-xl"
                        >
                            <Settings size={18} /> {isEditing ? 'Discard Changes' : 'Edit Profile'}
                        </button>
                    </div>
                </div>

                {/* Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-24">
                    
                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-3 space-y-2">
                        <div className="bg-[#18181b] border border-white/5 rounded-2xl p-2 sticky top-28 shadow-xl">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                                        activeTab === tab.id 
                                        ? 'bg-gym-accent text-white shadow-lg shadow-gym-accent/20' 
                                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {tab.icon}
                                    <span>{tab.name}</span>
                                    {activeTab === tab.id && <motion.div layoutId="tab-active" className="ml-auto"><ChevronRight size={16} /></motion.div>}
                                </button>
                            ))}
                            <div className="h-px bg-white/5 my-2 mx-2" />
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-500/10 transition-all"
                            >
                                <LogOut size={18} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>

                    {/* Main Panels */}
                    <div className="lg:col-span-9">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        {/* Quick Stats Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Weight', value: profileData?.profile?.weight ? `${profileData.profile.weight} kg` : '-', icon: <Weight className="text-blue-400" /> },
                                                { label: 'Height', value: profileData?.profile?.height ? `${profileData.profile.height} cm` : '-', icon: <Ruler className="text-purple-400" /> },
                                                { label: 'Age', value: profileData?.profile?.age || '-', icon: <TrendingUp className="text-green-400" /> },
                                                { label: 'Workouts', value: workoutPlans.length, icon: <Dumbbell className="text-gym-accent" /> },
                                            ].map((stat, i) => (
                                                <div key={i} className="bg-[#18181b] border border-white/5 rounded-2xl p-5 flex flex-col gap-2 hover:border-white/10 transition-colors shadow-lg">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                                                        {stat.icon}
                                                    </div>
                                                    <span className="text-2xl font-black text-white italic">{stat.value}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Membership Card */}
                                            <div className="bg-[#18181b] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                                    <CreditCard size={120} />
                                                </div>
                                                <h3 className="text-lg font-black text-white mb-6 uppercase italic tracking-tighter flex items-center gap-2">
                                                    <CreditCard size={20} className="text-gym-accent" /> Current Membership
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-end border-b border-white/5 pb-3">
                                                        <span className="text-zinc-500 text-sm font-medium">Plan Type</span>
                                                        <span className="text-white font-black text-xl italic uppercase text-gym-accent">{profileData?.membershipType || 'PREMIUM'}</span>
                                                    </div>
                                                    <div className="flex justify-between items-end border-b border-white/5 pb-3">
                                                        <span className="text-zinc-500 text-sm font-medium">Expiry Date</span>
                                                        <span className="text-white font-bold">{profileData?.membershipExpiry ? new Date(profileData.membershipExpiry).toLocaleDateString() : 'N/A'}</span>
                                                    </div>
                                                    <div className="pt-2">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-zinc-500 text-xs font-bold uppercase">Membership Health</span>
                                                            <span className="text-green-500 text-xs font-bold">ACTIVE</span>
                                                        </div>
                                                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                                            <div className="bg-gym-accent h-full w-[85%] rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Recent Activity */}
                                            <div className="bg-[#18181b] border border-white/5 rounded-2xl p-6 shadow-xl">
                                                <h3 className="text-lg font-black text-white mb-6 uppercase italic tracking-tighter flex items-center gap-2">
                                                    <Clock size={20} className="text-gym-accent" /> Recent Check-ins
                                                </h3>
                                                <div className="space-y-4">
                                                    {attendance.slice(0, 3).map((record, i) => (
                                                        <div key={i} className="flex items-center gap-4 p-3 bg-black/20 rounded-xl border border-white/5">
                                                            <div className="bg-gym-accent/10 text-gym-accent p-2 rounded-lg">
                                                                <CheckCircle2 size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white">{new Date(record.date).toLocaleDateString()}</p>
                                                                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                                                                    IN: {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {attendance.length === 0 && <p className="text-zinc-500 text-sm italic text-center py-4">No recent check-ins.</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'details' && (
                                    <div className="bg-[#18181b] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                                        <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                                                <Settings size={20} className="text-gym-accent" /> Profile Configuration
                                            </h3>
                                        </div>
                                        
                                        <div className="p-8">
                                            {isEditing ? (
                                                <form onSubmit={handleUpdate} className="space-y-8">
                                                    <div className="grid md:grid-cols-3 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Age</label>
                                                            <input
                                                                type="number"
                                                                value={formData.age}
                                                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-gym-accent focus:outline-none transition-colors"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Weight (kg)</label>
                                                            <input
                                                                type="number"
                                                                value={formData.weight}
                                                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-gym-accent focus:outline-none transition-colors"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Height (cm)</label>
                                                            <input
                                                                type="number"
                                                                value={formData.height}
                                                                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-gym-accent focus:outline-none transition-colors"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Phone Number</label>
                                                            <input
                                                                type="tel"
                                                                value={formData.phoneNumber}
                                                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-gym-accent focus:outline-none transition-colors"
                                                                placeholder="+1 (555) 000-0000"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Address</label>
                                                            <input
                                                                type="text"
                                                                value={formData.address}
                                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-gym-accent focus:outline-none transition-colors"
                                                                placeholder="123 Street, City"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Fitness Goals</label>
                                                        <input
                                                            type="text"
                                                            value={formData.goals}
                                                            onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-gym-accent focus:outline-none transition-colors"
                                                            placeholder="Fat Loss, Muscle Gain, Strength (comma separated)"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Medical Notes</label>
                                                        <textarea
                                                            value={formData.medicalNotes}
                                                            onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                                                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-gym-accent focus:outline-none transition-colors h-24 resize-none"
                                                            placeholder="Any injuries or medical conditions we should know about?"
                                                        />
                                                    </div>

                                                    <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                                        <h4 className="text-sm font-black text-white uppercase italic tracking-wider mb-4">Emergency Contact</h4>
                                                        <div className="grid md:grid-cols-3 gap-4">
                                                            <input
                                                                placeholder="Name"
                                                                value={formData.emergencyContactName}
                                                                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                                                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-gym-accent focus:outline-none"
                                                            />
                                                            <input
                                                                placeholder="Relation"
                                                                value={formData.emergencyContactRelation}
                                                                onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                                                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-gym-accent focus:outline-none"
                                                            />
                                                            <input
                                                                placeholder="Phone"
                                                                value={formData.emergencyContactPhone}
                                                                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                                                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-gym-accent focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <button 
                                                            type="submit" 
                                                            className="flex-grow bg-gym-accent text-white font-black py-4 rounded-2xl hover:bg-gym-accent/80 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gym-accent/20"
                                                        >
                                                            <Save size={20} /> Save New Settings
                                                        </button>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setIsEditing(false)}
                                                            className="px-8 bg-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-700 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                                                    <div className="space-y-6">
                                                        <div>
                                                            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                                <Info size={14} /> Personal Information
                                                            </h4>
                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between py-2 border-b border-white/5">
                                                                    <span className="text-zinc-400 text-sm">Age</span>
                                                                    <span className="text-white font-bold">{profileData.profile?.age || 'Not set'}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between py-2 border-b border-white/5">
                                                                    <span className="text-zinc-400 text-sm">Weight</span>
                                                                    <span className="text-white font-bold">{profileData.profile?.weight ? `${profileData.profile.weight} kg` : 'Not set'}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between py-2 border-b border-white/5">
                                                                    <span className="text-zinc-400 text-sm">Height</span>
                                                                    <span className="text-white font-bold">{profileData.profile?.height ? `${profileData.profile.height} cm` : 'Not set'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                                <Phone size={14} /> Contact Details
                                                            </h4>
                                                            <div className="space-y-4">
                                                                <div className="flex items-start gap-4">
                                                                    <div className="mt-1 text-gym-accent"><Phone size={16} /></div>
                                                                    <div>
                                                                        <p className="text-zinc-500 text-[10px] font-black uppercase">Phone</p>
                                                                        <p className="text-white text-sm font-medium">{profileData.phoneNumber || 'No phone number added'}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-start gap-4">
                                                                    <div className="mt-1 text-gym-accent"><MapPin size={16} /></div>
                                                                    <div>
                                                                        <p className="text-zinc-500 text-[10px] font-black uppercase">Address</p>
                                                                        <p className="text-white text-sm font-medium">{profileData.address || 'No address added'}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div>
                                                            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                                <Activity size={14} /> Health & Goals
                                                            </h4>
                                                            <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
                                                                 <div>
                                                                    <p className="text-zinc-500 text-[10px] font-black uppercase mb-2">Fitness Goals</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {profileData?.profile?.goals?.length > 0 ? profileData.profile.goals.map((g, i) => (
                                                                            <span key={i} className="px-3 py-1 bg-gym-accent/10 border border-gym-accent/30 text-gym-accent text-[10px] font-black rounded-lg uppercase tracking-wider">{g}</span>
                                                                        )) : <span className="text-zinc-600 text-xs italic">No goals defined</span>}
                                                                    </div>
                                                                </div>
                                                                <div className="h-px bg-white/5" />
                                                                <div>
                                                                    <p className="text-zinc-500 text-[10px] font-black uppercase mb-1">Medical Conditions</p>
                                                                    <p className="text-white text-xs leading-relaxed">{profileData.medicalNotes || 'No medical conditions reported. All systems go!'}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                                <AlertCircle size={14} /> Emergency Support
                                                            </h4>
                                                             <div className="bg-red-500/5 p-5 rounded-2xl border border-red-500/10">
                                                                {profileData?.emergencyContact?.name ? (
                                                                    <div className="flex items-center justify-between">
                                                                        <div>
                                                                            <p className="text-white font-bold text-sm">{profileData.emergencyContact.name}</p>
                                                                            <p className="text-zinc-500 text-[10px] font-black uppercase">{profileData.emergencyContact.relation}</p>
                                                                        </div>
                                                                        <p className="text-gym-accent font-black">{profileData.emergencyContact.phone}</p>
                                                                    </div>
                                                                ) : <p className="text-zinc-600 text-xs italic">No emergency contact set</p>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'attendance' && (
                                    <div className="bg-[#18181b] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                                        <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                                                <Calendar size={20} className="text-gym-accent" /> Attendance Vault
                                            </h3>
                                        </div>
                                        <div className="p-0">
                                            {attendance.length > 0 ? (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left">
                                                        <thead className="bg-black/30 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                                            <tr>
                                                                <th className="px-8 py-4">Session Date</th>
                                                                <th className="px-8 py-4">Time Entry</th>
                                                                <th className="px-8 py-4">Total Duration</th>
                                                                <th className="px-8 py-4 text-right">Verification</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/5">
                                                            {attendance.map((record) => (
                                                                <tr key={record._id} className="hover:bg-white/5 transition-colors">
                                                                    <td className="px-8 py-4 text-white font-bold">{new Date(record.date).toLocaleDateString()}</td>
                                                                    <td className="px-8 py-4">
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className="text-[10px] text-green-500 font-black">ENTRY: {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                            {record.checkOut && <span className="text-[10px] text-red-500 font-black">EXIT: {new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-8 py-4 text-zinc-400 text-sm font-medium">1h 15m</td>
                                                                    <td className="px-8 py-4 text-right">
                                                                        <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[8px] font-black uppercase rounded border border-green-500/20">VERIFIED</span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="p-20 text-center flex flex-col items-center gap-4">
                                                    <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-600">
                                                        <Calendar size={40} />
                                                    </div>
                                                    <p className="text-zinc-500 font-medium">No activity records found for this period.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'workout' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between bg-[#18181b] p-6 rounded-2xl border border-white/5 shadow-xl">
                                            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                                                <Dumbbell size={20} className="text-gym-accent" /> Active Workout Plans
                                            </h3>
                                            <button className="text-xs font-black text-gym-accent uppercase tracking-widest hover:underline">Request New Plan</button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 gap-6">
                                            {workoutPlans.length > 0 ? workoutPlans.map((plan) => (
                                                <div key={plan._id} className="bg-[#18181b] border border-white/5 rounded-3xl overflow-hidden shadow-xl hover:border-gym-accent/30 transition-all group">
                                                    <div className="p-8">
                                                        <div className="flex justify-between items-start mb-6">
                                                            <div>
                                                                <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">{plan.name}</h4>
                                                                <p className="text-zinc-500 text-sm font-medium flex items-center gap-2">
                                                                    Assigned by <span className="text-white font-bold">{plan.trainer?.username || 'Elite Coach'}</span>
                                                                </p>
                                                            </div>
                                                            <div className="px-3 py-1 bg-gym-accent text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-gym-accent/20">
                                                                {plan.status}
                                                            </div>
                                                        </div>
                                                        
                                                        <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-2xl">{plan.description}</p>
                                                        
                                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {plan.schedule?.map((day, idx) => (
                                                                <div key={idx} className="bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <span className="text-gym-accent text-[10px] font-black uppercase tracking-widest">{day.day}</span>
                                                                        <span className="text-zinc-600"><Dumbbell size={14} /></span>
                                                                    </div>
                                                                    <ul className="space-y-2">
                                                                        {day.exercises.map((ex, i) => (
                                                                            <li key={i} className="flex justify-between items-center text-xs">
                                                                                <span className="text-white font-bold">{ex.name}</span>
                                                                                <span className="text-zinc-500 font-mono italic">{ex.sets}x{ex.reps}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="bg-[#18181b] border border-white/5 rounded-3xl p-16 text-center shadow-xl">
                                                    <Dumbbell size={64} className="mx-auto text-zinc-800 mb-6" />
                                                    <h4 className="text-xl font-black text-white italic uppercase mb-2">No Active Routine</h4>
                                                    <p className="text-zinc-500 max-w-xs mx-auto text-sm leading-relaxed">
                                                        Connect with a trainer to get a personalized workout plan tailored to your goals.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'diet' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between bg-[#18181b] p-6 rounded-2xl border border-white/5 shadow-xl">
                                            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                                                <Utensils size={20} className="text-green-500" /> Nutritional Strategies
                                            </h3>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 gap-6">
                                            {dietPlans.length > 0 ? dietPlans.map((plan) => (
                                                <div key={plan._id} className="bg-[#18181b] border border-white/5 rounded-3xl overflow-hidden shadow-xl group">
                                                    <div className="p-8">
                                                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                                                            <div>
                                                                <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">{plan.name}</h4>
                                                                <div className="flex items-center gap-4 text-xs font-black tracking-widest uppercase">
                                                                    <span className="text-green-500">Target: {plan.totalCalories || 2500} KCAL</span>
                                                                    <span className="text-zinc-500">Coach: {plan.trainer?.username || 'Dietician'}</span>
                                                                </div>
                                                            </div>
                                                            <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-black rounded-xl uppercase tracking-widest">
                                                                STRATEGY {plan.status}
                                                            </div>
                                                        </div>
                                                        
                                                        <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-2xl">{plan.description}</p>
                                                        
                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            {[
                                                                { m: 'Breakfast', t: '08:00 AM', d: 'Oatmeal with protein, berries and almonds' },
                                                                { m: 'Lunch', t: '01:00 PM', d: 'Grilled chicken breast with quinoa and avocado' },
                                                                { m: 'Snack', t: '04:30 PM', d: 'Greek yogurt with honey and walnuts' },
                                                                { m: 'Dinner', t: '08:00 PM', d: 'Baked salmon with roasted asparagus and sweet potato' }
                                                            ].map((meal, i) => (
                                                                <div key={i} className="bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-green-500/20 transition-all">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <span className="text-white font-black text-sm uppercase italic">{meal.m}</span>
                                                                        <span className="text-[10px] font-black text-zinc-500 font-mono">{meal.t}</span>
                                                                    </div>
                                                                    <p className="text-zinc-400 text-xs leading-normal">{meal.d}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="bg-[#18181b] border border-white/5 rounded-3xl p-16 text-center shadow-xl">
                                                    <Utensils size={64} className="mx-auto text-zinc-800 mb-6" />
                                                    <h4 className="text-xl font-black text-white italic uppercase mb-2">Nutritional Gap</h4>
                                                    <p className="text-zinc-500 max-w-xs mx-auto text-sm leading-relaxed">
                                                        Fuel your performance with a custom-built nutrition plan.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'payments' && (
                                    <div className="bg-[#18181b] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                                        <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                                                <CreditCard size={20} className="text-gym-accent" /> Transaction Ledger
                                            </h3>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            {payments.length > 0 ? payments.map((payment) => (
                                                <div key={payment._id} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-white/10 transition-colors">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 bg-gym-accent/10 rounded-xl flex items-center justify-center text-gym-accent border border-gym-accent/20">
                                                            <CreditCard size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-black text-sm uppercase italic">{payment.plan?.name || 'Membership Renewal'}</p>
                                                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-wider">{new Date(payment.date).toLocaleDateString()} • {payment.method}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                                                        <div className="text-right">
                                                            <p className="text-xl font-black text-white italic tracking-tighter">${payment.amount}</p>
                                                            <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">{payment.invoiceNumber}</p>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                                                            payment.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                                                        }`}>
                                                            {payment.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="p-20 text-center flex flex-col items-center gap-4">
                                                    <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-600">
                                                        <CreditCard size={40} />
                                                    </div>
                                                    <p className="text-zinc-500 font-medium">No financial transactions found.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
