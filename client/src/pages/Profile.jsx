import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Calendar, Activity, Save, Ruler, Weight, Phone,
    MapPin, HeartPulse, AlertCircle, Settings, Dumbbell, Utensils,
    CreditCard, CheckCircle2, ChevronRight, Camera, LogOut,
    TrendingUp, Clock, Info, Shield, Edit3, Trash2
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
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
        username: '',
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
    }, [user, navigate]);

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
                username: data.username || '',
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
        const loadToast = toast.loading("Updating your profile...");
        try {
            const goalsArray = formData.goals.split(',').map(g => g.trim()).filter(g => g);
            const formDataPayload = new FormData();

            formDataPayload.append('username', formData.username);
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
            toast.success("Profile forged successfully!", { id: loadToast });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile", { id: loadToast });
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-16 h-16 border-4 border-gym-accent border-t-transparent rounded-full"
                />
                <p className="text-zinc-400 font-black tracking-widest uppercase text-xs">Synchronizing Profile...</p>
            </div>
        </div>
    );

    const tabs = [
        { id: 'overview', name: 'Overview', icon: <Activity size={18} /> },
        { id: 'details', name: 'Health & Info', icon: <Shield size={18} /> },
        { id: 'workout', name: 'Workouts', icon: <Dumbbell size={18} /> },
        { id: 'diet', name: 'Nutrition', icon: <Utensils size={18} /> },
        { id: 'attendance', name: 'Activity', icon: <Calendar size={18} /> },
        { id: 'payments', name: 'Billing', icon: <CreditCard size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-[#09090b] text-white pt-24 pb-20 px-4 md:px-8 selection:bg-gym-accent selection:text-white">
            <div className="max-w-7xl mx-auto">

                {/* PREMIER PROFILE HEADER */}
                <div className="relative mb-12">
                    <div className="h-48 md:h-64 w-full rounded-[2.5rem] overflow-hidden relative border border-white/5 shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-gym-accent via-black to-zinc-900" />
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
                    </div>

                    <div className="absolute -bottom-16 left-6 md:left-12 flex flex-col md:flex-row items-end md:items-center gap-6 w-[calc(100%-3rem)] md:w-auto">
                        <div className="relative group">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="w-32 h-32 md:w-44 md:h-44 rounded-[2rem] bg-zinc-900 border-[6px] border-[#09090b] shadow-2xl overflow-hidden flex items-center justify-center text-6xl font-black text-gym-accent uppercase"
                            >
                                {previewImage ? (
                                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                                ) : (
                                    profileData?.username?.charAt(0) || 'U'
                                )}
                            </motion.div>
                            <label className="absolute -bottom-2 -right-2 p-3 bg-gym-accent text-white rounded-2xl shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-all border border-white/20 z-10">
                                <Camera size={20} />
                                <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                            </label>
                        </div>

                        <div className="mb-4 md:mb-6 flex-grow">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-lg">
                                    {profileData?.username || 'CoreX User'}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${profileData?.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                    {profileData?.status || 'Active'}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-zinc-400 text-sm font-bold uppercase tracking-wider">
                                <span className="flex items-center gap-2"><Mail size={16} className="text-gym-accent" /> {profileData?.email}</span>
                                {profileData?.memberId && <span className="flex items-center gap-2"><Shield size={16} className="text-gym-accent" /> ID: {profileData.memberId}</span>}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <button
                                onClick={() => {
                                    setIsEditing(!isEditing);
                                    if (!isEditing) setActiveTab('details');
                                }}
                                className={`px-6 py-3 rounded-2xl font-black flex items-center gap-2 text-xs uppercase tracking-widest transition-all shadow-xl ${isEditing
                                    ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                    : 'bg-white text-black hover:bg-gym-accent hover:text-white'
                                    }`}
                            >
                                {isEditing ? <Trash2 size={18} /> : <Settings size={18} />}
                                {isEditing ? 'Discard' : 'Settings'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-28">

                    {/* SIDEBAR NAVIGATION */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-[#18181b]/50 backdrop-blur-xl border border-white/5 rounded-[2rem] p-3 sticky top-28 shadow-2xl">
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] px-4 py-4">Terminal</p>
                            <nav className="space-y-1.5">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            if (tab.id !== 'details') setIsEditing(false);
                                        }}
                                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all group ${activeTab === tab.id
                                            ? 'bg-gym-accent text-white shadow-lg shadow-gym-accent/30 translate-x-1'
                                            : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <span className={`${activeTab === tab.id ? 'text-white' : 'group-hover:text-gym-accent'} transition-colors`}>
                                            {tab.icon}
                                        </span>
                                        <span className="text-sm uppercase tracking-widest">{tab.name}</span>
                                        {activeTab === tab.id && <motion.div layoutId="nav-indicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
                                    </button>
                                ))}
                            </nav>
                            <div className="h-px bg-white/5 my-4 mx-4" />
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-red-500 hover:bg-red-500/10 transition-all uppercase tracking-widest text-sm"
                            >
                                <LogOut size={18} />
                                <span>Termination</span>
                            </button>
                        </div>

                        {/* MINI MEMBERSHIP STATUS */}
                        <div className="bg-gradient-to-br from-gym-accent/20 to-black border border-gym-accent/20 rounded-[2rem] p-6 hidden lg:block overflow-hidden relative">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-gym-accent uppercase tracking-[0.2em] mb-2">Membership Status</p>
                                <p className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">{profileData?.membershipType || 'PREMIUM'}</p>
                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                                    <Clock size={14} />
                                    Expires: {profileData?.membershipExpiry ? new Date(profileData.membershipExpiry).toLocaleDateString() : 'Never'}
                                </div>
                            </div>
                            <Activity className="absolute -bottom-6 -right-6 text-white/5" size={100} />
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="lg:col-span-9">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab + isEditing}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: "circOut" }}
                                className="min-h-[600px]"
                            >
                                {/* OVERVIEW PANEL */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-8">
                                        {/* STATS STRIP */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            {[
                                                { label: 'Weight', value: profileData?.profile?.weight ? `${profileData.profile.weight} KG` : 'N/A', icon: <Weight className="text-blue-500" />, sub: 'Current Mass' },
                                                { label: 'Height', value: profileData?.profile?.height ? `${profileData.profile.height} CM` : 'N/A', icon: <Ruler className="text-purple-500" />, sub: 'Vertical Axis' },
                                                { label: 'Age', value: profileData?.profile?.age || 'N/A', icon: <Activity className="text-green-500" />, sub: 'Life Cycles' },
                                                { label: 'Workouts', value: workoutPlans.length, icon: <Dumbbell className="text-gym-accent" />, sub: 'Assigned Plans' },
                                            ].map((stat, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="bg-[#18181b] border border-white/5 rounded-3xl p-6 flex flex-col gap-3 group hover:border-gym-accent/30 transition-all hover:translate-y-[-4px]"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div className="p-2 bg-white/5 rounded-xl group-hover:bg-gym-accent/10 transition-colors">
                                                            {stat.icon}
                                                        </div>
                                                        <TrendingUp size={14} className="text-zinc-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                                                        <p className="text-2xl font-black text-white italic tracking-tighter">{stat.value}</p>
                                                        <p className="text-[9px] font-bold text-zinc-600 uppercase mt-1">{stat.sub}</p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* PERFORMANCE CARD */}
                                            <div className="bg-[#18181b] border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity rotate-12">
                                                    <Activity size={200} />
                                                </div>
                                                <h3 className="text-xl font-black text-white mb-8 uppercase italic tracking-tighter flex items-center gap-3">
                                                    <TrendingUp size={24} className="text-gym-accent" /> Discipline Level
                                                </h3>
                                                <div className="space-y-6">
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Current Streak</p>
                                                            <p className="text-4xl font-black text-white italic tracking-tighter">12 <span className="text-sm font-bold text-zinc-500 not-italic uppercase ml-1">Days</span></p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Consistency</p>
                                                            <p className="text-2xl font-black text-green-500 italic">94%</p>
                                                        </div>
                                                    </div>
                                                    <div className="pt-2">
                                                        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: '94%' }}
                                                                transition={{ duration: 1.5, ease: "circOut" }}
                                                                className="bg-gym-accent h-full rounded-full shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {[1, 2, 3, 4, 5, 6, 7].map(d => (
                                                            <div key={d} className={`h-8 rounded-lg border border-white/5 ${d < 6 ? 'bg-gym-accent/20 border-gym-accent/30' : 'bg-white/5'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ACTIVITY LOG */}
                                            <div className="bg-[#18181b] border border-white/5 rounded-[2rem] p-8 shadow-2xl">
                                                <h3 className="text-xl font-black text-white mb-8 uppercase italic tracking-tighter flex items-center gap-3">
                                                    <Clock size={24} className="text-gym-accent" /> Session History
                                                </h3>
                                                <div className="space-y-4">
                                                    {attendance.length > 0 ? attendance.slice(0, 4).map((record, i) => (
                                                        <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-[1.25rem] border border-white/5 hover:border-white/10 transition-all">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center border border-green-500/20">
                                                                    <CheckCircle2 size={18} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-black text-white uppercase italic">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Verified Session</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-black text-white font-mono">{new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                                <p className="text-[9px] text-green-500 font-black uppercase">Clocked In</p>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="text-center py-12">
                                                            <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest italic">No combat records found.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* HEALTH & DETAILS (EDIT MODE) */}
                                {activeTab === 'details' && (
                                    <div className="bg-[#18181b] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                                        <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                            <div>
                                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                                                    <Settings size={24} className="text-gym-accent" /> {isEditing ? 'Forge New Identity' : 'Core Identification'}
                                                </h3>
                                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Manage your physical parameters and security</p>
                                            </div>
                                            {!isEditing && (
                                                <button onClick={() => setIsEditing(true)} className="p-3 bg-white/5 text-gym-accent rounded-2xl hover:bg-gym-accent hover:text-white transition-all shadow-lg border border-white/5">
                                                    <Edit3 size={20} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="p-8 md:p-12">
                                            {isEditing ? (
                                                <form onSubmit={handleUpdate} className="space-y-10">
                                                    {/* BASIC INFO SECTION */}
                                                    <div className="space-y-6">
                                                        <p className="text-[10px] font-black text-gym-accent uppercase tracking-[0.3em] flex items-center gap-2">
                                                            <User size={12} /> System Identity
                                                        </p>
                                                        <div className="grid md:grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Display Name</label>
                                                                <div className="relative">
                                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                                                    <input
                                                                        type="text"
                                                                        required
                                                                        value={formData.username}
                                                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:border-gym-accent focus:outline-none focus:ring-1 focus:ring-gym-accent/30 transition-all font-bold"
                                                                        placeholder="Your Fighter Name"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2 opacity-50 cursor-not-allowed">
                                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email (Permanent)</label>
                                                                <div className="relative">
                                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                                                    <input
                                                                        type="email"
                                                                        disabled
                                                                        value={profileData?.email || ''}
                                                                        className="w-full bg-black/20 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-zinc-500 text-sm outline-none font-bold"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* BIOMETRICS SECTION */}
                                                    <div className="space-y-6">
                                                        <p className="text-[10px] font-black text-gym-accent uppercase tracking-[0.3em] flex items-center gap-2">
                                                            <HeartPulse size={12} /> Biological Parameters
                                                        </p>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            {[
                                                                { label: 'Age', key: 'age', icon: <Calendar size={18} />, unit: 'Years' },
                                                                { label: 'Weight', key: 'weight', icon: <Weight size={18} />, unit: 'KG' },
                                                                { label: 'Height', key: 'height', icon: <Ruler size={18} />, unit: 'CM' },
                                                            ].map(bio => (
                                                                <div key={bio.key} className="space-y-2">
                                                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">{bio.label} ({bio.unit})</label>
                                                                    <div className="relative">
                                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">{bio.icon}</span>
                                                                        <input
                                                                            type="number"
                                                                            value={formData[bio.key]}
                                                                            onChange={(e) => setFormData({ ...formData, [bio.key]: e.target.value })}
                                                                            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:border-gym-accent focus:outline-none transition-all font-black italic"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* CONTACT & ADDRESS SECTION */}
                                                    <div className="space-y-6">
                                                        <p className="text-[10px] font-black text-gym-accent uppercase tracking-[0.3em] flex items-center gap-2">
                                                            <MapPin size={12} /> Logistics & Location
                                                        </p>
                                                        <div className="grid md:grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Communication Line</label>
                                                                <div className="relative">
                                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                                                    <input
                                                                        type="tel"
                                                                        value={formData.phoneNumber}
                                                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:border-gym-accent focus:outline-none transition-all font-bold"
                                                                        placeholder="+1 (000) 000-0000"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Base of Operations</label>
                                                                <div className="relative">
                                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                                                    <input
                                                                        type="text"
                                                                        value={formData.address}
                                                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:border-gym-accent focus:outline-none transition-all font-bold"
                                                                        placeholder="Sector, City, Grid"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* HEALTH INTEL SECTION */}
                                                    <div className="space-y-6">
                                                        <p className="text-[10px] font-black text-gym-accent uppercase tracking-[0.3em] flex items-center gap-2">
                                                            <AlertCircle size={12} /> Medical Intelligence
                                                        </p>
                                                        <div className="space-y-6">
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Strategic Goals (Comma Separated)</label>
                                                                <input
                                                                    type="text"
                                                                    value={formData.goals}
                                                                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                                                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:border-gym-accent focus:outline-none transition-all font-bold italic"
                                                                    placeholder="Strength, Hypertrophy, Metabolic Conditioning..."
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Injury Intel & Vulnerabilities</label>
                                                                <textarea
                                                                    value={formData.medicalNotes}
                                                                    onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                                                                    className="w-full bg-black/40 border border-white/10 rounded-[2rem] px-6 py-5 text-white text-sm focus:border-gym-accent focus:outline-none transition-all h-32 resize-none leading-relaxed font-medium"
                                                                    placeholder="Report any physical limitations or strategic vulnerabilities..."
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* EMERGENCY OVERRIDE SECTION */}
                                                    <div className="p-8 bg-gym-accent/5 rounded-[2.5rem] border border-gym-accent/20">
                                                        <p className="text-[10px] font-black text-gym-accent uppercase tracking-[0.3em] mb-6">Emergency Extraction Protocol</p>
                                                        <div className="grid md:grid-cols-3 gap-6">
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Contact Name</label>
                                                                <input
                                                                    value={formData.emergencyContactName}
                                                                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                                                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-xs focus:border-gym-accent outline-none font-bold"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Kinship/Relation</label>
                                                                <input
                                                                    value={formData.emergencyContactRelation}
                                                                    onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                                                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-xs focus:border-gym-accent outline-none font-bold"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Emergency Signal (Phone)</label>
                                                                <input
                                                                    value={formData.emergencyContactPhone}
                                                                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                                                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-xs focus:border-gym-accent outline-none font-bold"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                                        <motion.button
                                                            whileTap={{ scale: 0.98 }}
                                                            type="submit"
                                                            className="flex-grow bg-gym-accent text-white font-black py-5 rounded-[2rem] hover:bg-gym-accent/80 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-gym-accent/30 uppercase tracking-[0.2em] text-sm"
                                                        >
                                                            <Save size={20} /> Update Biometrics
                                                        </motion.button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsEditing(false)}
                                                            className="px-10 bg-zinc-800 text-zinc-400 font-black rounded-[2rem] hover:bg-zinc-700 hover:text-white transition-all uppercase tracking-widest text-sm"
                                                        >
                                                            Abort
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
                                                    <div className="space-y-10">
                                                        <div>
                                                            <h4 className="text-[10px] font-black text-gym-accent uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                                                <div className="w-6 h-px bg-gym-accent/50" /> Biological Intel
                                                            </h4>
                                                            <div className="space-y-1">
                                                                {[
                                                                    { label: 'Age Level', value: profileData?.profile?.age || 'Unset', icon: <Calendar size={16} /> },
                                                                    { label: 'Physical Mass', value: profileData?.profile?.weight ? `${profileData.profile.weight} KG` : 'Unset', icon: <Weight size={16} /> },
                                                                    { label: 'Vertical Stat', value: profileData?.profile?.height ? `${profileData.profile.height} CM` : 'Unset', icon: <Ruler size={16} /> },
                                                                ].map((item, i) => (
                                                                    <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 group hover:bg-white/[0.02] px-2 transition-all rounded-lg">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="text-zinc-600 group-hover:text-gym-accent transition-colors">{item.icon}</span>
                                                                            <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">{item.label}</span>
                                                                        </div>
                                                                        <span className="text-white font-black italic tracking-tighter text-lg">{item.value}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h4 className="text-[10px] font-black text-gym-accent uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                                                <div className="w-6 h-px bg-gym-accent/50" /> Logistic Channels
                                                            </h4>
                                                            <div className="space-y-6">
                                                                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-3xl border border-white/5 group hover:border-gym-accent/30 transition-all">
                                                                    <div className="mt-1 p-2 bg-gym-accent/10 text-gym-accent rounded-xl group-hover:bg-gym-accent group-hover:text-white transition-all"><Phone size={18} /></div>
                                                                    <div>
                                                                        <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Comm Line</p>
                                                                        <p className="text-white text-sm font-bold tracking-wide">{profileData?.phoneNumber || 'SIGNAL LOST'}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-3xl border border-white/5 group hover:border-gym-accent/30 transition-all">
                                                                    <div className="mt-1 p-2 bg-gym-accent/10 text-gym-accent rounded-xl group-hover:bg-gym-accent group-hover:text-white transition-all"><MapPin size={18} /></div>
                                                                    <div>
                                                                        <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Base Coords</p>
                                                                        <p className="text-white text-sm font-bold tracking-wide">{profileData?.address || 'UNKNOWN SECTOR'}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-10">
                                                        <div>
                                                            <h4 className="text-[10px] font-black text-gym-accent uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                                                <div className="w-6 h-px bg-gym-accent/50" /> Strategic Objectives
                                                            </h4>
                                                            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-8 relative overflow-hidden group">
                                                                <Activity className="absolute -bottom-8 -right-8 text-white/[0.03] rotate-12 transition-transform group-hover:scale-110" size={120} />
                                                                <div className="relative z-10">
                                                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Tactical Goals</p>
                                                                    <div className="flex flex-wrap gap-2.5">
                                                                        {profileData?.profile?.goals?.length > 0 ? profileData.profile.goals.map((g, i) => (
                                                                            <span key={i} className="px-4 py-1.5 bg-gym-accent/10 border border-gym-accent/30 text-gym-accent text-[10px] font-black rounded-xl uppercase tracking-widest">{g}</span>
                                                                        )) : <span className="text-zinc-600 text-xs italic font-bold">NO OBJECTIVES DEFINED</span>}
                                                                    </div>
                                                                </div>
                                                                <div className="relative z-10">
                                                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Internal Diagnostics</p>
                                                                    <p className="text-white text-xs leading-relaxed font-medium italic opacity-80">"{profileData?.medicalNotes || 'System integrity verified. No vulnerabilities reported.'}"</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h4 className="text-[10px] font-black text-gym-accent uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                                                <div className="w-6 h-px bg-gym-accent/50" /> Emergency Override
                                                            </h4>
                                                            <div className="bg-red-500/5 p-8 rounded-[2rem] border border-red-500/10 hover:bg-red-500/[0.08] transition-colors relative overflow-hidden">
                                                                <Shield className="absolute -bottom-4 -right-4 text-red-500/[0.05]" size={80} />
                                                                {profileData?.emergencyContact?.name ? (
                                                                    <div className="flex items-center justify-between gap-4">
                                                                        <div>
                                                                            <p className="text-white font-black text-lg italic tracking-tighter uppercase mb-1">{profileData.emergencyContact.name}</p>
                                                                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                                                <span className="w-4 h-px bg-zinc-700" /> {profileData.emergencyContact.relation}
                                                                            </p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-gym-accent font-black text-sm tracking-widest mb-1">{profileData.emergencyContact.phone}</p>
                                                                            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Extraction Link</p>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col items-center gap-2 py-2">
                                                                        <AlertCircle size={24} className="text-zinc-700" />
                                                                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">No Extraction Point Defined</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* WORKOUTS PANEL */}
                                {activeTab === 'workout' && (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between bg-[#18181b] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                                            <div>
                                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                                                    <Dumbbell size={24} className="text-gym-accent" /> Combat Protocols
                                                </h3>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Active training regimens assigned to your profile</p>
                                            </div>
                                            <button className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-gym-accent uppercase tracking-[0.2em] hover:bg-gym-accent hover:text-white transition-all shadow-lg">Request Intel</button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-8">
                                            {workoutPlans.length > 0 ? workoutPlans.map((plan, pIdx) => (
                                                <motion.div
                                                    key={plan._id}
                                                    initial={{ opacity: 0, y: 30 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: pIdx * 0.1 }}
                                                    className="bg-[#18181b] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl hover:border-gym-accent/40 transition-all group relative"
                                                >
                                                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] rotate-12"><Dumbbell size={200} /></div>
                                                    <div className="p-8 md:p-12 relative z-10">
                                                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                                                            <div>
                                                                <h4 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">{plan.name}</h4>
                                                                <div className="flex items-center gap-3 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                                                    <div className="w-8 h-8 rounded-xl bg-gym-accent/10 flex items-center justify-center text-gym-accent border border-gym-accent/20">
                                                                        <User size={14} />
                                                                    </div>
                                                                    Assigned by <span className="text-white font-black">{plan.trainer?.username || 'Elite Intelligence'}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="px-6 py-2.5 bg-gym-accent text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] shadow-2xl shadow-gym-accent/30">
                                                                    {plan.status}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <p className="text-zinc-400 text-base leading-relaxed mb-12 max-w-3xl font-medium opacity-80">"{plan.description}"</p>

                                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                            {plan.schedule?.map((day, idx) => (
                                                                <div key={idx} className="bg-black/50 p-6 rounded-[2rem] border border-white/5 hover:border-gym-accent/20 transition-all group/day">
                                                                    <div className="flex items-center justify-between mb-6">
                                                                        <span className="text-gym-accent text-xs font-black uppercase tracking-[0.2em] italic">{day.day}</span>
                                                                        <span className="text-zinc-700 group-hover/day:text-gym-accent transition-colors"><Activity size={18} /></span>
                                                                    </div>
                                                                    <ul className="space-y-4">
                                                                        {day.exercises.map((ex, i) => (
                                                                            <li key={i} className="flex justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                                                                <span className="text-zinc-300 text-xs font-bold uppercase">{ex.name}</span>
                                                                                <span className="text-white font-black italic tracking-tighter text-sm">{ex.sets} <span className="text-[10px] text-zinc-600 font-black not-italic uppercase ml-0.5">X</span> {ex.reps}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )) : (
                                                <div className="bg-[#18181b] border border-white/5 rounded-[3rem] p-24 text-center shadow-2xl">
                                                    <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/5">
                                                        <Dumbbell size={48} className="text-zinc-800" />
                                                    </div>
                                                    <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-3">No Active Protocols</h4>
                                                    <p className="text-zinc-500 max-w-sm mx-auto text-sm font-bold uppercase tracking-widest leading-relaxed">
                                                        Establish connection with a Trainer to receive your personalized combat regimen.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* NUTRITION PANEL */}
                                {activeTab === 'diet' && (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between bg-[#18181b] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                                            <div>
                                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                                                    <Utensils size={24} className="text-green-500" /> Biological Fueling
                                                </h3>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Optimization strategies for your metabolic output</p>
                                            </div>
                                            <div className="flex items-center gap-2 px-5 py-2.5 bg-green-500/10 border border-green-500/20 rounded-2xl">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Optimized</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-8">
                                            {dietPlans.length > 0 ? dietPlans.map((plan, dIdx) => (
                                                <motion.div
                                                    key={plan._id}
                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: dIdx * 0.1 }}
                                                    className="bg-[#18181b] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl group relative"
                                                >
                                                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] -rotate-12"><Utensils size={200} /></div>
                                                    <div className="p-8 md:p-12 relative z-10">
                                                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-8 mb-12">
                                                            <div>
                                                                <h4 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-3">{plan.name}</h4>
                                                                <div className="flex flex-wrap items-center gap-6 text-[10px] font-black tracking-[0.2em] uppercase">
                                                                    <div className="flex items-center gap-2 py-1.5 px-4 bg-green-500/10 text-green-500 rounded-full border border-green-500/20 shadow-lg shadow-green-500/10">
                                                                        TARGET: {plan.totalCalories || 2800} KCAL
                                                                    </div>
                                                                    <span className="text-zinc-500 flex items-center gap-2"><User size={14} className="text-green-500" /> STRATEGIST: {plan.trainer?.username || 'CoreX Nutrition'}</span>
                                                                </div>
                                                            </div>
                                                            <div className="px-6 py-3 bg-white/5 border border-white/10 text-white text-xs font-black rounded-2xl uppercase tracking-widest italic group-hover:bg-green-500 group-hover:text-black transition-all">
                                                                STATUS: {plan.status}
                                                            </div>
                                                        </div>

                                                        <p className="text-zinc-400 text-base leading-relaxed mb-12 max-w-3xl font-medium opacity-80">"{plan.description}"</p>

                                                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                            {[
                                                                { m: 'Morning Fuel', t: '07:30', d: 'Complex carbs with high bioavailability protein.', i: '🍳' },
                                                                { m: 'Metabolic Peak', t: '13:00', d: 'Dense micronutrients and sustained energy fats.', i: '🥗' },
                                                                { m: 'Anabolic Window', t: '16:30', d: 'Rapid absorption aminos and glycogen replenishment.', i: '🥤' },
                                                                { m: 'Recovery Phase', t: '20:00', d: 'Slow-digesting proteins for overnight tissue repair.', i: '🥩' }
                                                            ].map((meal, i) => (
                                                                <div key={i} className="bg-black/50 p-6 rounded-[2rem] border border-white/5 hover:border-green-500/30 transition-all group/meal relative overflow-hidden">
                                                                    <span className="absolute -top-2 -right-2 text-4xl opacity-10 grayscale group-hover/meal:grayscale-0 group-hover/meal:opacity-20 transition-all">{meal.i}</span>
                                                                    <div className="flex flex-col gap-4">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-green-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{meal.t} HRS</span>
                                                                            <span className="text-white font-black text-lg uppercase italic tracking-tighter">{meal.m}</span>
                                                                        </div>
                                                                        <div className="h-px bg-white/5" />
                                                                        <p className="text-zinc-400 text-xs leading-relaxed font-medium">{meal.d}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )) : (
                                                <div className="bg-[#18181b] border border-white/5 rounded-[3rem] p-24 text-center shadow-2xl">
                                                    <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/5">
                                                        <Utensils size={48} className="text-zinc-800" />
                                                    </div>
                                                    <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-3">Nutritional Void</h4>
                                                    <p className="text-zinc-500 max-w-sm mx-auto text-sm font-bold uppercase tracking-widest leading-relaxed">
                                                        Optimization of biological output requires a strategic nutrition protocol.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ACTIVITY PANEL */}
                                {activeTab === 'attendance' && (
                                    <div className="bg-[#18181b] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                                        <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                            <div>
                                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                                                    <Calendar size={24} className="text-gym-accent" /> Combat Records
                                                </h3>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Verified physical engagement logs</p>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-xl text-zinc-500">
                                                <Activity size={20} />
                                            </div>
                                        </div>
                                        <div className="p-0">
                                            {attendance.length > 0 ? (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left">
                                                        <thead className="bg-black/40 text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                                                            <tr>
                                                                <th className="px-10 py-6">Engagement Date</th>
                                                                <th className="px-10 py-6">Entry/Exit Timestamps</th>
                                                                <th className="px-10 py-6">Operational Time</th>
                                                                <th className="px-10 py-6 text-right">Clearance</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/5">
                                                            {attendance.map((record, i) => (
                                                                <motion.tr
                                                                    key={record._id}
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    transition={{ delay: i * 0.05 }}
                                                                    className="hover:bg-white/[0.02] transition-colors"
                                                                >
                                                                    <td className="px-10 py-6">
                                                                        <span className="text-white font-black italic tracking-tighter uppercase text-base">{new Date(record.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                                    </td>
                                                                    <td className="px-10 py-6">
                                                                        <div className="flex flex-col gap-1.5 font-mono">
                                                                            <span className="text-[10px] text-green-500 font-black tracking-tighter flex items-center gap-2">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                                                IN: {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                                            </span>
                                                                            {record.checkOut ? (
                                                                                <span className="text-[10px] text-red-500 font-black tracking-tighter flex items-center gap-2">
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                                                    OUT: {new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                                                </span>
                                                                            ) : <span className="text-[10px] text-zinc-600 font-black tracking-widest uppercase animate-pulse">In Progress...</span>}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-10 py-6 text-zinc-400 text-sm font-bold italic">78 Minutes</td>
                                                                    <td className="px-10 py-6 text-right">
                                                                        <span className="px-4 py-1.5 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-green-500/20 shadow-lg shadow-green-500/5">
                                                                            AUTHENTICATED
                                                                        </span>
                                                                    </td>
                                                                </motion.tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="p-32 text-center flex flex-col items-center gap-6">
                                                    <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-700 border border-white/5">
                                                        <Calendar size={40} />
                                                    </div>
                                                    <p className="text-zinc-500 font-black uppercase tracking-[0.2em] text-xs italic">No activity detected on the network.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* BILLING PANEL */}
                                {activeTab === 'payments' && (
                                    <div className="bg-[#18181b] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                                        <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                            <div>
                                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                                                    <CreditCard size={24} className="text-gym-accent" /> Financial Ledger
                                                </h3>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Transaction history and credit allocation</p>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-xl text-zinc-500">
                                                <Shield size={20} />
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            {payments.length > 0 ? payments.map((payment, i) => (
                                                <motion.div
                                                    key={payment._id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="bg-black/30 p-6 rounded-[2rem] border border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-6 hover:border-gym-accent/30 transition-all group"
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-14 h-14 bg-gym-accent/10 rounded-[1.25rem] flex items-center justify-center text-gym-accent border border-gym-accent/20 group-hover:bg-gym-accent group-hover:text-white transition-all">
                                                            <CreditCard size={24} />
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-black text-lg uppercase italic tracking-tighter mb-1">{payment.plan?.name || 'Protocol Renewal'}</p>
                                                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {payment.method}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 border-white/5 pt-5 md:pt-0">
                                                        <div className="text-right">
                                                            <p className="text-3xl font-black text-white italic tracking-tighter">${payment.amount}</p>
                                                            <p className="text-[9px] text-zinc-600 font-mono font-black uppercase tracking-widest">{payment.invoiceNumber}</p>
                                                        </div>
                                                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${payment.status === 'completed'
                                                            ? 'bg-green-500/10 text-green-500 border border-green-500/20 shadow-green-500/5'
                                                            : 'bg-zinc-800 text-zinc-500 border border-white/5 shadow-black/20'
                                                            }`}>
                                                            {payment.status}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            )) : (
                                                <div className="p-32 text-center flex flex-col items-center gap-6">
                                                    <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-700 border border-white/5">
                                                        <CreditCard size={40} />
                                                    </div>
                                                    <p className="text-zinc-500 font-black uppercase tracking-[0.2em] text-xs italic">No financial movements detected.</p>
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
