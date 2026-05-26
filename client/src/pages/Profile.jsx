import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Calendar, Activity, Save, Ruler, Weight, Phone, Map,
    Shield, CreditCard, CheckCircle2, ChevronRight, Camera, LogOut,
    TrendingUp, Clock, Info, Zap, ArrowRight, Star, HeartPulse, Award, Flame
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const InputField = ({ label, icon: Icon, type = 'text', value, onChange, placeholder, disabled }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{label}</label>
        <div className={`relative flex items-center ${disabled ? 'opacity-65' : ''}`}>
            {Icon && <Icon size={16} className="absolute left-4 text-orange-500" />}
            <input
                type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
                className={`w-full h-12 ${Icon ? 'pl-11' : 'pl-5'} pr-5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all disabled:cursor-not-allowed`}
            />
        </div>
    </div>
);

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isEditing, setIsEditing] = useState(false);
    const [attendance, setAttendance] = useState([]);
    const [payments, setPayments] = useState([]);
    const [formData, setFormData] = useState({
        username: '', age: '', weight: '', height: '', goals: '',
        phoneNumber: '', address: '', medicalNotes: '',
        emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: ''
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [markingAttendance, setMarkingAttendance] = useState(false);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchInitialData();
    }, [user, navigate]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [profileRes, attRes, payRes] = await Promise.all([
                api.get('/users/profile'),
                api.get('/attendance/me'),
                api.get('/payments/my-history')
            ]);
            const data = profileRes.data;
            setProfileData(data);
            setAttendance(attRes.data);
            setPayments(payRes.data);
            setFormData({
                username: data.username || '', age: data.profile?.age || '', weight: data.profile?.weight || '',
                height: data.profile?.height || '', goals: data.profile?.goals ? data.profile.goals.join(', ') : '',
                phoneNumber: data.phoneNumber || '', address: data.address || '', medicalNotes: data.medicalNotes || '',
                emergencyContactName: data.emergencyContact?.name || '', emergencyContactPhone: data.emergencyContact?.phone || '',
                emergencyContactRelation: data.emergencyContact?.relation || ''
            });
            if (data.profilePhoto) {
                const serverUrl = import.meta.env.VITE_API_URL || '';
                setPreviewImage(data.profilePhoto.startsWith('http') ? data.profilePhoto : `${serverUrl}${data.profilePhoto}`);
            }
        } catch (error) {
            console.error("Profile data sync failed", error);
        } finally { setLoading(false); }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const loadToast = toast.loading("Saving profile...");
        try {
            const goalsArray = formData.goals.split(',').map(g => g.trim()).filter(g => g);
            const fd = new FormData();
            fd.append('username', formData.username);
            fd.append('profile', JSON.stringify({
                age: Number(formData.age),
                weight: Number(formData.weight),
                height: Number(formData.height),
                goals: goalsArray
            }));
            fd.append('phoneNumber', formData.phoneNumber);
            fd.append('address', formData.address);
            fd.append('medicalNotes', formData.medicalNotes);
            fd.append('emergencyContact', JSON.stringify({
                name: formData.emergencyContactName,
                phone: formData.emergencyContactPhone,
                relation: formData.emergencyContactRelation
            }));
            if (selectedFile) fd.append('profilePhoto', selectedFile);

            const { data } = await api.put('/users/profile', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfileData(data);
            setIsEditing(false);
            toast.success("Profile updated", { id: loadToast });
        } catch {
            toast.error("Update failed", { id: loadToast });
        }
    };

    const handleMarkAttendance = async () => {
        setMarkingAttendance(true);
        try {
            const res = await api.post('/attendance/self-check-in');
            if (res.data?.alreadyCheckedIn) {
                toast('Already checked in today! ✅', { icon: '📋' });
            } else {
                toast.success(res.data?.message || 'Attendance marked! 💪');
            }
            // Refresh attendance list
            const attRes = await api.get('/attendance/me');
            setAttendance(attRes.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to mark attendance');
        } finally {
            setMarkingAttendance(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Syncing Intelligence...</p>
            </div>
        </div>
    );

    const bmi = profileData?.profile?.weight && profileData?.profile?.height
        ? (profileData.profile.weight / ((profileData.profile.height / 100) ** 2)).toFixed(1)
        : null;

    const getBmiCategory = (val) => {
        if (!val) return { label: 'Unknown', color: 'text-gray-400' };
        const num = parseFloat(val);
        if (num < 18.5) return { label: 'Underweight', color: 'text-amber-500' };
        if (num < 25) return { label: 'Optimal BMI', color: 'text-emerald-500' };
        if (num < 30) return { label: 'Overweight', color: 'text-orange-500' };
        return { label: 'Extreme BMI', color: 'text-red-500' };
    };

    const bmiInfo = getBmiCategory(bmi);

    const todayCheckedIn = attendance.some(a => {
        const d = new Date(a.checkIn || a.date);
        const today = new Date();
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    });

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Activity },
        { id: 'account', label: 'Identity', icon: User },
        { id: 'history', label: 'Activities', icon: Calendar },
        { id: 'billing', label: 'Payments', icon: CreditCard },
    ];

    // Membership Progress Indicator
    const expiry = new Date(profileData?.membershipExpiry || Date.now() + 2592000000);
    const start = new Date(profileData?.createdAt || Date.now() - 2592000000);
    const totalDuration = expiry.getTime() - start.getTime();
    const timeElapsed = Date.now() - start.getTime();
    const progressPercent = Math.min(100, Math.max(0, Math.round((timeElapsed / totalDuration) * 100)));

    return (
        <div className="min-h-screen bg-[#f4f5f7] pt-28 pb-20">
            <div className="max-w-6xl mx-auto px-4 md:px-6">

                {/* ADVANCED PROFILE HEADER BLOCK */}
                <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-lg shadow-gray-200/50 mb-8 relative">
                    {/* Glowing Mesh Cover Design */}
                    <div className="h-40 bg-gradient-to-r from-gray-900 to-gray-800 relative overflow-hidden flex items-center px-8">
                        <div className="absolute inset-0 opacity-15" style={{
                            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(249, 115, 22, 0.4) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(249, 115, 22, 0.3) 0%, transparent 50%)`
                        }} />
                        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-orange-500/10 blur-2xl animate-pulse" />
                    </div>

                    {/* Meta Profile Card details */}
                    <div className="px-6 md:px-8 pb-8 -mt-6 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 relative z-10">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                            {/* Avatar Double Frame */}
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-3xl bg-white border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center ring-1 ring-gray-200">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Profile" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                                            <span className="text-4xl font-black text-white">{profileData?.username?.charAt(0)?.toUpperCase()}</span>
                                        </div>
                                    )}
                                </div>
                                <label className="absolute -bottom-1 -right-1 w-9 h-9 bg-orange-500 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-lg hover:bg-orange-600 hover:scale-105 transition-all border-2 border-white">
                                    <Camera size={15} />
                                    <input type="file" onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setSelectedFile(file);
                                            const r = new FileReader();
                                            r.onloadend = () => setPreviewImage(r.result);
                                            r.readAsDataURL(file);
                                        }
                                    }} className="hidden" accept="image/*" />
                                </label>
                            </div>

                            {/* User details */}
                            <div className="text-center md:text-left pb-2">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                                    <span className="text-[10px] font-black text-white uppercase bg-orange-500 px-2 py-0.5 rounded shadow-sm">ATHLETE</span>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">#{profileData?.memberId || 'CORE-ID'}</span>
                                </div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-tight mb-2">{profileData?.username || 'Member'}</h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
                                        <Shield size={12} className="text-orange-500" /> Premium Member
                                    </span>
                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Account
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Top Right Action Tools */}
                        <div className="flex gap-3">
                            {/* Mark Attendance */}
                            <button
                                onClick={handleMarkAttendance}
                                disabled={markingAttendance}
                                className={`h-12 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md active:translate-y-0 flex items-center gap-2 ${
                                    todayCheckedIn
                                        ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600'
                                        : 'bg-orange-500 text-white shadow-orange-500/20 hover:bg-orange-600 hover:translate-y-[-1px]'
                                }`}
                            >
                                {markingAttendance ? (
                                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Marking...</>
                                ) : todayCheckedIn ? (
                                    <><CheckCircle2 size={15} /> Checked In ✓</>
                                ) : (
                                    <><Activity size={15} /> Mark Attendance</>
                                )}
                            </button>
                            <button
                                onClick={() => { setIsEditing(!isEditing); setActiveTab('account'); }}
                                className="h-12 px-6 rounded-2xl bg-gray-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md shadow-gray-900/10 hover:translate-y-[-1px] active:translate-y-0"
                            >
                                {isEditing ? 'Cancel Edit' : 'Modify Bio'}
                            </button>
                            <button
                                onClick={logout}
                                className="h-12 w-12 rounded-2xl bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all flex items-center justify-center hover:scale-105 active:scale-95 shadow-sm"
                                title="Sign Out"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEADERBOARD/NAV SIDEBAR */}
                    <aside className="lg:w-64 shrink-0 space-y-6">
                        {/* Tab Navigator */}
                        <nav className="bg-white border border-gray-200 rounded-3xl p-2.5 shadow-sm space-y-1">
                            {menuItems.map(item => {
                                const Icon = item.icon;
                                const active = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => { setActiveTab(item.id); setIsEditing(false); }}
                                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                            active
                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon size={16} />
                                            <span>{item.label}</span>
                                        </div>
                                        <ChevronRight size={12} className={`opacity-60 transition-transform ${active ? 'rotate-90' : ''}`} />
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Subscription Ring Widget */}
                        <div className="bg-gray-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-gray-900/10">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={72} /></div>
                            <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-3">Subscription Status</h4>
                            <p className="text-xl font-black mb-1 uppercase tracking-tight">{profileData?.membershipType || 'Standard Plan'}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-5">Valid Until: {expiry.toLocaleDateString()}</p>

                            {/* Linear Duration Bar */}
                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-[9px] font-black uppercase text-gray-400 tracking-wider">
                                    <span>Time Used</span>
                                    <span>{progressPercent}%</span>
                                </div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                                </div>
                            </div>

                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all">
                                Manage Subscription
                            </button>
                        </div>
                    </aside>

                    {/* MAIN CONSOLE */}
                    <main className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab + isEditing}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* DASHBOARD VIEW */}
                                {activeTab === 'dashboard' && (
                                    <div className="space-y-6">
                                        {/* Dynamic Stats Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Weight', value: profileData?.profile?.weight ? `${profileData.profile.weight} KG` : '--', icon: Weight, change: 'Target base' },
                                                { label: 'Height', value: profileData?.profile?.height ? `${profileData.profile.height} CM` : '--', icon: Ruler, change: 'Stature' },
                                                { label: 'BMI Analysis', value: bmi || 'N/A', icon: HeartPulse, change: bmiInfo.label, highlight: bmiInfo.color },
                                                { label: 'Attendance', value: attendance.length, icon: Calendar, change: 'Sessions logged' },
                                            ].map((s, i) => (
                                                <div key={i} className="bg-white border border-gray-200 rounded-3xl p-5 hover:shadow-xl hover:border-gray-300 transition-all duration-300 flex flex-col justify-between min-h-[140px] shadow-sm">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shadow-sm">
                                                            <s.icon size={18} />
                                                        </div>
                                                        {s.highlight ? (
                                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded bg-gray-50 border border-gray-100 ${s.highlight}`}>{s.change}</span>
                                                        ) : (
                                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{s.change}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                                                        <p className="text-2xl font-black text-gray-900 tracking-tight leading-none">{s.value}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Metabolic & Biometric Target Card */}
                                        {bmi && (
                                            <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                                                <div className="space-y-2 text-center md:text-left">
                                                    <div className="flex items-center justify-center md:justify-start gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                                                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em]">Metabolic Diagnostic</span>
                                                    </div>
                                                    <h3 className="text-xl font-black text-gray-900 uppercase">BMI Profile Index: {bmi}</h3>
                                                    <p className="text-xs text-gray-400 font-medium max-w-md">Your Body Mass Index is verified in the <span className={`font-black ${bmiInfo.color}`}>{bmiInfo.label}</span> tier. CoreX systems calibrated your nutrition targets based on this biometrical index.</p>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0 p-1.5 bg-gray-50 border border-gray-100 rounded-2xl">
                                                    <span className={`px-4 py-2 text-xs font-black uppercase rounded-xl tracking-wider bg-white shadow-sm border ${bmiInfo.color}`}>{bmiInfo.label}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Goals Panel */}
                                        <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-7 shadow-sm">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-2">
                                                    <Award size={18} className="text-orange-500" />
                                                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">Assigned Objectives</h3>
                                                </div>
                                                <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 border border-orange-100 px-2 py-1 rounded-md">Real-time Sync</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2.5">
                                                {profileData?.profile?.goals?.length > 0 ? (
                                                    profileData.profile.goals.map((g, i) => (
                                                        <span key={i} className="px-5 py-3 bg-gray-900 text-white text-[11px] font-black uppercase rounded-xl tracking-widest flex items-center gap-2 hover:scale-[1.02] transition-transform shadow-sm">
                                                            <Flame size={12} className="text-orange-400 animate-pulse" /> {g}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <div className="text-center w-full py-6">
                                                        <p className="text-xs text-gray-400 font-medium mb-3">No targets set. Update your profile bio to input objective targets.</p>
                                                        <button onClick={() => { setIsEditing(true); setActiveTab('account'); }} className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:opacity-75">Modify Targets ↗</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Session Timeline logs */}
                                        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/20">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-orange-500" />
                                                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">Activity Streams</h3>
                                                </div>
                                                <button onClick={() => setActiveTab('history')} className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1.5 hover:opacity-75">
                                                    All History <ArrowRight size={12} />
                                                </button>
                                            </div>
                                            <div className="divide-y divide-gray-100">
                                                {attendance.slice(0, 3).map((record, i) => (
                                                    <div key={i} className="px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-gradient-to-tr from-orange-500 to-amber-500 text-white rounded-2xl flex items-center justify-center font-black text-base shadow-md shadow-orange-500/10">
                                                                {new Date(record.date).getDate()}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-gray-900 uppercase tracking-tight">
                                                                    {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                                                </p>
                                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.15em] mt-1 flex items-center gap-1.5">
                                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> {record.checkOut ? 'Completed' : 'Session Active'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="px-3 py-1.5 rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest">Verified</span>
                                                    </div>
                                                ))}
                                                {attendance.length === 0 && (
                                                    <div className="p-16 text-center">
                                                        <Activity size={32} className="mx-auto mb-4 text-gray-200" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No active activity records</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* IDENTITY EDIT / VIEW */}
                                {activeTab === 'account' && (
                                    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">{isEditing ? 'Modify Personal Info' : 'Core Biometrics'}</h3>
                                            {!isEditing && (
                                                <button onClick={() => setIsEditing(true)} className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Edit Bio</button>
                                            )}
                                        </div>
                                        <div className="p-8">
                                            {isEditing ? (
                                                <form onSubmit={handleUpdate} className="space-y-8">
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <InputField label="Username" icon={User} value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                                                        <InputField label="Primary Email" icon={Mail} value={profileData?.email || ''} disabled />
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-6">
                                                        <InputField label="Age" type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
                                                        <InputField label="Weight (KG)" type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
                                                        <InputField label="Height (CM)" type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} />
                                                    </div>
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <InputField label="Contact Number" icon={Phone} value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
                                                        <InputField label="Address" icon={Map} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Goals (comma separated)</label>
                                                        <input className="w-full h-12 px-5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                                                            value={formData.goals} onChange={(e) => setFormData({ ...formData, goals: e.target.value })} placeholder="Hypertrophy, Endurance, Strength" />
                                                    </div>

                                                    {/* Emergency Contact Block */}
                                                    <div className="border-t border-gray-100 pt-6 mt-6">
                                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Emergency Contact (Optional)</h4>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <InputField label="Name" value={formData.emergencyContactName} onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })} />
                                                            <InputField label="Relationship" value={formData.emergencyContactRelation} onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })} />
                                                            <InputField label="Contact Phone" value={formData.emergencyContactPhone} onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })} />
                                                        </div>
                                                    </div>

                                                    <button type="submit" className="w-full h-13 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-orange-500/10">
                                                        Commit Bio Update
                                                    </button>
                                                </form>
                                            ) : (
                                                <div className="space-y-8">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-6">
                                                            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact Protocols</h4>
                                                            <div className="space-y-4">
                                                                {[
                                                                    { icon: Mail, val: profileData?.email, desc: 'Primary Identity Email' },
                                                                    { icon: Phone, val: profileData?.phoneNumber || 'Not set', desc: 'Secure Mobile Line' },
                                                                    { icon: Map, val: profileData?.address || 'Not set', desc: 'Location Address' },
                                                                ].map((item, i) => (
                                                                    <div key={i} className="flex gap-4 hover:translate-x-1 transition-transform">
                                                                        <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0 shadow-sm">
                                                                            <item.icon size={16} />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.desc}</p>
                                                                            <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.val}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-200 shadow-inner flex flex-col justify-between">
                                                            <div>
                                                                <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Current Biometrics</h4>
                                                                <div className="grid grid-cols-2 gap-6">
                                                                    <div>
                                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Body Weight</p>
                                                                        <p className="text-3xl font-black text-gray-900">{profileData?.profile?.weight || '--'} <span className="text-xs text-gray-400">KG</span></p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Height</p>
                                                                        <p className="text-3xl font-black text-gray-900">{profileData?.profile?.height || '--'} <span className="text-xs text-gray-400">CM</span></p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {profileData?.emergencyContact?.name && (
                                                                <div className="border-t border-gray-200 mt-6 pt-5">
                                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">🚨 SOS Contact</p>
                                                                    <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{profileData.emergencyContact.name} ({profileData.emergencyContact.relation || 'Emergency Contact'})</p>
                                                                    <p className="text-xs font-semibold text-gray-500 mt-0.5">{profileData.emergencyContact.phone}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {profileData?.medicalNotes && (
                                                        <div className="p-6 rounded-2xl bg-red-50 border border-red-100 flex gap-4 shadow-sm">
                                                            <Info size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                                                            <div>
                                                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Health Restrictions & Profile Notes</p>
                                                                <p className="text-xs font-bold text-red-700 leading-relaxed italic">{profileData.medicalNotes}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ACTIVITIES HISTORICAL VIEW */}
                                {activeTab === 'history' && (
                                    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/20">
                                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">Session History Logs</h3>
                                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md uppercase">Authorized</span>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-gray-100 bg-gray-50/40">
                                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Check-In Time</th>
                                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Check-Out Time</th>
                                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 text-sm">
                                                    {attendance.slice(0, 10).map(record => (
                                                        <tr key={record._id} className="hover:bg-gray-50/40 transition-colors">
                                                            <td className="px-8 py-4.5 font-bold text-gray-800">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                            <td className="px-8 py-4.5 font-semibold text-gray-600">{new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                                            <td className="px-8 py-4.5 font-semibold text-gray-600">{record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}</td>
                                                            <td className="px-8 py-4.5">
                                                                <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">
                                                                    <CheckCircle2 size={10} /> Checked-In
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {attendance.length === 0 && (
                                                <div className="p-16 text-center">
                                                    <Activity size={32} className="mx-auto mb-4 text-gray-200" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No activities found</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* BILLING HISTORICAL VIEW */}
                                {activeTab === 'billing' && (
                                    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/20">
                                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">Transaction Audits</h3>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {payments.slice(0, 10).map(payment => (
                                                <div key={payment._id} className="px-8 py-5.5 flex items-center justify-between hover:bg-gray-50/50 transition-all">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-500 shadow-sm shrink-0">
                                                            <CreditCard size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{payment.plan?.name || 'RENEWAL PLAN'}</p>
                                                            <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-widest">ID: #{payment._id.slice(-10).toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-black text-gray-900 mb-1">₹{payment.amount}</p>
                                                        <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-black uppercase rounded-lg">Settled</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {payments.length === 0 && (
                                                <div className="p-16 text-center">
                                                    <CreditCard size={32} className="mx-auto mb-4 text-gray-200" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No transaction records found</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Profile;
