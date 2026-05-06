import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Calendar, Activity, Save, Ruler, Weight, Phone,
    MapPin, HeartPulse, AlertCircle, Settings, Dumbbell, Utensils,
    CreditCard, CheckCircle2, ChevronRight, Camera, LogOut,
    TrendingUp, Clock, Info, Shield, Edit3, Trash2, X, Zap
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const InputField = ({ label, icon: Icon, type = 'text', value, onChange, placeholder, disabled }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-400">{label}</label>
        <div className={`relative flex items-center ${disabled ? 'opacity-50' : ''}`}>
            {Icon && <Icon size={15} className="absolute left-3 text-zinc-500 pointer-events-none" />}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full h-10 ${Icon ? 'pl-9' : 'pl-3'} pr-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all disabled:bg-zinc-900 disabled:cursor-not-allowed`}
            />
        </div>
    </div>
);

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);

    const [attendance, setAttendance] = useState([]);
    const [payments, setPayments] = useState([]);
    const [workoutPlans, setWorkoutPlans] = useState([]);
    const [dietPlans, setDietPlans] = useState([]);
    const [planProgram, setPlanProgram] = useState(null);
    const [activeProgramDay, setActiveProgramDay] = useState('Monday');

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
        if (!user) { navigate('/login'); return; }
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

    const fetchPlanProgram = async (planType) => {
        if (!planType || planType === 'none') return;
        try {
            const { data } = await api.get(`/plan-programs/${planType.toLowerCase()}`);
            setPlanProgram(data);
        } catch (error) {
            console.error('No plan program found for this plan type');
        }
    };

    const fetchUserProfile = async () => {
        try {
            const { data } = await api.get('/users/profile');
            setProfileData(data);
            if (data.membershipType) fetchPlanProgram(data.membershipType);
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
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const loadToast = toast.loading("Saving changes...");
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
            if (selectedFile) formDataPayload.append('profilePhoto', selectedFile);
            const { data } = await api.put('/users/profile', formDataPayload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setProfileData(data);
            setIsEditing(false);
            toast.success("Profile updated successfully.", { id: loadToast });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile", { id: loadToast });
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-zinc-500 text-sm font-medium">Synchronizing profile...</p>
            </div>
        </div>
    );

    const tabs = [
        { id: 'overview', name: 'Overview', icon: Activity },
        { id: 'details', name: 'Profile', icon: User },
        { id: 'attendance', name: 'Attendance', icon: Calendar },
        { id: 'payments', name: 'Billing', icon: CreditCard },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
            <div className="max-w-6xl mx-auto px-4 md:px-6 pt-24 pb-16">

                {/* ─── PROFILE HEADER ─── */}
                <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-zinc-800 shadow-2xl mb-6 overflow-hidden">
                    <div className="h-32 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 relative">
                        <div className="absolute inset-0 opacity-30"
                            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #f9731611 0%, transparent 60%), radial-gradient(circle at 80% 50%, #ffffff05 0%, transparent 60%)' }} />
                    </div>
                    <div className="px-6 pb-6 relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 -mt-12">
                            <div className="flex items-end gap-5">
                                {/* Avatar */}
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-2xl border-4 border-zinc-900 shadow-2xl bg-zinc-800 overflow-hidden flex items-center justify-center text-zinc-500">
                                        {previewImage
                                            ? <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                            : <span className="text-3xl font-bold text-zinc-400">{profileData?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                                        }
                                    </div>
                                    <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg transition-all transform hover:scale-110 active:scale-95">
                                        <Camera size={14} />
                                        <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                                    </label>
                                </div>
                                <div className="mb-2">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-bold text-white tracking-tight">{profileData?.username || 'Member'}</h1>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                                            profileData?.status === 'active'
                                                ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                                                : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${profileData?.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                            {profileData?.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-zinc-400">
                                        <span className="flex items-center gap-1.5 bg-zinc-800/50 px-2 py-1 rounded-md"><Mail size={13} className="text-zinc-500" />{profileData?.email}</span>
                                        {profileData?.memberId && <span className="flex items-center gap-1.5 bg-zinc-800/50 px-2 py-1 rounded-md"><Shield size={13} className="text-zinc-500" />#{profileData.memberId}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-2">
                                <button
                                    onClick={() => { setIsEditing(!isEditing); if (!isEditing) setActiveTab('details'); }}
                                    className={`inline-flex items-center gap-2 px-5 h-10 rounded-xl text-sm font-semibold transition-all ${
                                        isEditing
                                            ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                            : 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-lg shadow-white/5'
                                    }`}
                                >
                                    {isEditing ? <><X size={16} /> Cancel</> : <><Settings size={16} /> Edit Profile</>}
                                </button>
                                <button
                                    onClick={logout}
                                    className="inline-flex items-center gap-2 px-5 h-10 rounded-xl text-sm font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
                                >
                                    <LogOut size={16} /> Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── MEMBERSHIP BADGE ─── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {[
                        { label: 'Membership', value: profileData?.membershipType || 'Premium', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                        { label: 'Expires', value: profileData?.membershipExpiry ? new Date(profileData.membershipExpiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                        { label: 'Sessions', value: attendance.length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    ].map((item, i) => (
                        <div key={i} className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 p-5 flex items-center gap-4 shadow-xl">
                            <div className={`w-11 h-11 ${item.bg} rounded-xl flex items-center justify-center shadow-inner`}>
                                <item.icon size={20} className={item.color} />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{item.label}</p>
                                <p className="text-base font-bold text-white mt-0.5">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ─── TABS + CONTENT ─── */}
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Sidebar tabs */}
                    <div className="lg:w-60 shrink-0">
                        <nav className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-xl overflow-hidden sticky top-24">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveTab(tab.id); if (tab.id !== 'details') setIsEditing(false); }}
                                        className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-bold transition-all border-b border-zinc-800/50 last:border-0 ${
                                            activeTab === tab.id
                                                ? 'bg-gradient-to-r from-orange-500/20 to-transparent text-orange-400 border-r-2 border-r-orange-500'
                                                : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200'
                                        }`}
                                    >
                                        <Icon size={18} className={activeTab === tab.id ? 'text-orange-400' : 'text-zinc-600'} />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab + isEditing}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.18, ease: "easeOut" }}
                            >
                                {/* ── OVERVIEW ── */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        {/* Stats */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Weight', value: profileData?.profile?.weight ? `${profileData.profile.weight} kg` : '—', icon: Weight, color: 'text-orange-400' },
                                                { label: 'Height', value: profileData?.profile?.height ? `${profileData.profile.height} cm` : '—', icon: Ruler, color: 'text-blue-400' },
                                                { label: 'Age', value: profileData?.profile?.age || '—', icon: User, color: 'text-purple-400' },
                                                { label: 'Plans', value: workoutPlans.length, icon: Dumbbell, color: 'text-emerald-400' },
                                            ].map((s, i) => (
                                                <div key={i} className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 p-6 shadow-xl group hover:border-zinc-700 transition-all">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{s.label}</p>
                                                        <s.icon size={16} className={`${s.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                                                    </div>
                                                    <p className="text-3xl font-bold text-white tabular-nums">{s.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Goals */}
                                        {profileData?.profile?.goals?.length > 0 && (
                                            <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 p-6 shadow-xl">
                                                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4">Core Objectives</h3>
                                                <div className="flex flex-wrap gap-2.5">
                                                    {profileData.profile.goals.map((g, i) => (
                                                        <span key={i} className="px-4 py-1.5 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl border border-zinc-700/50 shadow-sm">{g}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Recent sessions */}
                                        <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-xl overflow-hidden">
                                            <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
                                                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Recent Activity</h3>
                                                <button onClick={() => setActiveTab('attendance')} className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1.5 transition-colors group">
                                                    History <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                                </button>
                                            </div>
                                            <div className="divide-y divide-zinc-800/50">
                                                {attendance.length > 0 ? attendance.slice(0, 5).map((record, i) => (
                                                    <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-zinc-800/30 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center ring-1 ring-emerald-500/20">
                                                                <CheckCircle2 size={18} className="text-emerald-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                                                <p className="text-xs text-zinc-500 mt-0.5 font-medium">Checked in at {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-tighter ring-1 ring-emerald-500/20">Confirmed</span>
                                                    </div>
                                                )) : (
                                                    <div className="px-6 py-12 text-center">
                                                        <Activity size={32} className="mx-auto text-zinc-800 mb-3" />
                                                        <p className="text-sm font-bold text-zinc-600 tracking-tight">No sessions logged yet.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── PROFILE / EDIT ── */}
                                {activeTab === 'details' && (
                                    <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-xl overflow-hidden">
                                        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{isEditing ? 'Edit Parameters' : 'User Identity'}</h3>
                                                <p className="text-xs text-zinc-500 mt-1 font-medium">Manage biometric data and contact credentials</p>
                                            </div>
                                            {!isEditing && (
                                                <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-bold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all border border-zinc-700">
                                                    <Edit3 size={14} /> Update
                                                </button>
                                            )}
                                        </div>

                                        <div className="p-6">
                                            {isEditing ? (
                                                <form onSubmit={handleUpdate} className="space-y-8">
                                                    {/* Basic Info */}
                                                    <section>
                                                        <h4 className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] mb-5">Primary Records</h4>
                                                        <div className="grid md:grid-cols-2 gap-5">
                                                            <InputField label="Display Name" icon={User} value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="Your name" />
                                                            <InputField label="Identity Email" icon={Mail} value={profileData?.email || ''} disabled />
                                                        </div>
                                                    </section>

                                                    {/* Biometrics */}
                                                    <section>
                                                        <h4 className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] mb-5">Biometric Stats</h4>
                                                        <div className="grid grid-cols-3 gap-5">
                                                            <InputField label="Age (Y)" icon={Calendar} type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
                                                            <InputField label="Mass (KG)" icon={Weight} type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
                                                            <InputField label="Height (CM)" icon={Ruler} type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} />
                                                        </div>
                                                    </section>

                                                    {/* Contact */}
                                                    <section>
                                                        <h4 className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] mb-5">Communications</h4>
                                                        <div className="grid md:grid-cols-2 gap-5">
                                                            <InputField label="Signal Number" icon={Phone} type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="+1 (000) 000-0000" />
                                                            <InputField label="Base Location" icon={MapPin} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="City, Country" />
                                                        </div>
                                                    </section>

                                                    {/* Health */}
                                                    <section>
                                                        <h4 className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] mb-5">Strategic Goals</h4>
                                                        <div className="space-y-5">
                                                            <InputField label="Target Milestones (comma-separated)" value={formData.goals} onChange={(e) => setFormData({ ...formData, goals: e.target.value })} placeholder="e.g. Hypertrophy, Fat Loss, Powerlifting" />
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-bold text-zinc-400">Medical Intelligence</label>
                                                                <textarea
                                                                    value={formData.medicalNotes}
                                                                    onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                                                                    placeholder="Specify any restrictions, past injuries, or critical health data..."
                                                                    rows={3}
                                                                    className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all resize-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    </section>

                                                    {/* Emergency Contact */}
                                                    <section>
                                                        <h4 className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] mb-5">Emergency Protocols</h4>
                                                        <div className="grid md:grid-cols-3 gap-5">
                                                            <InputField label="Guardian Name" value={formData.emergencyContactName} onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })} placeholder="Full Name" />
                                                            <InputField label="Relation" value={formData.emergencyContactRelation} onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })} placeholder="Kinship" />
                                                            <InputField label="Contact Signal" icon={Phone} type="tel" value={formData.emergencyContactPhone} onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })} placeholder="Direct line" />
                                                        </div>
                                                    </section>

                                                    <div className="flex gap-4 pt-4">
                                                        <button type="submit" className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-8 h-12 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98]">
                                                            <Save size={18} /> Commit Changes
                                                        </button>
                                                        <button type="button" onClick={() => setIsEditing(false)} className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-8 h-12 bg-zinc-800 text-zinc-300 text-sm font-bold rounded-xl hover:bg-zinc-700 transition-all active:scale-[0.98]">
                                                            <X size={18} /> Discard
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="space-y-10">
                                                    <section>
                                                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">Physiological Stats</h4>
                                                        <div className="grid md:grid-cols-3 gap-4">
                                                            {[
                                                                { label: 'Current Age', value: profileData?.profile?.age ? `${profileData.profile.age} YRS` : 'UNDEFINED', color: 'text-purple-400' },
                                                                { label: 'Total Mass', value: profileData?.profile?.weight ? `${profileData.profile.weight} KG` : 'UNDEFINED', color: 'text-orange-400' },
                                                                { label: 'Verticality', value: profileData?.profile?.height ? `${profileData.profile.height} CM` : 'UNDEFINED', color: 'text-blue-400' },
                                                            ].map((item, i) => (
                                                                <div key={i} className="bg-zinc-800/30 rounded-2xl p-5 border border-zinc-800/50 hover:border-zinc-700 transition-all">
                                                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">{item.label}</p>
                                                                    <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </section>

                                                    <section>
                                                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">Contact Channels</h4>
                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            {[
                                                                { label: 'Verified Signal', value: profileData?.phoneNumber || 'NOT PROVIDED', icon: Phone },
                                                                { label: 'Primary Base', value: profileData?.address || 'NOT PROVIDED', icon: MapPin },
                                                            ].map((item, i) => (
                                                                <div key={i} className="flex items-start gap-4 p-5 bg-zinc-800/30 rounded-2xl border border-zinc-800/50">
                                                                    <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0 border border-zinc-700">
                                                                        <item.icon size={18} className="text-zinc-500" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">{item.label}</p>
                                                                        <p className="text-sm text-zinc-200 font-bold leading-relaxed">{item.value}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </section>

                                                    {profileData?.profile?.goals?.length > 0 && (
                                                        <section>
                                                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">Strategic Focus</h4>
                                                            <div className="flex flex-wrap gap-2.5">
                                                                {profileData.profile.goals.map((g, i) => (
                                                                    <span key={i} className="px-5 py-2 bg-zinc-100 text-zinc-950 text-xs font-bold rounded-xl shadow-lg shadow-white/5">{g}</span>
                                                                ))}
                                                            </div>
                                                        </section>
                                                    )}

                                                    {profileData?.medicalNotes && (
                                                        <section>
                                                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">Health Intelligence</h4>
                                                            <div className="flex items-start gap-4 p-5 bg-orange-500/5 border border-orange-500/20 rounded-2xl backdrop-blur-sm">
                                                                <AlertCircle size={20} className="text-orange-500 mt-0.5 shrink-0" />
                                                                <p className="text-sm text-orange-200/80 font-medium leading-relaxed">{profileData.medicalNotes}</p>
                                                            </div>
                                                        </section>
                                                    )}

                                                    {profileData?.emergencyContact?.name && (
                                                        <section>
                                                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">Emergency Protocols</h4>
                                                            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                                                                            <Shield size={22} className="text-red-400" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-base font-bold text-white tracking-tight">{profileData.emergencyContact.name}</p>
                                                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{profileData.emergencyContact.relation}</p>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-sm font-black text-white bg-zinc-800 px-4 py-1.5 rounded-xl border border-zinc-700">{profileData.emergencyContact.phone}</p>
                                                                </div>
                                                            </div>
                                                        </section>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}



                                {/* ── ATTENDANCE ── */}
                                {activeTab === 'attendance' && (
                                    <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-xl overflow-hidden">
                                        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Deployment Logs</h3>
                                                <p className="text-xs text-zinc-500 mt-1 font-medium">{attendance.length} total operational cycles</p>
                                            </div>
                                        </div>
                                        {attendance.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead className="bg-zinc-900/60 border-b border-zinc-800">
                                                        <tr>
                                                            {['Cycle Date', 'Check-In', 'Check-Out', 'Status'].map(h => (
                                                                <th key={h} className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.1em]">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-zinc-800/50">
                                                        {attendance.map((record, i) => (
                                                            <tr key={record._id} className="hover:bg-zinc-800/20 transition-all">
                                                                <td className="px-6 py-4 text-sm font-bold text-white">
                                                                    {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-zinc-400 font-mono tracking-tighter">
                                                                    {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-zinc-400 font-mono tracking-tighter">
                                                                    {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span className="text-orange-500 font-black text-[10px] uppercase animate-pulse">Operational</span>}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20">
                                                                        <CheckCircle2 size={12} /> Present
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="p-16 text-center">
                                                <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-zinc-700">
                                                    <Calendar size={28} className="text-zinc-600" />
                                                </div>
                                                <p className="text-base font-bold text-zinc-300">No session logs detected</p>
                                                <p className="text-xs text-zinc-500 mt-2 font-medium">Begin physical deployment at the facility to generate logs.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── BILLING ── */}
                                {activeTab === 'payments' && (
                                    <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-xl overflow-hidden">
                                        <div className="px-6 py-5 border-b border-zinc-800">
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Credit Protocols</h3>
                                            <p className="text-xs text-zinc-500 mt-1 font-medium">{payments.length} financial transaction{payments.length !== 1 ? 's' : ''} authorized</p>
                                        </div>
                                        <div className="divide-y divide-zinc-800/50">
                                            {payments.length > 0 ? payments.map((payment, i) => (
                                                <motion.div key={payment._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                                    className="px-6 py-5 flex items-center justify-between hover:bg-zinc-800/20 transition-all">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-11 h-11 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
                                                            <CreditCard size={20} className="text-zinc-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white tracking-tight">{payment.plan?.name || 'Membership Token Renewal'}</p>
                                                            <p className="text-[10px] text-zinc-500 mt-1 font-bold uppercase tracking-wider">
                                                                {new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                {payment.method && ` · ${payment.method}`}
                                                                {payment.invoiceNumber && <span className="ml-2 font-mono text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">ID:{payment.invoiceNumber}</span>}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <p className="text-lg font-black text-white tabular-nums">${payment.amount}</p>
                                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                                                            payment.status === 'completed'
                                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                                                        }`}>
                                                            {payment.status === 'completed' ? 'Settled' : payment.status}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            )) : (
                                                <div className="p-16 text-center">
                                                    <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-zinc-700">
                                                        <CreditCard size={28} className="text-zinc-600" />
                                                    </div>
                                                    <p className="text-base font-bold text-zinc-300">No transaction history</p>
                                                    <p className="text-xs text-zinc-500 mt-2 font-medium">Your billing intelligence will populate upon credit deployment.</p>
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
