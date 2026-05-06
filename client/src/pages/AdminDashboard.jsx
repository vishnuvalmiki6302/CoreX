import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Users, ShoppingBag, DollarSign, Activity, Plus, Edit, Trash2, X, Search, LayoutDashboard, Package, Calendar, FileText, CheckSquare, CreditCard, IndianRupee, Dumbbell, Utensils, ChevronDown } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Tabs: 'overview', 'users', 'products', 'classes'
    const [activeTab, setActiveTab] = useState('overview');

    // Data States
    const [stats, setStats] = useState({ userCount: 0, productCount: 0, orderCount: 0, totalRevenue: 0 });
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [classes, setClasses] = useState([]);
    const [plans, setPlans] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [activeCheckIns, setActiveCheckIns] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    // User Management State
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userSearch, setUserSearch] = useState('');
    const [userForm, setUserForm] = useState({
        username: '', email: '', password: '', role: 'user',
        phoneNumber: '', address: '', medicalNotes: '',
        emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
        status: 'active', membershipType: 'none', planStartDate: '', membershipExpiry: '', assignedTrainer: ''
    });

    // Payments State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentForm, setPaymentForm] = useState({ userId: '', planId: '', amount: '', method: 'cash', status: 'completed', notes: '' });

    // Modal States for others
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({ name: '', price: '', category: '', description: '', image: '', stock: '' });

    const [showClassModal, setShowClassModal] = useState(false);
    const [classForm, setClassForm] = useState({ name: '', description: '', trainerId: '', startTime: '', durationMinutes: '', capacity: '' });

    const [showPlanModal, setShowPlanModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [planForm, setPlanForm] = useState({ name: '', price: '', durationMonths: 1, type: 'custom', features: '', description: '', highlight: false, isActive: true });

    // Chart Data States
    const [revenueData, setRevenueData] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);

    // Plan Programs State
    const [planPrograms, setPlanPrograms] = useState({});
    const [activeProgramType, setActiveProgramType] = useState('starter');
    const [activeProgramDay, setActiveProgramDay] = useState('Monday');
    const [programSaving, setProgramSaving] = useState(false);
    const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const PLAN_TYPES = ['starter','pro','elite'];
    const emptyDay = (day) => ({ day, focus: '', isRestDay: false, exercises: [], meals: [] });
    const emptyExercise = () => ({ name: '', sets: 3, reps: '10-12', rest: '60s', notes: '' });
    const emptyMeal = () => ({ type: 'Breakfast', time: '08:00', notes: '', items: [] });
    const emptyMealItem = () => ({ name: '', portion: '', calories: '' });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'admin') {
            navigate('/');
            return;
        }

        // Initial Fetch for Overview
        if (activeTab === 'overview') { fetchStats(); fetchCharts(); fetchUsers(); fetchProducts(); }
        if (activeTab === 'users') { fetchUsers(); fetchPlans(); fetchTrainers(); }
        if (activeTab === 'products') fetchProducts();
        if (activeTab === 'classes') fetchClasses();
        if (activeTab === 'plans') fetchPlans();
        if (activeTab === 'attendance') { fetchActiveCheckIns(); fetchUsers(); }
        if (activeTab === 'payments') { fetchPayments(); fetchUsers(); fetchPlans(); }
        if (activeTab === 'programs') fetchAllPlanPrograms();

    }, [user, navigate, activeTab]);





    // Fetch Functions
    const fetchStats = async () => {
        try {
            const { data } = await api.get('/analytics/stats');
            setStats(data);
            setLoading(false);
        } catch (error) { console.error(error); setLoading(false); }
    };

    const fetchCharts = async () => {
        try {
            const revenueRes = await api.get('/analytics/revenue-chart');
            const attendanceRes = await api.get('/analytics/attendance-chart');
            setRevenueData(revenueRes.data);
            setAttendanceData(attendanceRes.data);
        } catch (error) { console.error("Failed to load charts"); }
    };

    const fetchPlans = async () => {
        try {
            const { data } = await api.get('/plans/admin');
            setPlans(data);
        } catch (error) { toast.error("Failed to load plans"); }
    };

    const fetchTrainers = async () => {
        try {
            const { data } = await api.get('/users/trainers');
            setTrainers(data);
        } catch (error) { toast.error("Failed to load trainers"); }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) { toast.error("Failed to load users"); }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) { toast.error("Failed to load products"); }
    };

    const fetchClasses = async () => {
        try {
            const { data } = await api.get('/classes');
            setClasses(data);
        } catch (error) { toast.error("Failed to load classes"); }
    };

    const fetchAllPlanPrograms = async () => {
        const result = {};
        for (const type of ['starter','pro','elite']) {
            try {
                const { data } = await api.get(`/plan-programs/${type}`);
                result[type] = data;
            } catch {
                result[type] = { planType: type, weeklySchedule: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d => ({ day: d, focus: '', isRestDay: false, exercises: [], meals: [] })) };
            }
        }
        setPlanPrograms(result);
    };

    const handleSavePlanProgram = async () => {
        setProgramSaving(true);
        try {
            const program = planPrograms[activeProgramType];
            await api.post('/plan-programs', { planType: activeProgramType, weeklySchedule: program.weeklySchedule });
            toast.success(`${activeProgramType} program saved!`);
        } catch (error) {
            toast.error('Failed to save program');
        } finally { setProgramSaving(false); }
    };

    const updateDayField = (day, field, value) => {
        setPlanPrograms(prev => ({
            ...prev,
            [activeProgramType]: {
                ...prev[activeProgramType],
                weeklySchedule: prev[activeProgramType].weeklySchedule.map(d => d.day === day ? { ...d, [field]: value } : d)
            }
        }));
    };

    const updateExercise = (day, exIdx, field, value) => {
        setPlanPrograms(prev => ({
            ...prev,
            [activeProgramType]: {
                ...prev[activeProgramType],
                weeklySchedule: prev[activeProgramType].weeklySchedule.map(d => d.day !== day ? d : {
                    ...d, exercises: d.exercises.map((ex, i) => i === exIdx ? { ...ex, [field]: value } : ex)
                })
            }
        }));
    };

    const addExercise = (day) => {
        setPlanPrograms(prev => ({
            ...prev,
            [activeProgramType]: {
                ...prev[activeProgramType],
                weeklySchedule: prev[activeProgramType].weeklySchedule.map(d => d.day !== day ? d : {
                    ...d, exercises: [...d.exercises, { name: '', sets: 3, reps: '10-12', rest: '60s', notes: '' }]
                })
            }
        }));
    };

    const removeExercise = (day, exIdx) => {
        setPlanPrograms(prev => ({
            ...prev,
            [activeProgramType]: {
                ...prev[activeProgramType],
                weeklySchedule: prev[activeProgramType].weeklySchedule.map(d => d.day !== day ? d : {
                    ...d, exercises: d.exercises.filter((_, i) => i !== exIdx)
                })
            }
        }));
    };

    const updateMeal = (day, mIdx, field, value) => {
        setPlanPrograms(prev => ({
            ...prev,
            [activeProgramType]: {
                ...prev[activeProgramType],
                weeklySchedule: prev[activeProgramType].weeklySchedule.map(d => d.day !== day ? d : {
                    ...d, meals: d.meals.map((m, i) => i === mIdx ? { ...m, [field]: value } : m)
                })
            }
        }));
    };

    const addMeal = (day) => {
        setPlanPrograms(prev => ({
            ...prev,
            [activeProgramType]: {
                ...prev[activeProgramType],
                weeklySchedule: prev[activeProgramType].weeklySchedule.map(d => d.day !== day ? d : {
                    ...d, meals: [...d.meals, { type: 'Breakfast', time: '', notes: '', items: [] }]
                })
            }
        }));
    };

    const removeMeal = (day, mIdx) => {
        setPlanPrograms(prev => ({
            ...prev,
            [activeProgramType]: {
                ...prev[activeProgramType],
                weeklySchedule: prev[activeProgramType].weeklySchedule.map(d => d.day !== day ? d : {
                    ...d, meals: d.meals.filter((_, i) => i !== mIdx)
                })
            }
        }));
    };

    const addMealItem = (day, mIdx) => {
        setPlanPrograms(prev => ({
            ...prev,
            [activeProgramType]: {
                ...prev[activeProgramType],
                weeklySchedule: prev[activeProgramType].weeklySchedule.map(d => d.day !== day ? d : {
                    ...d, meals: d.meals.map((m, i) => i !== mIdx ? m : { ...m, items: [...m.items, { name: '', portion: '', calories: '' }] })
                })
            }
        }));
    };

    const updateMealItem = (day, mIdx, iIdx, field, value) => {
        setPlanPrograms(prev => ({
            ...prev,
            [activeProgramType]: {
                ...prev[activeProgramType],
                weeklySchedule: prev[activeProgramType].weeklySchedule.map(d => d.day !== day ? d : {
                    ...d, meals: d.meals.map((m, mi) => mi !== mIdx ? m : {
                        ...m, items: m.items.map((item, ii) => ii !== iIdx ? item : { ...item, [field]: value })
                    })
                })
            }
        }));
    };

    const removeMealItem = (day, mIdx, iIdx) => {
        setPlanPrograms(prev => ({
            ...prev,
            [activeProgramType]: {
                ...prev[activeProgramType],
                weeklySchedule: prev[activeProgramType].weeklySchedule.map(d => d.day !== day ? d : {
                    ...d, meals: d.meals.map((m, mi) => mi !== mIdx ? m : {
                        ...m, items: m.items.filter((_, ii) => ii !== iIdx)
                    })
                })
            }
        }));
    };

    // User Actions
    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                username: userForm.username,
                email: userForm.email,
                role: userForm.role,
                phoneNumber: userForm.phoneNumber,
                address: userForm.address,
                medicalNotes: userForm.medicalNotes,
                status: userForm.status,
                membershipType: userForm.membershipType,
                emergencyContact: {
                    name: userForm.emergencyContactName,
                    phone: userForm.emergencyContactPhone,
                    relation: userForm.emergencyContactRelation
                }
            };

            if (editingUser) {
                const { data } = await api.put(`/users/${editingUser._id}`, payload);
                setUsers(users.map(u => u._id === editingUser._id ? { ...u, ...data, role: payload.role } : u)); // Ensure role updates locally
                toast.success("Member updated");
            } else {
                payload.password = userForm.password;
                const { data } = await api.post('/users', payload);
                setUsers([data, ...users]);
                toast.success("Member created");
            }
            setShowUserModal(false);
            resetUserForm();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to save member");
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this member?")) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
            toast.success("Member deleted");
        } catch (error) {
            toast.error("Failed to delete member");
        }
    };

    const openUserModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setUserForm({
                username: user.username,
                email: user.email,
                password: '',
                role: user.role,
                phoneNumber: user.phoneNumber || '',
                address: user.address || '',
                medicalNotes: user.medicalNotes || '',
                emergencyContactName: user.emergencyContact?.name || '',
                emergencyContactPhone: user.emergencyContact?.phone || '',
                emergencyContactRelation: user.emergencyContact?.relation || '',
                status: user.status || 'active',
                membershipType: user.membershipType || 'none'
            });
        } else {
            setEditingUser(null);
            resetUserForm();
        }
        setShowUserModal(true);
    };

    const resetUserForm = () => {
        setUserForm({
            username: '', email: '', password: '', role: 'user',
            phoneNumber: '', address: '', medicalNotes: '',
            emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
            status: 'active', membershipType: 'none'
        });
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.memberId && u.memberId.toLowerCase().includes(userSearch.toLowerCase()))
    );


    // Product Actions
    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                const { data } = await api.put(`/products/${editingProduct._id}`, productForm);
                setProducts(products.map(p => p._id === editingProduct._id ? data : p));
                toast.success("Product updated");
            } else {
                const { data } = await api.post('/products', productForm);
                setProducts([...products, data]);
                toast.success("Product created");
            }
            setShowProductModal(false);
            setEditingProduct(null);
            setProductForm({ name: '', price: '', category: '', description: '', image: '', stock: '' });
        } catch (error) { toast.error(error.response?.data?.message || "Failed to save product"); }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setProductForm(product);
        setShowProductModal(true);
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/products/${id}`);
            setProducts(products.filter(p => p._id !== id));
            toast.success("Product deleted");
        } catch (error) { toast.error("Failed to delete product"); }
    };


    // Class Actions
    const handleSaveClass = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/classes', classForm);
            setClasses([...classes, data]);
            toast.success("Class scheduled");
            setShowClassModal(false);
            setClassForm({ name: '', description: '', trainerId: '', startTime: '', durationMinutes: '', capacity: '' });
        } catch (error) { toast.error("Failed to schedule class"); }
    };

    // Plan Actions
    const handleSavePlan = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...planForm,
                features: typeof planForm.features === 'string' ? planForm.features.split(',').map(f => f.trim()) : planForm.features
            };

            if (editingPlan) {
                const { data } = await api.put(`/plans/${editingPlan._id}`, payload);
                setPlans(plans.map(p => p._id === editingPlan._id ? data : p));
                toast.success("Plan updated");
            } else {
                const { data } = await api.post('/plans', payload);
                setPlans([data, ...plans]);
                toast.success("Plan created");
            }
            setShowPlanModal(false);
            setEditingPlan(null);
            setPlanForm({ name: '', price: '', durationMonths: 1, type: 'custom', features: '', description: '', highlight: false, isActive: true });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save plan");
            console.error(error);
        }
    };

    const handleEditPlan = (plan) => {
        setEditingPlan(plan);
        setPlanForm({
            ...plan,
            features: plan.features.join(', ')
        });
        setShowPlanModal(true);
    };

    const handleDeletePlan = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/plans/${id}`);
            setPlans(plans.filter(p => p._id !== id));
            toast.success("Plan deleted");
        } catch (error) { toast.error("Failed to delete plan"); }
    };

    // Payment Actions
    const fetchPayments = async () => {
        try {
            const { data } = await api.get('/payments');
            setPayments(data);
        } catch (error) { console.error(error); }
    };

    const handleCreatePayment = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/payments', paymentForm);
            setPayments([data, ...payments]);
            toast.success('Payment recorded');
            setShowPaymentModal(false);
            setPaymentForm({ userId: '', planId: '', amount: '', method: 'cash', status: 'completed', notes: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to record payment');
        }
    };

    // Attendance Actions
    const fetchActiveCheckIns = async () => {
        try {
            const { data } = await api.get('/attendance/active');
            setActiveCheckIns(data);
        } catch (error) { console.error(error); }
    };

    const handleCheckIn = async (userId) => {
        try {
            const { data } = await api.post('/attendance/check-in', { userId });
            setActiveCheckIns([data, ...activeCheckIns]);
            toast.success("Checked in successfully");
            setUserSearch(''); // Clear search
        } catch (error) {
            toast.error(error.response?.data?.message || "Check-in failed");
        }
    };

    const handleCheckOut = async (userId) => {
        try {
            await api.post('/attendance/check-out', { userId });
            setActiveCheckIns(activeCheckIns.filter(a => a.user._id !== userId)); // Remove from active list
            toast.success("Checked out successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Check-out failed");
        }
    };

    if (loading && activeTab === 'overview') return <div className="text-white text-center mt-20">Loading...</div>;

    const navItems = [
        { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
        { id: 'users', label: 'Users', icon: <Users size={18} /> },
        { id: 'products', label: 'Products', icon: <Package size={18} /> },
        { id: 'classes', label: 'Classes', icon: <Calendar size={18} /> },
        { id: 'plans', label: 'Plans', icon: <FileText size={18} /> },
        { id: 'programs', label: 'Programs', icon: <Dumbbell size={18} /> },
        { id: 'attendance', label: 'Attendance', icon: <CheckSquare size={18} /> },
        { id: 'payments', label: 'Payments', icon: <CreditCard size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-[#09090b] pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-6 md:gap-8">
                
                {/* SIDEBAR */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-[#18181b] border border-white/10 rounded-xl p-4 sticky top-24">
                        <div className="mb-6 px-2">
                            <h1 className="text-xl font-semibold text-white mb-1">Admin Panel</h1>
                            <p className="text-xs text-zinc-400">Manage your gym empire</p>
                        </div>
                        <nav className="space-y-1">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === item.id ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 min-w-0">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-white capitalize">{activeTab}</h2>
                    </div>

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { title: 'Total Members', value: users.length || stats.userCount || stats.totalUsers || 0, icon: <Users size={18} />, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                { title: 'Monthly Revenue', value: `₹${stats.totalRevenue || 0}`, icon: <IndianRupee size={18} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                { title: 'Active Orders', value: stats.orderCount || 0, icon: <ShoppingBag size={18} />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                { title: 'Products in Store', value: products.length || stats.productCount || stats.totalProducts || 0, icon: <Activity size={18} />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-zinc-900 border border-zinc-800/50 rounded-xl p-5 flex flex-col justify-between h-28">
                                    <div className="flex justify-between items-start">
                                        <div className="text-sm font-medium text-zinc-400">{stat.title}</div>
                                        <div className={`w-8 h-8 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center`}>
                                            {stat.icon}
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-white mt-1">{stat.value}</div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-zinc-900 border border-zinc-800/50 rounded-xl p-5">
                                <h3 className="text-sm font-medium text-zinc-300 mb-6">Weekly Revenue Matrix</h3>
                                <div style={{ width: '100%', height: 250, minWidth: 0, minHeight: 0 }}>
                                    <ResponsiveContainer width="99%" height="100%">
                                        <BarChart data={[
                                            { name: 'Mon', sales: 4000 }, { name: 'Tue', sales: 3000 }, { name: 'Wed', sales: 2000 },
                                            { name: 'Thu', sales: 2780 }, { name: 'Fri', sales: 1890 }, { name: 'Sat', sales: 2390 }, { name: 'Sun', sales: 3490 }
                                        ]}>
                                            <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip cursor={{fill: '#27272a'}} contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                                            <Bar dataKey="sales" fill="#f97316" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            
                            <div className="bg-zinc-900 border border-zinc-800/50 rounded-xl p-5">
                                <h3 className="text-sm font-medium text-zinc-300 mb-6">Active Members Growth</h3>
                                <div style={{ width: '100%', height: 250, minWidth: 0, minHeight: 0 }}>
                                    <ResponsiveContainer width="99%" height="100%">
                                        <LineChart data={[
                                            { name: 'Week 1', members: 120 }, { name: 'Week 2', members: 132 }, { name: 'Week 3', members: 145 },
                                            { name: 'Week 4', members: 160 }
                                        ]}>
                                            <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                                            <Line type="monotone" dataKey="members" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#18181b', stroke: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#3b82f6' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name, email or ID..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    className="w-full bg-[#18181b] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
                                />
                            </div>
                            <button
                                onClick={() => openUserModal()}
                                className="bg-white text-black px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-zinc-200 transition-colors"
                            >
                                <Plus size={18} /> Add Member
                            </button>
                        </div>

                        <div className="bg-[#18181b] border border-white/10 rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="border-b border-white/10 text-zinc-400 text-xs font-medium">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Member</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Plan / Expiry</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredUsers.map(u => (
                                        <tr key={u._id} className="text-gray-300 hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">{u.memberId || '-'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gym-accent/20 text-gym-accent flex items-center justify-center font-bold text-xs">
                                                        {u.username.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">{u.username}</div>
                                                        <div className="text-xs text-gray-500">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${u.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {u.status || 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-white">{u.membershipType || 'None'}</div>
                                                {u.membershipExpiry && <div className="text-xs text-gray-500">Exp: {new Date(u.membershipExpiry).toLocaleDateString()}</div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-white/10 px-2 py-1 rounded text-xs uppercase">{u.role}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openUserModal(u)} className="p-2 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors"><Edit size={16} /></button>
                                                    {u._id !== user?._id && (
                                                        <button onClick={() => handleDeleteUser(u._id)} className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* PRODUCTS TAB */}
                {activeTab === 'products' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => { setEditingProduct(null); setProductForm({ name: '', price: '', category: '', description: '', image: '', stock: '' }); setShowProductModal(true); }}
                                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-zinc-200 transition-colors"
                            >
                                <Plus size={18} /> Add Product
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {products.map(product => (
                                <div key={product._id} className="bg-[#18181b] border border-white/10 rounded-xl overflow-hidden group">
                                    <div className="h-48 bg-black/20 relative">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEditProduct(product)} className="p-1.5 bg-white text-black rounded-md hover:bg-zinc-200"><Edit size={14} /></button>
                                            <button onClick={() => handleDeleteProduct(product._id)} className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    <div className="p-4 flex justify-between items-center">
                                        <h3 className="font-medium text-white text-sm">{product.name}</h3>
                                        <p className="text-zinc-400 text-sm">₹{product.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CLASSES TAB */}
                {activeTab === 'classes' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => setShowClassModal(true)}
                                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-zinc-200 transition-colors"
                            >
                                <Plus size={18} /> Schedule Class
                            </button>
                        </div>
                        <div className="space-y-3">
                            {classes.map(c => (
                                <div key={c._id} className="bg-[#18181b] border border-white/10 rounded-xl p-5 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-medium text-white text-base">{c.name}</h3>
                                        <p className="text-zinc-400 text-sm">{new Date(c.startTime).toLocaleString()} • {c.durationMinutes} min</p>
                                        <p className="text-xs text-zinc-500 mt-1">Trainer: {c.trainer?.username}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-white font-medium text-sm">{c.enrolledUsers.length} / {c.capacity}</span>
                                        <p className="text-xs text-zinc-500">Enrolled</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* USER MODAL */}
                {showUserModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full my-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">{editingUser ? 'Edit Member' : 'Add New Member'}</h2>
                                <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-white"><X /></button>
                            </div>
                            <form onSubmit={handleSaveUser} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Username</label>
                                        <input className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none"
                                            value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Email</label>
                                        <input type="email" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none"
                                            value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required />
                                    </div>
                                    {!editingUser && (
                                        <div className="md:col-span-2">
                                            <label className="text-xs text-gray-400 mb-1 block">Password</label>
                                            <input type="password" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none"
                                                value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} required />
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Role</label>
                                        <select className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none"
                                            value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                                            <option value="user">User</option>
                                            <option value="trainer">Trainer</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Status</label>
                                        <select className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none"
                                            value={userForm.status} onChange={e => setUserForm({ ...userForm, status: e.target.value })}>
                                            <option value="active">Active</option>
                                            <option value="expired">Expired</option>
                                            <option value="pending">Pending</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Membership</label>
                                        <select className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none"
                                            value={userForm.membershipType} onChange={e => setUserForm({ ...userForm, membershipType: e.target.value })}>
                                            <option value="none">None</option>
                                            {plans.map(p => (
                                                <option key={p._id} value={p.name}>{p.name}</option>
                                            ))}
                                            {!plans.find(p => p.name === userForm.membershipType) && userForm.membershipType !== 'none' && (
                                                <option value={userForm.membershipType}>{userForm.membershipType}</option>
                                            )}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Plan Start Date</label>
                                            <input type="date" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none"
                                                value={userForm.planStartDate ? new Date(userForm.planStartDate).toISOString().split('T')[0] : ''}
                                                onChange={e => setUserForm({ ...userForm, planStartDate: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Plan Expiry Date</label>
                                            <input type="date" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none"
                                                value={userForm.membershipExpiry ? new Date(userForm.membershipExpiry).toISOString().split('T')[0] : ''}
                                                onChange={e => setUserForm({ ...userForm, membershipExpiry: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Assigned Trainer</label>
                                        <select className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none"
                                            value={userForm.assignedTrainer || ''} onChange={e => setUserForm({ ...userForm, assignedTrainer: e.target.value })}>
                                            <option value="">None</option>
                                            {trainers.map(t => (
                                                <option key={t._id} value={t._id}>{t.username}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Phone</label>
                                        <input className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none"
                                            value={userForm.phoneNumber} onChange={e => setUserForm({ ...userForm, phoneNumber: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Address</label>
                                        <input className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none"
                                            value={userForm.address} onChange={e => setUserForm({ ...userForm, address: e.target.value })} />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <h3 className="text-sm font-bold text-gym-accent mb-3 uppercase">Emergency Contact</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <input placeholder="Name" className="bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm"
                                            value={userForm.emergencyContactName} onChange={e => setUserForm({ ...userForm, emergencyContactName: e.target.value })} />
                                        <input placeholder="Rel." className="bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm"
                                            value={userForm.emergencyContactRelation} onChange={e => setUserForm({ ...userForm, emergencyContactRelation: e.target.value })} />
                                        <input placeholder="Phone" className="bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm"
                                            value={userForm.emergencyContactPhone} onChange={e => setUserForm({ ...userForm, emergencyContactPhone: e.target.value })} />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Medical Notes</label>
                                    <textarea className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm h-20 resize-none focus:border-gym-accent outline-none"
                                        value={userForm.medicalNotes} onChange={e => setUserForm({ ...userForm, medicalNotes: e.target.value })}></textarea>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5 transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 bg-gym-accent text-white py-3 rounded-xl font-bold shadow-lg shadow-gym-accent/20 hover:bg-gym-accent/90 transition-colors">
                                        {editingUser ? 'Update Member' : 'Create Member'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* PLANS TAB */}
                {activeTab === 'plans' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => { setEditingPlan(null); setPlanForm({ name: '', price: '', durationMonths: 1, type: 'custom', features: '', description: '', highlight: false, isActive: true }); setShowPlanModal(true); }}
                                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-zinc-200 transition-colors"
                            >
                                <Plus size={18} /> Create Plan
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {plans.map(plan => (
                                <div key={plan._id} className={`bg-[#18181b] border ${plan.isActive ? 'border-white/10' : 'border-red-500/30'} rounded-xl p-6 relative group`}>
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditPlan(plan)} className="p-1.5 bg-white text-black rounded-md hover:bg-zinc-200"><Edit size={14} /></button>
                                        <button onClick={() => handleDeletePlan(plan._id)} className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600"><Trash2 size={14} /></button>
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-1">{plan.name}</h3>
                                    <div className="text-2xl font-semibold text-white mb-4">₹{plan.price} <span className="text-xs text-zinc-500 font-normal">/ {plan.durationMonths} mo</span></div>
                                    <ul className="space-y-1.5 mb-4">
                                        {plan.features.map((f, i) => (
                                            <li key={i} className="text-zinc-400 text-sm flex items-center gap-2">
                                                <div className="w-1 h-1 bg-white rounded-full"></div> {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${plan.isActive ? 'bg-white text-black' : 'bg-red-500/10 text-red-500'}`}>
                                            {plan.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <span className="border border-white/10 px-2 py-0.5 rounded text-xs text-zinc-400">{plan.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* PROGRAMS TAB */}
                {activeTab === 'programs' && (() => {
                    const prog = planPrograms[activeProgramType];
                    const dayData = prog?.weeklySchedule?.find(d => d.day === activeProgramDay);
                    return (
                        <div className="space-y-4">
                            {/* Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-base font-semibold text-white">Plan Programs</h2>
                                    <p className="text-xs text-zinc-500 mt-0.5">Set weekly workout & diet for each membership plan</p>
                                </div>
                                <button onClick={handleSavePlanProgram} disabled={programSaving}
                                    className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50">
                                    {programSaving ? 'Saving...' : 'Save Program'}
                                </button>
                            </div>

                            {/* Plan type selector */}
                            <div className="flex gap-2">
                                {['starter','pro','elite'].map(t => (
                                    <button key={t} onClick={() => setActiveProgramType(t)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${activeProgramType === t ? 'bg-white text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>

                            {/* Day selector */}
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day => (
                                    <button key={day} onClick={() => setActiveProgramDay(day)}
                                        className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeProgramDay === day ? 'bg-orange-500 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'}`}>
                                        {day.slice(0,3)}
                                    </button>
                                ))}
                            </div>

                            {prog && dayData && (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* WORKOUTS */}
                                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                                        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Dumbbell size={15} className="text-orange-500" />
                                                <span className="text-sm font-semibold text-white">Workouts — {activeProgramDay}</span>
                                            </div>
                                            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                                                <input type="checkbox" checked={dayData.isRestDay || false} onChange={e => updateDayField(activeProgramDay, 'isRestDay', e.target.checked)} className="accent-orange-500" />
                                                Rest Day
                                            </label>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <input placeholder="Focus (e.g. Chest & Triceps)" value={dayData.focus || ''} onChange={e => updateDayField(activeProgramDay, 'focus', e.target.value)}
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500" />
                                            {!dayData.isRestDay && (
                                                <>
                                                    {dayData.exercises?.map((ex, i) => (
                                                        <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-2">
                                                            <div className="flex gap-2">
                                                                <input placeholder="Exercise name" value={ex.name} onChange={e => updateExercise(activeProgramDay, i, 'name', e.target.value)}
                                                                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-sm text-white placeholder:text-zinc-600 outline-none" />
                                                                <button onClick={() => removeExercise(activeProgramDay, i)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded"><X size={14} /></button>
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                <input placeholder="Sets" type="number" value={ex.sets} onChange={e => updateExercise(activeProgramDay, i, 'sets', e.target.value)}
                                                                    className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-sm text-white placeholder:text-zinc-600 outline-none" />
                                                                <input placeholder="Reps e.g 10-12" value={ex.reps} onChange={e => updateExercise(activeProgramDay, i, 'reps', e.target.value)}
                                                                    className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-sm text-white placeholder:text-zinc-600 outline-none" />
                                                                <input placeholder="Rest e.g 60s" value={ex.rest} onChange={e => updateExercise(activeProgramDay, i, 'rest', e.target.value)}
                                                                    className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-sm text-white placeholder:text-zinc-600 outline-none" />
                                                            </div>
                                                            <input placeholder="Notes (optional)" value={ex.notes || ''} onChange={e => updateExercise(activeProgramDay, i, 'notes', e.target.value)}
                                                                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-sm text-white placeholder:text-zinc-600 outline-none" />
                                                        </div>
                                                    ))}
                                                    <button onClick={() => addExercise(activeProgramDay)}
                                                        className="w-full py-2 border border-dashed border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1">
                                                        <Plus size={14} /> Add Exercise
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* DIET */}
                                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                                        <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
                                            <Utensils size={15} className="text-emerald-500" />
                                            <span className="text-sm font-semibold text-white">Diet — {activeProgramDay}</span>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            {dayData.meals?.map((meal, mi) => (
                                                <div key={mi} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-2">
                                                    <div className="flex gap-2 items-center">
                                                        <select value={meal.type} onChange={e => updateMeal(activeProgramDay, mi, 'type', e.target.value)}
                                                            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-sm text-white outline-none">
                                                            {['Breakfast','Pre-Workout','Lunch','Post-Workout','Dinner','Snack'].map(t => <option key={t}>{t}</option>)}
                                                        </select>
                                                        <input placeholder="Time e.g 08:00" value={meal.time || ''} onChange={e => updateMeal(activeProgramDay, mi, 'time', e.target.value)}
                                                            className="w-24 bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-sm text-white placeholder:text-zinc-600 outline-none" />
                                                        <button onClick={() => removeMeal(activeProgramDay, mi)} className="ml-auto p-1.5 text-red-500 hover:bg-red-500/10 rounded"><X size={14} /></button>
                                                    </div>
                                                    {meal.items?.map((item, ii) => (
                                                        <div key={ii} className="flex gap-2 items-center">
                                                            <input placeholder="Food item" value={item.name} onChange={e => updateMealItem(activeProgramDay, mi, ii, 'name', e.target.value)}
                                                                className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white placeholder:text-zinc-600 outline-none" />
                                                            <input placeholder="Portion" value={item.portion || ''} onChange={e => updateMealItem(activeProgramDay, mi, ii, 'portion', e.target.value)}
                                                                className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white placeholder:text-zinc-600 outline-none" />
                                                            <input placeholder="kcal" type="number" value={item.calories || ''} onChange={e => updateMealItem(activeProgramDay, mi, ii, 'calories', e.target.value)}
                                                                className="w-16 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white placeholder:text-zinc-600 outline-none" />
                                                            <button onClick={() => removeMealItem(activeProgramDay, mi, ii)} className="p-1 text-red-500 hover:bg-red-500/10 rounded"><X size={12} /></button>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => addMealItem(activeProgramDay, mi)}
                                                        className="text-xs text-zinc-600 hover:text-zinc-400 flex items-center gap-1 transition-colors">
                                                        <Plus size={12} /> Add food item
                                                    </button>
                                                </div>
                                            ))}
                                            <button onClick={() => addMeal(activeProgramDay)}
                                                className="w-full py-2 border border-dashed border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1">
                                                <Plus size={14} /> Add Meal
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* ATTENDANCE TAB */}
                {activeTab === 'attendance' && (

                    <div className="space-y-6">
                        <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 shadow-xl">
                            <h2 className="text-lg font-bold text-white mb-5 uppercase tracking-wider flex items-center gap-2">
                                <Activity size={20} className="text-orange-500" /> Facility Access Protocol
                            </h2>
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 w-full">
                                    <label className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 block">Member Identity Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Scan ID, Name, or Email..."
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all"
                                            value={userSearch}
                                            onChange={e => setUserSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* User Search Results for Check-in */}
                            {userSearch && (
                                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {users.filter(u => 
                                        u.username.toLowerCase().includes(userSearch.toLowerCase()) || 
                                        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                                        (u.memberId && u.memberId.toLowerCase().includes(userSearch.toLowerCase()))
                                    ).slice(0, 5).map(u => (
                                        <div key={u._id} className="bg-zinc-900/80 p-4 rounded-xl flex justify-between items-center border border-zinc-800 hover:border-zinc-700 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black text-sm">
                                                    {u.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold text-sm flex items-center gap-2">
                                                        {u.username}
                                                        {u.memberId && <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">#{u.memberId}</span>}
                                                    </div>
                                                    <div className="text-xs text-zinc-500 font-medium">{u.email}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleCheckIn(u._id)} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-500/20 uppercase tracking-wider transition-colors">Authorize Entry</button>
                                                <button onClick={() => handleCheckOut(u._id)} className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-500/20 uppercase tracking-wider transition-colors">Log Exit</button>
                                            </div>
                                        </div>
                                    ))}
                                    {users.filter(u => u.username.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()) || (u.memberId && u.memberId.toLowerCase().includes(userSearch.toLowerCase()))).length === 0 && (
                                        <div className="text-center py-4 text-zinc-500 text-sm font-medium">No members found matching query.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 shadow-xl">
                            <h2 className="text-sm font-bold text-zinc-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active Deployments ({activeCheckIns.length})
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                            <th className="pb-4 px-2">Personnel</th>
                                            <th className="pb-4 px-2">Entry Time</th>
                                            <th className="pb-4 px-2">Status</th>
                                            <th className="pb-4 px-2 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-white text-sm divide-y divide-zinc-800/50">
                                        {activeCheckIns && activeCheckIns.length > 0 ? activeCheckIns.map(a => (
                                            <tr key={a._id} className="group hover:bg-zinc-800/30 transition-colors">
                                                <td className="py-4 px-2">
                                                    <div className="font-bold text-sm text-zinc-100">{a.user?.username || 'Unknown'}</div>
                                                    {a.user?.memberId && <div className="text-[10px] font-mono text-zinc-500 mt-0.5">ID: {a.user.memberId}</div>}
                                                </td>
                                                <td className="py-4 px-2 font-mono text-zinc-400 text-xs">
                                                    {new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="py-4 px-2">
                                                    <span className="text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">Operational</span>
                                                </td>
                                                <td className="py-4 px-2 text-right">
                                                    <button onClick={() => handleCheckOut(a.user?._id)} className="text-zinc-500 hover:text-red-400 text-[10px] font-black uppercase tracking-wider transition-colors border border-transparent hover:border-red-500/20 hover:bg-red-500/10 px-3 py-1.5 rounded-md">Log Exit</button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="4" className="py-8 text-center text-zinc-600 text-sm font-bold">Facility is currently empty</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* PAYMENTS TAB */}
                {activeTab === 'payments' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Payment History</h2>
                            <button
                                onClick={() => { setPaymentForm({ userId: '', planId: '', amount: '', method: 'cash', status: 'completed', notes: '' }); setShowPaymentModal(true); }}
                                className="bg-gym-accent text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gym-accent/90"
                            >
                                <Plus size={18} /> Record Payment
                            </button>
                        </div>

                        <div className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-black/30">
                                    <tr className="text-gray-400 text-xs uppercase">
                                        <th className="p-4">Invoice</th>
                                        <th className="p-4">User</th>
                                        <th className="p-4">Plan/Item</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Method</th>
                                        <th className="p-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-white text-sm divide-y divide-white/5">
                                    {payments.map(payment => (
                                        <tr key={payment._id} className="hover:bg-white/5">
                                            <td className="p-4 font-mono text-xs text-gray-400">{payment.invoiceNumber}</td>
                                            <td className="p-4 font-bold">{payment.user?.username || 'Unknown'}</td>
                                            <td className="p-4">{payment.plan?.name || 'Manual'}</td>
                                            <td className="p-4 text-gym-accent font-bold">₹{payment.amount}</td>
                                            <td className="p-4">{new Date(payment.date).toLocaleDateString()}</td>
                                            <td className="p-4 capitalize">{payment.method}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${payment.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                                    payment.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                        'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* MODALS */}
                {showPaymentModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg">
                            <h2 className="text-2xl font-bold text-white mb-6">Record New Payment</h2>
                            <form onSubmit={handleCreatePayment} className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">User</label>
                                    <select required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none"
                                        value={paymentForm.userId} onChange={e => setPaymentForm({ ...paymentForm, userId: e.target.value })}>
                                        <option value="">Select User</option>
                                        {users.map(u => <option key={u._id} value={u._id}>{u.username} ({u.email})</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Plan (Optional)</label>
                                        <select className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none"
                                            value={paymentForm.planId} onChange={e => setPaymentForm({ ...paymentForm, planId: e.target.value })}>
                                            <option value="">None</option>
                                            {plans.map(p => <option key={p._id} value={p._id}>{p.name} - ₹{p.price}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Amount (₹)</label>
                                        <input required type="number" step="0.01" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none"
                                            value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Payment Method</label>
                                        <select className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none"
                                            value={paymentForm.method} onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}>
                                            <option value="cash">Cash</option>
                                            <option value="card">Card</option>
                                            <option value="upi">UPI</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Status</label>
                                        <select className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none"
                                            value={paymentForm.status} onChange={e => setPaymentForm({ ...paymentForm, status: e.target.value })}>
                                            <option value="completed">Completed</option>
                                            <option value="pending">Pending</option>
                                            <option value="failed">Failed</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Notes</label>
                                    <textarea className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none h-20 resize-none"
                                        value={paymentForm.notes} onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })} />
                                </div>
                                <div className="flex gap-4 mt-6">
                                    <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 bg-white/10 text-white py-3 rounded-lg font-bold hover:bg-white/20">Cancel</button>
                                    <button type="submit" className="flex-1 bg-gym-accent text-white py-3 rounded-lg font-bold hover:bg-gym-accent/90">Record Payment</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {showPlanModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-md w-full my-8">
                            <h2 className="text-2xl font-bold text-white mb-6">{editingPlan ? 'Edit Plan' : 'Create Plan'}</h2>
                            <form onSubmit={handleSavePlan} className="space-y-4">
                                <input placeholder="Plan Name" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white" value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })} required />
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="Price" type="number" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white" value={planForm.price} onChange={e => setPlanForm({ ...planForm, price: e.target.value })} required />
                                    <input placeholder="Duration (Months)" type="number" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white" value={planForm.durationMonths} onChange={e => setPlanForm({ ...planForm, durationMonths: e.target.value })} required />
                                </div>
                                <select className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white" value={planForm.type} onChange={e => setPlanForm({ ...planForm, type: e.target.value })}>
                                    <option value="starter">Starter</option>
                                    <option value="pro">Pro</option>
                                    <option value="elite">Elite</option>
                                    <option value="custom">Custom</option>
                                </select>
                                <textarea placeholder="Description" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white h-20" value={planForm.description} onChange={e => setPlanForm({ ...planForm, description: e.target.value })} required />
                                <textarea placeholder="Features (comma separated)" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white h-20" value={planForm.features} onChange={e => setPlanForm({ ...planForm, features: e.target.value })} />
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="isActive" checked={planForm.isActive} onChange={e => setPlanForm({ ...planForm, isActive: e.target.checked })} />
                                    <label htmlFor="isActive" className="text-white text-sm">Active</label>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowPlanModal(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5">Cancel</button>
                                    <button type="submit" className="flex-1 bg-gym-accent text-white py-3 rounded-xl font-bold shadow-lg shadow-gym-accent/20">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* PRODUCT MODAL */}
                {showProductModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-md w-full">
                            <h2 className="text-2xl font-bold text-white mb-6">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                            <form onSubmit={handleSaveProduct} className="space-y-4">
                                <input placeholder="Name" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} required />
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="Price" type="number" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required />
                                    <input placeholder="Stock" type="number" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} required />
                                </div>
                                <select className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gym-accent outline-none" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} required>
                                    <option value="">Select Category</option>
                                    <option value="Supplements">Supplements</option>
                                    <option value="Gear">Gear</option>
                                    <option value="Apparel">Apparel</option>
                                    <option value="Equipment">Equipment</option>
                                    <option value="Other">Other</option>
                                </select>
                                <input placeholder="Image URL" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white" value={productForm.image} onChange={e => setProductForm({ ...productForm, image: e.target.value })} required />
                                <textarea placeholder="Description" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white h-24" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} required />
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowProductModal(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5">Cancel</button>
                                    <button type="submit" className="flex-1 bg-gym-accent text-white py-3 rounded-xl font-bold shadow-lg shadow-gym-accent/20">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* CLASS MODAL */}
                {showClassModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-md w-full">
                            <h2 className="text-2xl font-bold text-white mb-6">Schedule Class</h2>
                            <form onSubmit={handleSaveClass} className="space-y-4">
                                <input placeholder="Class Name" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white" value={classForm.name} onChange={e => setClassForm({ ...classForm, name: e.target.value })} required />
                                <textarea placeholder="Description" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white h-24" value={classForm.description} onChange={e => setClassForm({ ...classForm, description: e.target.value })} />
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="Duration (min)" type="number" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white" value={classForm.durationMinutes} onChange={e => setClassForm({ ...classForm, durationMinutes: e.target.value })} required />
                                    <input placeholder="Capacity" type="number" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white" value={classForm.capacity} onChange={e => setClassForm({ ...classForm, capacity: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Start Time</label>
                                    <input type="datetime-local" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white" value={classForm.startTime} onChange={e => setClassForm({ ...classForm, startTime: e.target.value })} required />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowClassModal(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5">Cancel</button>
                                    <button type="submit" className="flex-1 bg-gym-accent text-white py-3 rounded-xl font-bold shadow-lg shadow-gym-accent/20">Schedule</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
