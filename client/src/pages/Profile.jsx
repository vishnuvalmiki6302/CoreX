import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';
import {
    User, Mail, Calendar, Activity, Save, Ruler, Weight, Phone,
    MapPin, HeartPulse, Shield, Settings, Dumbbell, 
    CreditCard, CheckCircle2, ChevronRight, Camera, LogOut,
    TrendingUp, Clock, Info, Edit3, Trash2, X, Zap, ArrowRight,
    Map
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const InputField = ({ label, icon: Icon, type = 'text', value, onChange, placeholder, disabled }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">{label}</label>
        <div className={`relative flex items-center ${disabled ? 'opacity-50' : ''}`}>
            {Icon && <Icon size={16} className="absolute left-4 text-gym-orange" />}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full h-12 ${Icon ? 'pl-11' : 'pl-5'} pr-5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-gym-orange transition-all disabled:cursor-not-allowed`}
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
        } catch (error) {
            console.error("Profile data sync failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const loadToast = toast.loading("Saving profile configurations...");
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
            toast.success("Settings synchronized", { id: loadToast });
        } catch (error) {
            toast.error("Cloud synchronization failed", { id: loadToast });
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <div className="w-10 h-10 border-2 border-slate-100 border-t-gym-orange rounded-full animate-spin" />
                <Logo iconSize={24} />
            </div>
        </div>
    );

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Activity },
        { id: 'account', label: 'Identity', icon: User },
        { id: 'history', label: 'Activities', icon: Calendar },
        { id: 'billing', label: 'Payments', icon: CreditCard },
    ];

    return (
        <div className="min-h-screen bg-[#FDFDFD] pt-24 pb-20">
            <div className="max-w-6xl mx-auto px-6">
                
                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Avatar Cell */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shadow-sm">
                                {previewImage ? (
                                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                ) : (
                                    <span className="text-4xl font-black text-gym-orange">{profileData?.username?.charAt(0)?.toUpperCase()}</span>
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-lg hover:bg-gym-orange transition-all border-4 border-white">
                                <Camera size={16} />
                                <input type="file" onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setSelectedFile(file);
                                        const reader = new FileReader();
                                        reader.onloadend = () => setPreviewImage(reader.result);
                                        reader.readAsDataURL(file);
                                    }
                                }} className="hidden" accept="image/*" />
                            </label>
                        </div>

                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase">{profileData?.username || 'Member'}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <span className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    <Shield size={12} className="text-gym-orange" /> #{profileData?.memberId || 'CORE-ID'}
                                </span>
                                <span className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Membership
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => { setIsEditing(!isEditing); setActiveTab('account'); }} className="h-12 px-6 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                        <button onClick={logout} className="h-12 w-12 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* ── SIDEBAR ── */}
                    <aside className="lg:w-64 shrink-0 space-y-6">
                        <nav className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm space-y-1">
                            {menuItems.map(item => {
                                const Icon = item.icon;
                                const active = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => { setActiveTab(item.id); setIsEditing(false); }}
                                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                            active ? 'bg-gym-orange text-white shadow-md shadow-gym-orange/20' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                    >
                                        <Icon size={16} />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Zap size={60} />
                            </div>
                            <h4 className="text-[10px] font-black text-gym-orange uppercase tracking-widest mb-4">Membership Plan</h4>
                            <p className="text-xl font-black mb-1">{profileData?.membershipType || 'PREMIUM ACCESS'}</p>
                            <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest mb-6">Renews: {new Date(profileData?.membershipExpiry || Date.now() + 2592000000).toLocaleDateString()}</p>
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all">
                                Manage Subscription
                            </button>
                        </div>
                    </aside>

                    {/* ── WORKSPACE ── */}
                    <main className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab + isEditing}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                            >
                                {activeTab === 'dashboard' && (
                                    <div className="space-y-8">
                                        {/* STATS GRID */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Weight', value: profileData?.profile?.weight ? `${profileData.profile.weight} KG` : '--', icon: Weight },
                                                { label: 'Height', value: profileData?.profile?.height ? `${profileData.profile.height} CM` : '--', icon: Ruler },
                                                { label: 'Body Fat', value: profileData?.profile?.bodyFat ? `${profileData.profile.bodyFat}%` : 'N/A', icon: Activity },
                                                { label: 'Sessions', value: attendance.length, icon: Calendar },
                                            ].map((s, i) => (
                                                <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-gym-orange transition-all shadow-sm">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-gym-orange mb-4">
                                                        <s.icon size={16} />
                                                    </div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                                                    <p className="text-xl font-black text-slate-900 tracking-tight">{s.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* GOALS */}
                                        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Active Objectives</h3>
                                                <TrendingUp size={16} className="text-gym-orange" />
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {profileData?.profile?.goals?.length > 0 ? profileData.profile.goals.map((g, i) => (
                                                    <span key={i} className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase rounded-lg tracking-wider">{g}</span>
                                                )) : (
                                                    <p className="text-xs text-slate-400 font-medium">Define your goals in settings to track progress.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* RECENT LOGS */}
                                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Session Logs</h3>
                                                <button onClick={() => setActiveTab('history')} className="text-[10px] font-black text-gym-orange uppercase tracking-widest flex items-center gap-1 hover:opacity-70">
                                                    View All <ArrowRight size={12} />
                                                </button>
                                            </div>
                                            <div className="divide-y divide-slate-50">
                                                {attendance.slice(0, 3).map((record, i) => (
                                                    <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-all">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 font-black text-sm border border-slate-100">
                                                                {new Date(record.date).getDate()}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-1">Duration: {record.checkOut ? 'Completed' : 'Active'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded-md border border-emerald-100">Verified</div>
                                                    </div>
                                                ))}
                                                {attendance.length === 0 && (
                                                    <div className="p-12 text-center text-slate-300">
                                                        <Activity size={32} className="mx-auto mb-4 opacity-20" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">No activity recorded</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'account' && (
                                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                        <div className="px-10 py-8 border-b border-slate-100">
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">{isEditing ? 'System Configuration' : 'Identity Profile'}</h3>
                                        </div>
                                        <div className="p-10">
                                            {isEditing ? (
                                                <form onSubmit={handleUpdate} className="space-y-10">
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
                                                        <InputField label="Physical Address" icon={Map} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Strategic Goals</label>
                                                        <input 
                                                            className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-gym-orange transition-all"
                                                            value={formData.goals} onChange={(e) => setFormData({ ...formData, goals: e.target.value })} placeholder="Hypertrophy, Endurance, Strength"
                                                        />
                                                    </div>
                                                    <button type="submit" className="w-full h-14 bg-gym-orange text-white text-[10px] font-black uppercase tracking-[0.25em] rounded-xl shadow-lg shadow-gym-orange/20 hover:bg-[#e65500] transition-all">
                                                        Apply Synchronized Settings
                                                    </button>
                                                </form>
                                            ) : (
                                                <div className="space-y-10">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-8">
                                                            <div>
                                                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Contact Intelligence</h4>
                                                                <div className="space-y-4">
                                                                    <div className="flex items-center gap-4 text-sm font-bold text-slate-900">
                                                                        <Mail size={16} className="text-gym-orange" /> {profileData?.email}
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-sm font-bold text-slate-900">
                                                                        <Phone size={16} className="text-gym-orange" /> {profileData?.phoneNumber || 'None Established'}
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-sm font-bold text-slate-900">
                                                                        <Map size={16} className="text-gym-orange" /> {profileData?.address || 'None Established'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                                                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6">Biometric Breakdown</h4>
                                                            <div className="grid grid-cols-2 gap-6">
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Body Mass</p>
                                                                    <p className="text-2xl font-black text-slate-900">{profileData?.profile?.weight || '--'} KG</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stature</p>
                                                                    <p className="text-2xl font-black text-slate-900">{profileData?.profile?.height || '--'} CM</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {profileData?.medicalNotes && (
                                                        <div className="p-6 rounded-2xl bg-red-50 border border-red-100 flex gap-4">
                                                            <Info size={20} className="text-red-400 shrink-0" />
                                                            <div>
                                                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Health Intelligence</p>
                                                                <p className="text-xs font-bold text-red-900 leading-relaxed">{profileData.medicalNotes}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'history' && (
                                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                        <div className="px-10 py-8 border-b border-slate-100">
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Operational Deployment History</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        {['Sequence Date', 'Check-In', 'Status', 'Verified'].map(h => (
                                                            <th key={h} className="px-10 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {attendance.map(record => (
                                                        <tr key={record._id} className="hover:bg-slate-50 transition-all">
                                                            <td className="px-10 py-5 text-sm font-bold text-slate-900">{new Date(record.date).toLocaleDateString()}</td>
                                                            <td className="px-10 py-5 text-sm font-bold text-slate-900">{new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                                            <td className="px-10 py-5">
                                                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">SUCCESS</span>
                                                            </td>
                                                            <td className="px-10 py-5 text-slate-300">
                                                                <CheckCircle2 size={16} />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'billing' && (
                                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                        <div className="px-10 py-8 border-b border-slate-100">
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Transaction Registry</h3>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {payments.map(payment => (
                                                <div key={payment._id} className="px-10 py-6 flex items-center justify-between hover:bg-slate-50 transition-all">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 border border-slate-100">
                                                            <CreditCard size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{payment.plan?.name || 'RENEWAL'}</p>
                                                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Ref ID: {payment._id.slice(-8).toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-black text-slate-900 mb-1">₹{payment.amount}</p>
                                                        <span className="text-[9px] font-black text-gym-orange uppercase tracking-widest">COMPLETED</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {payments.length === 0 && (
                                                <div className="p-12 text-center text-slate-300">
                                                    <CreditCard size={32} className="mx-auto mb-4 opacity-20" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">No transactions found</p>
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
