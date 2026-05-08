import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';
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
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
        <div className={`relative flex items-center ${disabled ? 'opacity-50' : ''}`}>
            {Icon && <Icon size={16} className="absolute left-3 text-orange-500/70" />}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full h-11 ${Icon ? 'pl-10' : 'pl-4'} pr-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed`}
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

    const [formData, setFormData] = useState({
        username: '', age: '', weight: '', height: '', goals: '',
        phoneNumber: '', address: '', medicalNotes: '',
        emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: ''
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
        const loadToast = toast.loading("Syncing profile data...");
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
            toast.success("Profile updated successfully", { id: loadToast });
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed", { id: loadToast });
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-gray-400 text-sm font-semibold tracking-widest uppercase">Initializing Profile</p>
            </div>
        </div>
    );

    const tabs = [
        { id: 'overview', name: 'Overview', icon: Activity },
        { id: 'details', name: 'Identity', icon: User },
        { id: 'attendance', name: 'Activity', icon: Calendar },
        { id: 'payments', name: 'Financials', icon: CreditCard },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 pt-28">
            <div className="max-w-6xl mx-auto px-6">
                <Logo className="mb-8" />

                {/* ─── PREMIUM HEADER ─── */}
                <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm mb-10 overflow-hidden relative">
                    <div className="h-40 bg-orange-gradient opacity-10 absolute top-0 left-0 right-0" />
                    <div className="px-10 pb-8 pt-10 relative z-10">
                        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
                                {/* Avatar */}
                                <div className="relative group">
                                    <div className="w-36 h-36 rounded-3xl border-8 border-white shadow-2xl bg-gray-50 overflow-hidden flex items-center justify-center">
                                        {previewImage
                                            ? <img src={previewImage} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                            : <span className="text-5xl font-black text-orange-500">{profileData?.username?.charAt(0)?.toUpperCase()}</span>
                                        }
                                    </div>
                                    <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-xl transition-all transform hover:scale-110 active:scale-95 border-4 border-white">
                                        <Camera size={18} />
                                        <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                                    </label>
                                </div>

                                <div className="text-center md:text-left mb-2">
                                    <div className="flex flex-col md:flex-row items-center gap-4">
                                        <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">{profileData?.username || 'Member'}</h1>
                                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest ${
                                            profileData?.status === 'active'
                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}>
                                            {profileData?.status === 'active' ? 'Active Status' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 mt-4">
                                        <span className="flex items-center gap-2 text-sm text-gray-500 font-semibold"><Mail size={16} className="text-orange-500" />{profileData?.email}</span>
                                        <span className="flex items-center gap-2 text-sm text-gray-500 font-semibold"><Shield size={16} className="text-orange-500" />ID: #{profileData?.memberId || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-2 w-full md:w-auto">
                                <button
                                    onClick={() => { setIsEditing(!isEditing); if (!isEditing) setActiveTab('details'); }}
                                    className={`flex-1 md:flex-none h-12 px-6 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                        isEditing
                                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            : 'bg-orange-50 text-orange-500 hover:bg-orange-100 border border-orange-200/50'
                                    }`}
                                >
                                    {isEditing ? <><X size={18} /> Cancel</> : <><Settings size={18} /> Settings</>}
                                </button>
                                <button
                                    onClick={logout}
                                    className="h-12 w-12 rounded-2xl bg-gray-50 text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition-all border border-gray-100 flex items-center justify-center"
                                    title="Sign out"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── DASHBOARD LAYOUT ─── */}
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Navigation Sidebar */}
                    <aside className="lg:w-72 shrink-0">
                        <nav className="bg-white p-3 rounded-[2rem] border border-gray-200 shadow-sm space-y-2 sticky top-28">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveTab(tab.id); if (tab.id !== 'details') setIsEditing(false); }}
                                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-bold transition-all ${
                                            isActive
                                                ? 'bg-orange-gradient text-white shadow-lg shadow-orange-500/20'
                                                : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-orange-50 text-orange-500'}`}>
                                            <Icon size={18} />
                                        </div>
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Membership Summary Card */}
                        <div className="mt-8 bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Plan Intelligence</h4>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500"><Zap size={18} /></div>
                                        <span className="text-sm font-bold text-gray-900">{profileData?.membershipType || 'Standard'}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500"><Clock size={18} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Expires</p>
                                            <p className="text-sm font-bold text-gray-900">{profileData?.membershipExpiry ? new Date(profileData.membershipExpiry).toLocaleDateString() : 'Active'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full mt-8 py-4 bg-orange-gradient text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                Upgrade Plan
                            </button>
                        </div>
                    </aside>

                    {/* Main Workspace */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab + isEditing}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                            >
                                {/* ── OVERVIEW ── */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-8">
                                        {/* Core Biometrics */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            {[
                                                { label: 'Body Mass', value: profileData?.profile?.weight ? `${profileData.profile.weight} KG` : '—', icon: Weight },
                                                { label: 'Stature', value: profileData?.profile?.height ? `${profileData.profile.height} CM` : '—', icon: Ruler },
                                                { label: 'Life Cycle', value: profileData?.profile?.age ? `${profileData.profile.age} Yrs` : '—', icon: User },
                                                { label: 'Deployments', value: attendance.length, icon: Activity },
                                            ].map((s, i) => (
                                                <div key={i} className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm group hover:border-orange-500 transition-all duration-300">
                                                    <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                                        <s.icon size={22} />
                                                    </div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                                                    <p className="text-3xl font-black text-gray-900 tracking-tighter">{s.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Objectives */}
                                        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                                            <div className="flex items-center justify-between mb-8">
                                                <h3 className="text-base font-black text-gray-900 tracking-tight">Active Objectives</h3>
                                                <TrendingUp size={20} className="text-orange-500" />
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {profileData?.profile?.goals?.length > 0 ? profileData.profile.goals.map((g, i) => (
                                                    <span key={i} className="px-6 py-3 bg-orange-50 text-orange-600 text-xs font-bold rounded-2xl border border-orange-100">{g}</span>
                                                )) : (
                                                    <p className="text-sm text-gray-400 font-medium italic">No objectives defined. Update profile to add goals.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Recent Operational Logs */}
                                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                                            <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between">
                                                <h3 className="text-base font-black text-gray-900">Operational History</h3>
                                                <button onClick={() => setActiveTab('attendance')} className="text-xs font-bold text-orange-500 hover:underline flex items-center gap-1">
                                                    Full Logs <ChevronRight size={14} />
                                                </button>
                                            </div>
                                            <div className="divide-y divide-gray-50">
                                                {attendance.length > 0 ? attendance.slice(0, 5).map((record, i) => (
                                                    <div key={i} className="px-10 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center font-black">
                                                                {new Date(record.date).getDate()}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Deployment Start: {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                            </div>
                                                        </div>
                                                        <div className="px-4 py-1.5 bg-orange-50 text-orange-500 text-[10px] font-black uppercase rounded-full">Success</div>
                                                    </div>
                                                )) : (
                                                    <div className="p-20 text-center">
                                                        <Activity size={48} className="mx-auto text-orange-100 mb-4" />
                                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No activity records found</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── PROFILE EDIT ── */}
                                {activeTab === 'details' && (
                                    <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="px-10 py-8 border-b border-gray-50">
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight">{isEditing ? 'Configuration' : 'Identity Profile'}</h3>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Personnel data Management</p>
                                        </div>

                                        <div className="p-10">
                                            {isEditing ? (
                                                <form onSubmit={handleUpdate} className="space-y-12">
                                                    <div className="grid md:grid-cols-2 gap-8">
                                                        <InputField label="Display Identifier" icon={User} value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                                                        <InputField label="Primary Email" icon={Mail} value={profileData?.email || ''} disabled />
                                                    </div>

                                                    <div className="space-y-6">
                                                        <h4 className="text-xs font-black text-orange-500 uppercase tracking-[0.2em]">Biometric Parameters</h4>
                                                        <div className="grid grid-cols-3 gap-6">
                                                            <InputField label="Age (Y)" icon={Calendar} type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
                                                            <InputField label="Weight (KG)" icon={Weight} type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
                                                            <InputField label="Height (CM)" icon={Ruler} type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <h4 className="text-xs font-black text-orange-500 uppercase tracking-[0.2em]">Communication Node</h4>
                                                        <div className="grid md:grid-cols-2 gap-6">
                                                            <InputField label="Signal Frequency" icon={Phone} type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="+00 0000 0000" />
                                                            <InputField label="Physical Base" icon={MapPin} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="City, State" />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <h4 className="text-xs font-black text-orange-500 uppercase tracking-[0.2em]">Operational Intelligence</h4>
                                                        <div className="space-y-6">
                                                            <InputField label="Strategic Goals (comma-delimited)" value={formData.goals} onChange={(e) => setFormData({ ...formData, goals: e.target.value })} placeholder="Power, Agility, Endurance" />
                                                            <div className="space-y-3">
                                                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Medical Logs</label>
                                                                <textarea
                                                                    value={formData.medicalNotes}
                                                                    onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                                                                    placeholder="Enter medical restrictions or critical health intelligence..."
                                                                    rows={4}
                                                                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all resize-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <h4 className="text-xs font-black text-orange-500 uppercase tracking-[0.2em]">Emergency Override</h4>
                                                        <div className="grid md:grid-cols-3 gap-6">
                                                            <InputField label="Liaison Name" value={formData.emergencyContactName} onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })} />
                                                            <InputField label="Kinship" value={formData.emergencyContactRelation} onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })} />
                                                            <InputField label="Signal Node" icon={Phone} value={formData.emergencyContactPhone} onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })} />
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-4 pt-6 border-t border-gray-100">
                                                        <button type="submit" className="flex-1 h-14 bg-orange-gradient text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                                            Apply Changes
                                                        </button>
                                                        <button type="button" onClick={() => setIsEditing(false)} className="px-10 h-14 bg-gray-100 text-gray-500 text-sm font-bold rounded-2xl hover:bg-gray-200 transition-all">
                                                            Discard
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="space-y-12">
                                                    <div className="grid md:grid-cols-3 gap-8">
                                                        {[
                                                            { label: 'Chrono Age', value: profileData?.profile?.age ? `${profileData.profile.age} Years` : 'Unknown', color: 'bg-orange-50 text-orange-500' },
                                                            { label: 'Current Mass', value: profileData?.profile?.weight ? `${profileData.profile.weight} KG` : 'Unknown', color: 'bg-orange-50 text-orange-500' },
                                                            { label: 'Vertical Stature', value: profileData?.profile?.height ? `${profileData.profile.height} CM` : 'Unknown', color: 'bg-orange-50 text-orange-500' },
                                                        ].map((item, i) => (
                                                            <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:border-orange-200 transition-all">
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{item.label}</p>
                                                                <p className="text-2xl font-black text-gray-900">{item.value}</p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-8">
                                                        {[
                                                            { label: 'Signal Endpoint', value: profileData?.phoneNumber || 'None Established', icon: Phone },
                                                            { label: 'Base Deployment', value: profileData?.address || 'None Established', icon: MapPin },
                                                        ].map((item, i) => (
                                                            <div key={i} className="flex items-center gap-6 p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
                                                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-orange-500">
                                                                    <item.icon size={24} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                                                                    <p className="text-base font-bold text-gray-900">{item.value}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {profileData?.medicalNotes && (
                                                        <div className="bg-orange-50 border border-orange-100 rounded-3xl p-8">
                                                            <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2"><AlertCircle size={14} /> Medical Intelligence</h4>
                                                            <p className="text-gray-700 text-sm font-bold leading-relaxed">{profileData.medicalNotes}</p>
                                                        </div>
                                                    )}

                                                    {profileData?.emergencyContact?.name && (
                                                        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Emergency Override</h4>
                                                            <div className="flex items-center justify-between gap-6">
                                                                <div className="flex items-center gap-6">
                                                                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-200">
                                                                        <Shield size={28} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-lg font-black text-gray-900 tracking-tight">{profileData.emergencyContact.name}</p>
                                                                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-1">{profileData.emergencyContact.relation}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="px-6 py-2 bg-gray-900 text-white text-sm font-black rounded-xl tracking-wider">{profileData.emergencyContact.phone}</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── ATTENDANCE ── */}
                                {activeTab === 'attendance' && (
                                    <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Deployment Logs</h3>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{attendance.length} Operational cycles completed</p>
                                            </div>
                                        </div>
                                        {attendance.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                                            {['Cycle Date', 'Check-In', 'Check-Out', 'Outcome'].map(h => (
                                                                <th key={h} className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {attendance.map((record) => (
                                                            <tr key={record._id} className="hover:bg-gray-50/50 transition-all">
                                                                <td className="px-10 py-6 text-sm font-bold text-gray-900">
                                                                    {new Date(record.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                                </td>
                                                                <td className="px-10 py-6 text-sm text-gray-600 font-black">
                                                                    {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </td>
                                                                <td className="px-10 py-6 text-sm text-gray-600 font-black">
                                                                    {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span className="text-orange-500 uppercase animate-pulse">In Progress</span>}
                                                                </td>
                                                                <td className="px-10 py-6">
                                                                    <span className="inline-flex items-center gap-1.5 px-4 py-1 bg-orange-50 text-orange-500 text-[10px] font-black uppercase rounded-full border border-orange-100">
                                                                        Confirmed
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="p-24 text-center">
                                                <Calendar size={64} className="mx-auto text-orange-100 mb-6" />
                                                <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No operational records</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── BILLING ── */}
                                {activeTab === 'payments' && (
                                    <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="px-10 py-8 border-b border-gray-50">
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Financial Records</h3>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{payments.length} Validated transactions</p>
                                        </div>
                                        <div className="divide-y divide-gray-50">
                                            {payments.length > 0 ? payments.map((payment, i) => (
                                                <div key={payment._id} className="px-10 py-8 flex items-center justify-between hover:bg-gray-50 transition-all">
                                                    <div className="flex items-center gap-8">
                                                        <div className="w-16 h-16 bg-orange-50 rounded-[1.5rem] flex items-center justify-center text-orange-500 border border-orange-100">
                                                            <CreditCard size={28} />
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-black text-gray-900 tracking-tight">{payment.plan?.name || 'Protocol Renewal'}</p>
                                                            <p className="text-[10px] text-gray-400 mt-1 font-black uppercase tracking-widest">
                                                                {new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                {payment.invoiceNumber && <span className="ml-4 text-orange-500">ID: {payment.invoiceNumber}</span>}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-3xl font-black text-gray-900 leading-none mb-2">₹{payment.amount}</p>
                                                        <span className="px-4 py-1 bg-orange-500 text-white text-[10px] font-black uppercase rounded-full shadow-lg shadow-orange-500/20">Success</span>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="p-24 text-center">
                                                    <CreditCard size={64} className="mx-auto text-orange-100 mb-6" />
                                                    <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No transaction history</p>
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
