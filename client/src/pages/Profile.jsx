import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Activity, Save, Ruler, Weight, Phone, MapPin, HeartPulse, AlertCircle, Settings, Dumbbell, Utensils } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        role: '',
        memberId: '',
        phoneNumber: '',
        address: '',
        medicalNotes: '',
        emergencyContact: { name: '', phone: '', relation: '' },
        profile: {
            age: '',
            weight: '',
            height: '',
            goals: []
        }
    });

    const [isEditing, setIsEditing] = useState(false);
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

    // New states for image upload
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [attendance, setAttendance] = useState([]);
    const [payments, setPayments] = useState([]);
    const [workoutPlans, setWorkoutPlans] = useState([]);
    const [dietPlans, setDietPlans] = useState([]);

    useEffect(() => {
        if (user) {
            fetchUserProfile();
            if (activeTab === 'attendance') fetchAttendance();
            if (activeTab === 'payments') fetchPayments();
            if (activeTab === 'workout') fetchWorkoutPlans();
            if (activeTab === 'diet') fetchDietPlans();
        }
    }, [user, activeTab]);

    const fetchAttendance = async () => {
        try {
            const { data } = await api.get('/attendance/me');
            setAttendance(data);
        } catch (error) { console.error("Failed to load attendance"); }
    };

    const fetchPayments = async () => {
        try {
            const { data } = await api.get('/payments/my-history');
            setPayments(data);
        } catch (error) { console.error("Failed to load payments"); }
    };

    const fetchWorkoutPlans = async () => {
        try {
            const { data } = await api.get('/workouts/my-plans');
            setWorkoutPlans(data);
        } catch (error) { console.error("Failed to load workout plans"); }
    };

    const fetchDietPlans = async () => {
        try {
            const { data } = await api.get('/diets/my-plans');
            setDietPlans(data);
        } catch (error) { console.error("Failed to load diet plans"); }
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

            // Handle existing profile photo
            if (data.profilePhoto) {
                const serverUrl = import.meta.env.VITE_API_URL;
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

            // Add Profile Data as JSON string
            formDataPayload.append('profile', JSON.stringify({
                age: Number(formData.age),
                weight: Number(formData.weight),
                height: Number(formData.height),
                goals: goalsArray
            }));

            // Add new fields
            formDataPayload.append('phoneNumber', formData.phoneNumber);
            formDataPayload.append('address', formData.address);
            formDataPayload.append('medicalNotes', formData.medicalNotes);
            formDataPayload.append('emergencyContact', JSON.stringify({
                name: formData.emergencyContactName,
                phone: formData.emergencyContactPhone,
                relation: formData.emergencyContactRelation
            }));

            // Add Photo if selected
            if (selectedFile) {
                formDataPayload.append('profilePhoto', selectedFile);
            }

            const { data } = await api.put('/users/profile', formDataPayload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setProfileData(data);
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Loading Profile...</div>;

    return (
        <div className="min-h-screen bg-gym-dark pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl"
                >
                    {/* Header bg */}
                    <div className="h-40 bg-gradient-to-r from-gym-accent to-red-600 relative">
                        <div className="absolute -bottom-16 left-8 p-1 bg-gym-dark rounded-full group z-10">
                            <div className="w-32 h-32 rounded-full bg-zinc-800 flex items-center justify-center border-4 border-gym-dark text-white text-4xl font-bold uppercase overflow-hidden relative">
                                {previewImage ? (
                                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    profileData.username?.charAt(0) || 'U'
                                )}

                                {isEditing && (
                                    <label className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-xs font-bold text-center px-1">Change<br />Photo</span>
                                        <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-20 px-8 pb-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">{profileData.username || user?.username}</h1>
                                <p className="text-gray-300 flex items-center gap-2"><Mail size={16} /> {profileData.email || user?.email}</p>
                                {profileData.memberId && (
                                    <p className="text-gym-accent flex items-center gap-2 text-sm mt-1 font-mono">
                                        ID: {profileData.memberId}
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setIsEditing(!isEditing)} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
                                <Settings size={18} /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                            </button>
                        </div>

                        <div className="flex gap-4 border-b border-white/5 pb-4 mb-6">
                            <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'profile' ? 'bg-gym-accent text-white' : 'bg-black/30 text-gray-400 hover:bg-white/10'}`}>Profile</button>
                            <button onClick={() => setActiveTab('attendance')} className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'attendance' ? 'bg-gym-accent text-white' : 'bg-black/30 text-gray-400 hover:bg-white/10'}`}>Attendance</button>
                            <button onClick={() => setActiveTab('payments')} className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'payments' ? 'bg-gym-accent text-white' : 'bg-black/30 text-gray-400 hover:bg-white/10'}`}>Payments</button>
                            <button onClick={() => setActiveTab('workout')} className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'workout' ? 'bg-gym-accent text-white' : 'bg-black/30 text-gray-400 hover:bg-white/10'}`}>Workouts</button>
                            <button onClick={() => setActiveTab('diet')} className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'diet' ? 'bg-gym-accent text-white' : 'bg-black/30 text-gray-400 hover:bg-white/10'}`}>Diet</button>
                        </div>
                    </div>

                    <div className="px-8 pb-8">
                        {activeTab === 'profile' && (
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Detailed Info Form / View */}
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Activity size={20} className="text-gym-accent" /> Personal & Medical
                                        </h3>
                                    </div>

                                    {isEditing ? (
                                        <form onSubmit={handleUpdate} className="space-y-4">
                                            {/* Physical Stats */}
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-gray-400 text-xs mb-1">Age</label>
                                                    <input
                                                        type="number"
                                                        value={formData.age}
                                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gym-accent focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-gray-400 text-xs mb-1">Weight (kg)</label>
                                                    <input
                                                        type="number"
                                                        value={formData.weight}
                                                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gym-accent focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-gray-400 text-xs mb-1">Height (cm)</label>
                                                    <input
                                                        type="number"
                                                        value={formData.height}
                                                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gym-accent focus:outline-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Contact Info */}
                                            <div className="space-y-2 pt-2 border-t border-white/5">
                                                <label className="block text-gym-accent text-xs font-bold uppercase">Contact Details</label>
                                                <div className="grid grid-cols-1 gap-2">
                                                    <input
                                                        placeholder="Phone Number"
                                                        type="tel"
                                                        value={formData.phoneNumber}
                                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gym-accent focus:outline-none"
                                                    />
                                                    <textarea
                                                        placeholder="Address"
                                                        value={formData.address}
                                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gym-accent focus:outline-none h-20 resize-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Emergency Contact */}
                                            <div className="space-y-2 pt-2 border-t border-white/5">
                                                <label className="block text-gym-accent text-xs font-bold uppercase">Emergency Contact</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        placeholder="Name"
                                                        value={formData.emergencyContactName}
                                                        onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                                                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gym-accent focus:outline-none"
                                                    />
                                                    <input
                                                        placeholder="Relation"
                                                        value={formData.emergencyContactRelation}
                                                        onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                                                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gym-accent focus:outline-none"
                                                    />
                                                    <input
                                                        placeholder="Phone"
                                                        value={formData.emergencyContactPhone}
                                                        onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                                                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gym-accent focus:outline-none col-span-2"
                                                    />
                                                </div>
                                            </div>

                                            {/* Medical Notes */}
                                            <div className="space-y-2 pt-2 border-t border-white/5">
                                                <label className="block text-gym-accent text-xs font-bold uppercase">Medical Notes</label>
                                                <textarea
                                                    placeholder="Allergies, injuries, or medical conditions..."
                                                    value={formData.medicalNotes}
                                                    onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                                                    className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gym-accent focus:outline-none h-20 resize-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-400 text-xs mb-1">Goals (comma separated)</label>
                                                <input
                                                    type="text"
                                                    value={formData.goals}
                                                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                                                    className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gym-accent focus:outline-none"
                                                />
                                            </div>

                                            <button type="submit" className="w-full bg-gym-accent text-white font-bold py-2 rounded-lg hover:bg-gym-accent/80 transition-all flex items-center justify-center gap-2">
                                                <Save size={18} /> Save Changes
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="flex flex-col items-center p-2 bg-zinc-800 rounded-lg">
                                                    <span className="text-gray-400 text-xs">Age</span>
                                                    <span className="text-white font-bold">{profileData.profile?.age || '-'}</span>
                                                </div>
                                                <div className="flex flex-col items-center p-2 bg-zinc-800 rounded-lg">
                                                    <span className="text-gray-400 text-xs">Weight</span>
                                                    <span className="text-white font-bold">{profileData.profile?.weight || '-'} kg</span>
                                                </div>
                                                <div className="flex flex-col items-center p-2 bg-zinc-800 rounded-lg">
                                                    <span className="text-gray-400 text-xs">Height</span>
                                                    <span className="text-white font-bold">{profileData.profile?.height || '-'} cm</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3 pt-2">
                                                <div className="flex items-start gap-3">
                                                    <Phone size={16} className="text-gray-400 mt-1" />
                                                    <div>
                                                        <p className="text-gray-400 text-xs">Phone</p>
                                                        <p className="text-white text-sm">{profileData.phoneNumber || 'Not set'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <MapPin size={16} className="text-gray-400 mt-1" />
                                                    <div>
                                                        <p className="text-gray-400 text-xs">Address</p>
                                                        <p className="text-white text-sm">{profileData.address || 'Not set'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle size={16} className="text-gray-400 mt-1" />
                                                    <div>
                                                        <p className="text-gray-400 text-xs">Emergency Contact</p>
                                                        {profileData.emergencyContact?.name ? (
                                                            <p className="text-white text-sm">
                                                                {profileData.emergencyContact.name} ({profileData.emergencyContact.relation}) - {profileData.emergencyContact.phone}
                                                            </p>
                                                        ) : (
                                                            <p className="text-white text-sm italic text-gray-500">Not set</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <HeartPulse size={16} className="text-gray-400 mt-1" />
                                                    <div>
                                                        <p className="text-gray-400 text-xs">Medical Notes</p>
                                                        <p className="text-white text-sm">{profileData.medicalNotes || 'None'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-white/5">
                                                <h4 className="text-white font-bold text-sm mb-2">Fitness Goals</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {profileData.profile?.goals && profileData.profile.goals.length > 0 ? (
                                                        profileData.profile.goals.map((goal, idx) => (
                                                            <span key={idx} className="bg-gym-accent/10 text-gym-accent text-xs px-3 py-1 rounded-full border border-gym-accent/20">
                                                                {goal}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-500 text-xs italic">No goals set yet.</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Membership & Stats */}
                                <div className="space-y-6">
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <Calendar size={20} className="text-gym-accent" /> Membership status
                                        </h3>
                                        <div className="p-4 bg-gradient-to-br from-zinc-800 to-black rounded-xl border border-white/10">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-gray-400 text-sm">Status</span>
                                                <span className={`font-black text-xl italic uppercase ${profileData.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                                                    {profileData.status || 'Active'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-gray-400 text-sm">Current Plan</span>
                                                <span className="text-gym-accent font-black text-xl italic uppercase">
                                                    {profileData.membershipType || 'NONE'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-gray-400 text-sm">Expiry</span>
                                                <span className="text-white font-bold">
                                                    {profileData.membershipExpiry ? new Date(profileData.membershipExpiry).toLocaleDateString() : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'attendance' && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white mb-4">Attendance History</h3>
                                {attendance.length > 0 ? (
                                    <div className="bg-black/40 border border-white/5 rounded-xl overflow-hidden">
                                        <div className="grid grid-cols-3 bg-white/5 p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <div>Date</div>
                                            <div>Time</div>
                                            <div className="text-right">Status</div>
                                        </div>
                                        <div className="divide-y divide-white/5">
                                            {attendance.map((record) => (
                                                <div key={record._id} className="grid grid-cols-3 p-4 items-center hover:bg-white/5 transition-colors">
                                                    <div className="text-white font-medium">
                                                        {new Date(record.date).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-sm text-gray-400">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-green-500">IN:</span> {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        {record.checkOut && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-red-500">OUT:</span> {new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${record.status === 'checked-in' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-400'}`}>
                                                            {record.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-black/20 rounded-xl border border-white/5">
                                        <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
                                        <p className="text-gray-400">No attendance records found.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'payments' && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white mb-4">Payment History</h3>
                                {payments.length > 0 ? payments.map(payment => (
                                    <div key={payment._id} className="bg-black/40 p-4 rounded-xl border border-white/5 flex justify-between items-center hover:border-gym-accent/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white/5 p-3 rounded-full text-gym-accent">
                                                <Activity size={20} />
                                            </div>
                                            <div>
                                                <div className="text-white font-bold">{payment.plan?.name || 'Payment'}</div>
                                                <div className="text-sm text-gray-400">
                                                    {new Date(payment.date).toLocaleDateString()} • <span className="uppercase">{payment.method}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono mt-1">{payment.invoiceNumber}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-white">${payment.amount}</div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${payment.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                                payment.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-red-500/10 text-red-500'
                                                }`}>
                                                {payment.status}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-12 bg-black/20 rounded-xl border border-white/5">
                                        <Activity size={48} className="mx-auto text-gray-600 mb-4" />
                                        <p className="text-gray-400">No payment history found.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'workout' && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white mb-4">My Workout Plans</h3>
                                {workoutPlans.length > 0 ? workoutPlans.map(plan => (
                                    <div key={plan._id} className="bg-black/40 border border-white/5 rounded-xl p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                                    <Dumbbell size={18} className="text-gym-accent" /> {plan.name}
                                                </h4>
                                                <p className="text-sm text-gray-400">Coach: {plan.trainer?.username}</p>
                                            </div>
                                            <span className="bg-green-500/10 text-green-500 text-xs font-bold px-2 py-1 rounded uppercase">{plan.status}</span>
                                        </div>
                                        <p className="text-gray-300 text-sm mb-4">{plan.description}</p>

                                        <div className="space-y-2">
                                            {plan.schedule && plan.schedule.map((day, idx) => (
                                                <div key={idx} className="bg-white/5 p-3 rounded-lg">
                                                    <h5 className="font-bold text-gym-accent text-sm mb-2">{day.day}</h5>
                                                    {day.exercises.length > 0 ? (
                                                        <ul className="text-xs text-gray-300 space-y-1">
                                                            {day.exercises.map((ex, i) => (
                                                                <li key={i}>- {ex.name} ({ex.sets}x{ex.reps})</li>
                                                            ))}
                                                        </ul>
                                                    ) : <p className="text-xs text-gray-500 italic">No exercises listed.</p>}
                                                </div>
                                            ))}
                                            {!plan.schedule?.length && <p className="text-sm text-gray-500 italic">No schedule details available.</p>}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-12 bg-black/20 rounded-xl border border-white/5">
                                        <Dumbbell size={48} className="mx-auto text-gray-600 mb-4" />
                                        <p className="text-gray-400">No active workout plans.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'diet' && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white mb-4">My Diet Plans</h3>
                                {dietPlans.length > 0 ? dietPlans.map(plan => (
                                    <div key={plan._id} className="bg-black/40 border border-white/5 rounded-xl p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                                    <Utensils size={18} className="text-green-500" /> {plan.name}
                                                </h4>
                                                <p className="text-sm text-gray-400">Coach: {plan.trainer?.username}</p>
                                                {plan.totalCalories && <p className="text-xs text-gym-accent mt-1">Target: {plan.totalCalories} kcal</p>}
                                            </div>
                                            <span className="bg-green-500/10 text-green-500 text-xs font-bold px-2 py-1 rounded uppercase">{plan.status}</span>
                                        </div>
                                        <p className="text-gray-300 text-sm mb-4">{plan.description}</p>

                                        {!plan.dailyMeals?.length && <p className="text-sm text-gray-500 italic">No meal details available.</p>}
                                    </div>
                                )) : (
                                    <div className="text-center py-12 bg-black/20 rounded-xl border border-white/5">
                                        <Utensils size={48} className="mx-auto text-gray-600 mb-4" />
                                        <p className="text-gray-400">No active diet plans.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
