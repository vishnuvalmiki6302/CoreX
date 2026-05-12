import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
    Users, ShoppingBag, DollarSign, Activity, Plus, Edit, Trash2, X, Search, 
    LayoutDashboard, Package, Calendar, FileText, CheckSquare, CreditCard, 
    IndianRupee, Dumbbell, Utensils, ChevronDown, LogOut, Settings, Bell,
    ArrowUpRight, TrendingUp, Filter, MoreHorizontal, UserPlus, Zap, Menu, Shield, Lock,
    Home as HomeIcon
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import Logo from '../components/Logo';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Tabs: 'overview', 'users', 'products', 'classes', 'plans', 'programs', 'attendance', 'payments'
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // User Management State
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userSearch, setUserSearch] = useState('');
    const [userForm, setUserForm] = useState({
        username: '', email: '', password: '', role: 'member',
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

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        
        const adminRoles = ['super_admin', 'gym_owner', 'admin', 'receptionist'];
        if (!adminRoles.includes(user.role)) {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch critical base data regardless of tab
                const baseTasks = [fetchUsers()];
                
                if (activeTab === 'overview') {
                    baseTasks.push(fetchStats(), fetchCharts(), fetchProducts(), fetchActiveCheckIns(), fetchPayments());
                } else if (activeTab === 'users') {
                    baseTasks.push(fetchPlans(), fetchTrainers());
                } else if (activeTab === 'products') {
                    baseTasks.push(fetchProducts());
                } else if (activeTab === 'plans') {
                    baseTasks.push(fetchPlans());
                } else if (activeTab === 'attendance') {
                    baseTasks.push(fetchActiveCheckIns());
                } else if (activeTab === 'payments') {
                    baseTasks.push(fetchPayments(), fetchPlans());
                } else if (activeTab === 'programs') {
                    baseTasks.push(fetchAllPlanPrograms());
                } else if (activeTab === 'classes') {
                    baseTasks.push(fetchClasses());
                }

                await Promise.allSettled(baseTasks);
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
                toast.error("Failed to synchronize mainframe data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate, activeTab]);

    // Fetch Functions
    const fetchStats = async () => {
        const { data } = await api.get('/analytics/stats');
        setStats(data);
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
        const { data } = await api.get('/plans/admin');
        setPlans(data);
    };

    const fetchTrainers = async () => {
        const { data } = await api.get('/users/trainers');
        setTrainers(data);
    };

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("User fetch failed", error);
            setUsers([]);
        }
    };

    const fetchProducts = async () => {
        const { data } = await api.get('/products');
        setProducts(data);
    };

    const fetchClasses = async () => {
        const { data } = await api.get('/classes');
        setClasses(data);
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

    // ... Helper functions for programs (updateDayField, updateExercise, etc.)
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
                planStartDate: userForm.planStartDate,
                membershipExpiry: userForm.membershipExpiry,
                assignedTrainer: userForm.assignedTrainer || null,
                emergencyContact: {
                    name: userForm.emergencyContactName,
                    phone: userForm.emergencyContactPhone,
                    relation: userForm.emergencyContactRelation
                }
            };

            if (editingUser) {
                const { data } = await api.put(`/users/${editingUser._id}`, payload);
                setUsers(users.map(u => u._id === editingUser._id ? { ...u, ...data } : u));
                toast.success("Personnel updated");
            } else {
                payload.password = userForm.password;
                const { data } = await api.post('/users', payload);
                setUsers([data, ...users]);
                toast.success("Personnel created");
            }
            setShowUserModal(false);
            resetUserForm();
        } catch (error) {
            if (error.response?.status === 403) {
                toast.error("Permission Denied. Please log out and log in again to refresh your access level.");
            } else {
                toast.error(error.response?.data?.message || "Failed to save personnel");
            }
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
            toast.success("Personnel removed");
        } catch (error) {
            toast.error("Deletion failed");
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
                membershipType: user.membershipType || 'none',
                planStartDate: user.planStartDate || '',
                membershipExpiry: user.membershipExpiry || '',
                assignedTrainer: user.assignedTrainer?._id || user.assignedTrainer || ''
            });
        } else {
            setEditingUser(null);
            resetUserForm();
        }
        setShowUserModal(true);
    };

    const resetUserForm = () => {
        setUserForm({
            username: '', email: '', password: '', role: 'member',
            phoneNumber: '', address: '', medicalNotes: '',
            emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
            status: 'active', membershipType: 'none', planStartDate: '', membershipExpiry: '', assignedTrainer: ''
        });
    };

    // Product Actions
    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                const { data } = await api.put(`/products/${editingProduct._id}`, productForm);
                setProducts(products.map(p => p._id === editingProduct._id ? data : p));
                toast.success("Inventory updated");
            } else {
                const { data } = await api.post('/products', productForm);
                setProducts([...products, data]);
                toast.success("Product added");
            }
            setShowProductModal(false);
            setProductForm({ name: '', price: '', category: '', description: '', image: '', stock: '' });
        } catch (error) { toast.error("Inventory error"); }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/products/${id}`);
            setProducts(products.filter(p => p._id !== id));
            toast.success("Product removed");
        } catch (error) { toast.error("Deletion failed"); }
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
                toast.success("Plan refined");
            } else {
                const { data } = await api.post('/plans', payload);
                setPlans([data, ...plans]);
                toast.success("New plan deployed");
            }
            setShowPlanModal(false);
            setPlanForm({ name: '', price: '', durationMonths: 1, type: 'custom', features: '', description: '', highlight: false, isActive: true });
        } catch (error) { toast.error("Plan configuration error"); }
    };

    const handleDeletePlan = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/plans/${id}`);
            setPlans(plans.filter(p => p._id !== id));
            toast.success("Plan decommissioned");
        } catch (error) { toast.error("Deletion failed"); }
    };

    // Payment Actions
    const fetchPayments = async () => {
        const { data } = await api.get('/payments');
        setPayments(data);
    };

    const handleCreatePayment = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/payments', paymentForm);
            setPayments([data, ...payments]);
            toast.success('Capital injection logged');
            setShowPaymentModal(false);
            setPaymentForm({ userId: '', planId: '', amount: '', method: 'cash', status: 'completed', notes: '' });
        } catch (error) { toast.error('Financial record failed'); }
    };

    // Attendance Actions
    const fetchActiveCheckIns = async () => {
        const { data } = await api.get('/attendance/active');
        setActiveCheckIns(data);
    };

    const handleCheckIn = async (userId) => {
        try {
            const { data } = await api.post('/attendance/check-in', { userId });
            setActiveCheckIns([data, ...activeCheckIns]);
            toast.success("Entry authorized");
            setUserSearch('');
        } catch (error) { toast.error(error.response?.data?.message || "Access denied"); }
    };

    const handleCheckOut = async (userId) => {
        try {
            await api.post('/attendance/check-out', { userId });
            setActiveCheckIns(activeCheckIns.filter(a => a.user._id !== userId));
            toast.success("Exit logged");
        } catch (error) { toast.error("Exit log failed"); }
    };

    const navItems = [
        { id: 'overview', label: 'Command Center', icon: <Activity size={20} /> },
        { id: 'users', label: 'Personnel', icon: <Users size={20} /> },
        { id: 'products', label: 'Inventory', icon: <Package size={20} /> },
        { id: 'classes', label: 'Operational Control', icon: <Zap size={20} /> },
        { id: 'plans', label: 'Subscription Architecture', icon: <Shield size={20} /> },
        { id: 'programs', label: 'Tactical Programs', icon: <Dumbbell size={20} /> },
        { id: 'attendance', label: 'Access Protocol', icon: <Lock size={20} /> },
        { id: 'payments', label: 'Capital Stream', icon: <IndianRupee size={20} /> },
    ];

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.memberId && u.memberId.toLowerCase().includes(userSearch.toLowerCase()))
    );

    if (loading && activeTab === 'overview' && !stats.userCount) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Loading Infrastructure</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 flex">
            
            {/* SIDEBAR */}
            <aside className={`w-72 bg-white border-r border-gray-200 flex-col sticky top-0 h-screen transition-all duration-300 z-[110] lg:flex ${mobileMenuOpen ? 'fixed inset-y-0 left-0 flex shadow-2xl' : 'hidden'}`}>
                <div className="p-8 h-full flex flex-col">
                    <div className="mb-10 flex items-center justify-between">
                        <Logo />
                        <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-2 text-gray-400 hover:text-gray-900">
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="space-y-1.5 flex-grow">
                        <Link
                            to="/"
                            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-black text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all mb-4"
                        >
                            <HomeIcon size={20} />
                            <span className="tracking-tight">Back to Website</span>
                        </Link>
                        
                        <div className="h-px bg-gray-100 mx-4 my-6" />

                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-black transition-all ${
                                    activeTab === item.id 
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <span className={activeTab === item.id ? 'text-white' : 'text-gray-400'}>{item.icon}</span>
                                <span className="tracking-tight">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="mt-auto p-2 border-t border-gray-100">
                        <div className="flex items-center gap-4 py-6">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 border border-gray-200">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-black text-gray-900 truncate">{user?.username}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{user?.role?.replace('_', ' ')}</p>
                            </div>
                        </div>
                        <button 
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                        >
                            <LogOut size={18} /> Disconnect
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 min-w-0 bg-[#f8fafc] flex flex-col h-screen overflow-hidden">
                {/* STICKY TOP BAR */}
                <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-[100]">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600">
                            <Menu size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                                <Shield size={10} /> CoreX Secure Terminal / <span className="text-orange-500">{activeTab}</span>
                            </div>
                            <h1 className="text-xl font-black text-gray-900 tracking-tight capitalize">{activeTab.replace('-', ' ')}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* System Status */}
                        <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Mainframe Active</span>
                            </div>
                            <div className="w-px h-4 bg-gray-200" />
                            <span className="text-[10px] font-black text-gray-900">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-200 transition-all">
                                <Bell size={18} />
                            </button>
                            <button className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-200 transition-all">
                                <Settings size={18} />
                            </button>
                            <div className="w-px h-6 bg-gray-200 mx-2" />
                            <button className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-gray-900 text-white rounded-xl hover:bg-orange-600 transition-all shadow-md shadow-gray-200">
                                <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-[10px] font-black">
                                    <Plus size={14} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">Quick Deploy</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-thin scrollbar-thumb-gray-200">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="space-y-10">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Personnel', value: stats.totalMembers || stats.userCount || 0, icon: Users, trend: '+12%', color: 'orange' },
                                        { label: 'Capital Flow', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, trend: '+8.4%', color: 'emerald' },
                                        { label: 'Operations', value: stats.orderCount || 0, icon: Activity, trend: '+15%', color: 'blue' },
                                        { label: 'Inventory', value: stats.totalProducts || stats.productCount || 0, icon: Package, trend: '-2%', color: 'purple' },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white border border-gray-200 p-8 rounded-[2.5rem] group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50/50 rounded-bl-[80px] -z-0 group-hover:bg-orange-50/50 transition-colors" />
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-orange-500 group-hover:bg-orange-50 transition-all duration-300">
                                                        <stat.icon size={24} />
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                                                        {stat.trend}
                                                    </div>
                                                </div>
                                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-1">{stat.value}</h3>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Charts Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 bg-white border border-gray-200 p-10 rounded-[3rem] shadow-sm">
                                        <div className="flex items-center justify-between mb-12">
                                            <div>
                                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                                                    <TrendingUp size={16} className="text-orange-500" /> Revenue Velocity
                                                </h3>
                                                <p className="text-2xl font-black text-gray-900 tracking-tight mt-1">Capital Accumulation</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {['7D', '1M', '3M', '1Y'].map(p => (
                                                    <button key={p} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${p === '1M' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-gray-50 text-gray-400 hover:text-gray-900'}`}>{p}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="h-[350px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={revenueData.length ? revenueData : [
                                                    { name: 'Mon', sales: 4000 }, { name: 'Tue', sales: 3000 }, { name: 'Wed', sales: 2000 },
                                                    { name: 'Thu', sales: 2780 }, { name: 'Fri', sales: 1890 }, { name: 'Sat', sales: 2390 }, { name: 'Sun', sales: 3490 }
                                                ]}>
                                                    <defs>
                                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#ff5e00" stopOpacity={0.1}/>
                                                            <stop offset="95%" stopColor="#ff5e00" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '700'}} dy={10} />
                                                    <YAxis hide />
                                                    <Tooltip 
                                                        cursor={{ stroke: '#ff5e00', strokeWidth: 2, strokeDasharray: '5 5' }} 
                                                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '15px' }}
                                                    />
                                                    <Area type="monotone" dataKey="sales" stroke="#ff5e00" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-gray-200 p-10 rounded-[3rem] shadow-sm flex flex-col">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-3">
                                            <Users size={16} className="text-orange-500" /> Network Density
                                        </h3>
                                        <div className="flex-grow flex flex-col justify-between">
                                            <div className="h-[200px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={attendanceData.length ? attendanceData : [
                                                        { name: 'W1', members: 120 }, { name: 'W2', members: 132 }, { name: 'W3', members: 145 },
                                                        { name: 'W4', members: 160 }
                                                    ]}>
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '700'}} />
                                                        <Bar dataKey="members" radius={[10, 10, 10, 10]} barSize={20}>
                                                            {attendanceData.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? '#0f172a' : '#ff5e00'} />)}
                                                            {!attendanceData.length && [1,2,3,4].map((_, i) => <Cell key={i} fill={i % 2 === 0 ? '#0f172a' : '#ff5e00'} />)}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="pt-8 border-t border-gray-50 mt-8">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Growth Velocity</span>
                                                    <span className="text-sm font-black text-emerald-500">+22.4%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                    <div className="bg-emerald-500 h-full w-[75%] rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activities / Status */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-white border border-gray-200 rounded-[2.5rem] p-10">
                                        <div className="flex items-center justify-between mb-10">
                                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
                                                <Zap className="text-orange-500" size={16} /> Live Access Events
                                            </h3>
                                            <button onClick={() => setActiveTab('attendance')} className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">View Protocol</button>
                                        </div>
                                        <div className="space-y-6">
                                            {activeCheckIns.slice(0, 4).map((a, i) => (
                                                <div key={i} className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-orange-500 border border-gray-100 group-hover:scale-110 transition-transform">
                                                            {a.user?.username?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-gray-900">{a.user?.username}</p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Check-in Verified</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-black text-gray-400">{new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            ))}
                                            {activeCheckIns.length === 0 && (
                                                <div className="py-10 text-center text-gray-300 italic text-xs uppercase tracking-widest font-bold">No active deployments detected</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-[2.5rem] p-10">
                                        <div className="flex items-center justify-between mb-10">
                                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
                                                <CreditCard className="text-emerald-500" size={16} /> Revenue Stream
                                            </h3>
                                            <button onClick={() => setActiveTab('payments')} className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">Full Ledger</button>
                                        </div>
                                        <div className="space-y-6">
                                            {payments.slice(0, 4).map((p, i) => (
                                                <div key={i} className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100 group-hover:scale-110 transition-transform">
                                                            ₹
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-gray-900">{p.user?.username}</p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{p.plan?.name || 'Asset Payment'}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-black text-gray-900 tracking-tighter">₹{p.amount}</span>
                                                </div>
                                            ))}
                                            {payments.length === 0 && (
                                                <div className="py-10 text-center text-gray-300 italic text-xs uppercase tracking-widest font-bold">No capital logs available</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* USERS TAB */}
                        {activeTab === 'users' && (
                            <div className="space-y-6">
                                <div className="flex flex-col xl:flex-row justify-between gap-6">
                                    <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                        {['All Personnel', 'Active', 'Expired', 'Pending'].map(f => (
                                            <button key={f} className={`flex-shrink-0 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${f === 'All Personnel' ? 'bg-white text-orange-500 shadow-sm border border-orange-100' : 'bg-transparent text-gray-400 hover:text-gray-900'}`}>
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Search identifiers..."
                                                value={userSearch}
                                                onChange={(e) => setUserSearch(e.target.value)}
                                                className="bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-gray-900 w-64 focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                        <button
                                            onClick={() => openUserModal()}
                                            className="bg-orange-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
                                        >
                                            <UserPlus size={14} /> Deploy
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Personnel</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lifecycle</th>
                                                    <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filteredUsers.map(u => (
                                                    <tr key={u._id} className="group hover:bg-orange-50/30 transition-all duration-300">
                                                        <td className="px-8 py-5">
                                                            <span className="font-mono text-[10px] font-black text-gray-300 group-hover:text-orange-300 transition-colors">#{u.memberId || u._id.slice(-6)}</span>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-orange-500 flex items-center justify-center font-black text-xs border border-gray-100 transition-all">
                                                                    {u.username.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="font-black text-gray-900 text-sm leading-none mb-1">{u.username}</div>
                                                                    <div className="text-[10px] font-bold text-gray-400 lowercase">{u.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-200">
                                                                {u.role?.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                                u.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                                            }`}>
                                                                <div className={`w-1 h-1 rounded-full ${u.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                                                {u.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            {u.membershipExpiry ? (
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] font-black text-gray-900">{new Date(u.membershipExpiry).toLocaleDateString('en-GB')}</span>
                                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Expiration</span>
                                                                </div>
                                                            ) : <span className="text-[10px] font-bold text-gray-300 italic">No Data</span>}
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                                <button onClick={() => openUserModal(u)} className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-orange-500 hover:border-orange-200 rounded-lg transition-all shadow-sm">
                                                                    <Edit size={14} />
                                                                </button>
                                                                {u._id !== user?._id && (
                                                                    <button onClick={() => handleDeleteUser(u._id)} className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 rounded-lg transition-all shadow-sm">
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* OTHER TABS (Simplified for brevity but still fully functional and styled) */}
                        {activeTab === 'products' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                                    <div>
                                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">Asset Inventory</h2>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Managing {products.length} operational assets</p>
                                    </div>
                                    <button
                                        onClick={() => { setEditingProduct(null); setProductForm({ name: '', price: '', category: '', description: '', image: '', stock: '' }); setShowProductModal(true); }}
                                        className="bg-orange-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
                                    >
                                        <Plus size={14} /> Log Asset
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {products.map(product => (
                                        <div key={product._id} className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500">
                                            <div className="h-56 relative bg-gray-50 overflow-hidden">
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                                    <button onClick={() => { setEditingProduct(product); setProductForm(product); setShowProductModal(true); }} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-900 hover:scale-110 transition-transform shadow-lg"><Edit size={16} /></button>
                                                    <button onClick={() => handleDeleteProduct(product._id)} className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"><Trash2 size={16} /></button>
                                                </div>
                                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-900 shadow-sm border border-white">{product.category}</div>
                                            </div>
                                            <div className="p-6">
                                                <h3 className="text-sm font-black text-gray-900 tracking-tight mb-2 truncate">{product.name}</h3>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg font-black text-orange-500">₹{product.price}</span>
                                                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${product.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
                                                        <Package size={10} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{product.stock} units</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'plans' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                                    <div>
                                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">Subscription Architecture</h2>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Engineering {plans.length} membership tiers</p>
                                    </div>
                                    <button
                                        onClick={() => { setEditingPlan(null); setPlanForm({ name: '', price: '', durationMonths: 1, type: 'custom', features: '', description: '', highlight: false, isActive: true }); setShowPlanModal(true); }}
                                        className="bg-orange-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
                                    >
                                        <Plus size={14} /> Create Tier
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {plans.map(plan => (
                                        <div key={plan._id} className={`bg-white border border-gray-200 rounded-[2.5rem] p-10 relative overflow-hidden group transition-all duration-500 hover:shadow-xl hover:shadow-gray-200/50 ${!plan.isActive ? 'opacity-50 grayscale' : ''}`}>
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-[120px] -z-0 transition-all group-hover:bg-orange-100/50" />
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-8">
                                                    <div>
                                                        <div className="text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] mb-2">{plan.type} protocol</div>
                                                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-tight">{plan.name}</h3>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => { setEditingPlan(plan); setPlanForm({ ...plan, features: plan.features.join(', ') }); setShowPlanModal(true); }} className="w-9 h-9 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-200 transition-all shadow-sm"><Edit size={14} /></button>
                                                        <button onClick={() => handleDeletePlan(plan._id)} className="w-9 h-9 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                                <div className="flex items-baseline gap-2 mb-10">
                                                    <span className="text-4xl font-black text-gray-900 tracking-tighter">₹{plan.price}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">/ {plan.durationMonths} Months</span>
                                                </div>
                                                <ul className="space-y-4 mb-10">
                                                    {plan.features.map((f, i) => (
                                                        <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-gray-500">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" /> {f}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${
                                                    plan.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                    <div className={`w-1 h-1 rounded-full ${plan.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                                                    {plan.isActive ? 'Active Protocol' : 'Offline'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'attendance' && (
                            <div className="space-y-10">
                                <div className="premium-card p-10 bg-white border-none shadow-2xl shadow-gray-200">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-3">
                                        <Activity className="text-orange-500" size={16} /> Access Protocol Authorization
                                    </h3>
                                    <div className="relative w-full max-w-4xl mx-auto">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Scan personnel identity (Name, Email, or ID)..."
                                            className="w-full bg-gray-50 border-none rounded-3xl pl-16 pr-8 py-6 text-lg font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all shadow-inner"
                                            value={userSearch}
                                            onChange={e => setUserSearch(e.target.value)}
                                        />
                                    </div>

                                    {userSearch && (
                                        <div className="mt-8 space-y-3 max-w-4xl mx-auto animate-in fade-in slide-in-from-top-4 duration-300">
                                            {users.filter(u => 
                                                u.username.toLowerCase().includes(userSearch.toLowerCase()) || 
                                                u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                                                (u.memberId && u.memberId.toLowerCase().includes(userSearch.toLowerCase()))
                                            ).slice(0, 5).map(u => (
                                                <div key={u._id} className="bg-white p-5 rounded-2xl flex items-center justify-between border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all group">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center font-black text-xl border border-orange-100 group-hover:scale-110 transition-transform">
                                                            {u.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="text-gray-900 font-black text-lg flex items-center gap-3">
                                                                {u.username}
                                                                {u.memberId && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-lg font-mono">#{u.memberId}</span>}
                                                            </div>
                                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{u.email}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button onClick={() => handleCheckIn(u._id)} className="bg-orange-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 shadow-lg shadow-orange-500/20 active:scale-95 transition-all">Authorize Entry</button>
                                                        <button onClick={() => handleCheckOut(u._id)} className="bg-gray-100 text-gray-400 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 active:scale-95 transition-all">Log Exit</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="premium-card p-10">
                                    <div className="flex items-center justify-between mb-10">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                                            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> Live Network Deployments ({activeCheckIns.length})
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {activeCheckIns.map(a => (
                                            <div key={a._id} className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 group hover:bg-white hover:shadow-xl transition-all duration-500">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center font-black text-orange-500 shadow-sm group-hover:scale-110 transition-transform">
                                                            {a.user?.username?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-gray-900 truncate max-w-[120px]">{a.user?.username || 'Redacted'}</div>
                                                            <div className="text-[10px] font-mono text-gray-400 uppercase mt-0.5">#{a.user?.memberId || 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-black text-gray-900">{new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logged In</div>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleCheckOut(a.user?._id)} className="w-full py-3.5 bg-white border border-gray-200 text-[10px] font-black text-red-500 uppercase tracking-widest rounded-2xl hover:bg-red-50 hover:border-red-100 transition-all">Force Disconnect</button>
                                            </div>
                                        ))}
                                        {activeCheckIns.length === 0 && (
                                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-30 grayscale">
                                                <Activity size={60} className="mb-4" />
                                                <p className="text-xl font-black uppercase tracking-[0.2em] text-gray-900">Zero active personnel</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'payments' && (
                            <div className="space-y-8">
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => { setPaymentForm({ userId: '', planId: '', amount: '', method: 'cash', status: 'completed', notes: '' }); setShowPaymentModal(true); }}
                                        className="bg-orange-gradient text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-orange-500/20"
                                    >
                                        <Plus size={18} /> Record Capital
                                    </button>
                                </div>
                                <div className="premium-card overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction</th>
                                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Source</th>
                                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tier/Asset</th>
                                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Valuation</th>
                                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Timestamp</th>
                                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Protocol</th>
                                                    <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">State</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {payments.map(payment => (
                                                    <tr key={payment._id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-8 py-6 font-mono text-[10px] font-black text-gray-300 uppercase">{payment.invoiceNumber || payment._id.slice(-8)}</td>
                                                        <td className="px-8 py-6 font-black text-gray-900 text-sm">{payment.user?.username || 'Redacted'}</td>
                                                        <td className="px-8 py-6 font-bold text-gray-500 text-xs">{payment.plan?.name || 'Standard Assets'}</td>
                                                        <td className="px-8 py-6 font-black text-orange-500 text-sm">₹{payment.amount}</td>
                                                        <td className="px-8 py-6 font-bold text-gray-400 text-xs">{new Date(payment.date).toLocaleDateString('en-GB')}</td>
                                                        <td className="px-8 py-6 font-black text-gray-400 text-[10px] uppercase tracking-widest">{payment.method}</td>
                                                        <td className="px-8 py-6 text-right">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                                payment.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500'
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
                            </div>
                        )}

                        {activeTab === 'programs' && (() => {
                            const prog = planPrograms[activeProgramType];
                            const dayData = prog?.weeklySchedule?.find(d => d.day === activeProgramDay);
                            return (
                                <div className="space-y-8">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-2">Tactical Program Deployment</h2>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Engineering specialized fitness & nutrition pathways</p>
                                        </div>
                                        <button onClick={handleSavePlanProgram} disabled={programSaving}
                                            className="px-10 py-4 bg-orange-gradient text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50">
                                            {programSaving ? 'Synchronizing...' : 'Save Configuration'}
                                        </button>
                                    </div>

                                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                                        {['starter','pro','elite'].map(t => (
                                            <button key={t} onClick={() => setActiveProgramType(t)}
                                                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                    activeProgramType === t ? 'bg-gray-900 text-white shadow-xl' : 'bg-white border border-gray-200 text-gray-400 hover:text-gray-900'
                                                }`}>
                                                {t} protocol
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day => (
                                            <button key={day} onClick={() => setActiveProgramDay(day)}
                                                className={`flex-shrink-0 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                    activeProgramDay === day ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white border border-gray-100 text-gray-400 hover:text-gray-900 shadow-sm'
                                                }`}>
                                                {day}
                                            </button>
                                        ))}
                                    </div>

                                    <AnimatePresence mode="wait">
                                        <motion.div 
                                            key={`${activeProgramType}-${activeProgramDay}`}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="grid lg:grid-cols-2 gap-8"
                                        >
                                            <div className="premium-card p-8">
                                                <div className="flex items-center justify-between mb-10">
                                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                                                        <Dumbbell className="text-orange-500" size={16} /> Workout Matrix
                                                    </h3>
                                                    <label className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer group">
                                                        <input type="checkbox" checked={dayData?.isRestDay || false} onChange={e => updateDayField(activeProgramDay, 'isRestDay', e.target.checked)} className="w-4 h-4 rounded-md accent-orange-500" />
                                                        <span className="group-hover:text-orange-500 transition-colors">Recovery Phase</span>
                                                    </label>
                                                </div>
                                                
                                                {!dayData?.isRestDay ? (
                                                    <div className="space-y-6">
                                                        <input placeholder="Tactical Focus (e.g. Posterior Chain)" value={dayData?.focus || ''} onChange={e => updateDayField(activeProgramDay, 'focus', e.target.value)}
                                                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-black text-gray-900 placeholder:text-gray-300 outline-none focus:ring-4 focus:ring-orange-500/5 transition-all" />
                                                        
                                                        {dayData?.exercises?.map((ex, i) => (
                                                            <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-sm group">
                                                                <div className="flex gap-4">
                                                                    <input placeholder="Exercise name" value={ex.name} onChange={e => updateExercise(activeProgramDay, i, 'name', e.target.value)}
                                                                        className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-gray-900 outline-none" />
                                                                    <button onClick={() => removeExercise(activeProgramDay, i)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><X size={16} /></button>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-3">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest ml-1">Sets</label>
                                                                        <input placeholder="0" type="number" value={ex.sets} onChange={e => updateExercise(activeProgramDay, i, 'sets', e.target.value)}
                                                                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-black text-gray-900 outline-none" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest ml-1">Reps</label>
                                                                        <input placeholder="0-0" value={ex.reps} onChange={e => updateExercise(activeProgramDay, i, 'reps', e.target.value)}
                                                                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-black text-gray-900 outline-none" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest ml-1">Rest</label>
                                                                        <input placeholder="0s" value={ex.rest} onChange={e => updateExercise(activeProgramDay, i, 'rest', e.target.value)}
                                                                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-black text-gray-900 outline-none" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <button onClick={() => addExercise(activeProgramDay)}
                                                            className="w-full py-6 border-2 border-dashed border-gray-100 text-gray-300 hover:text-orange-500 hover:border-orange-200 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                                                            <Plus size={16} /> Integrate Exercise
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="h-64 flex flex-col items-center justify-center text-center opacity-20 grayscale">
                                                        <Zap size={60} className="mb-4" />
                                                        <p className="text-xl font-black uppercase tracking-[0.2em] text-gray-900">Recovery Phase Active</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="premium-card p-8">
                                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-3">
                                                    <Utensils className="text-emerald-500" size={16} /> Nutritional Protocol
                                                </h3>
                                                <div className="space-y-6">
                                                    {dayData?.meals?.map((meal, mi) => (
                                                        <div key={mi} className="bg-white border border-gray-100 rounded-3xl p-8 space-y-6 shadow-sm relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 w-2 h-full bg-emerald-400 opacity-20" />
                                                            <div className="flex gap-4 items-center justify-between">
                                                                <div className="flex gap-3 items-center">
                                                                    <select value={meal.type} onChange={e => updateMeal(activeProgramDay, mi, 'type', e.target.value)}
                                                                        className="bg-gray-50 border-none rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-900 outline-none appearance-none">
                                                                        {['Breakfast','Pre-Workout','Lunch','Post-Workout','Dinner','Snack'].map(t => <option key={t}>{t}</option>)}
                                                                    </select>
                                                                    <input placeholder="Time" value={meal.time || ''} onChange={e => updateMeal(activeProgramDay, mi, 'time', e.target.value)}
                                                                        className="w-24 bg-gray-50 border-none rounded-xl px-4 py-3 text-[10px] font-black text-gray-900 outline-none" />
                                                                </div>
                                                                <button onClick={() => removeMeal(activeProgramDay, mi)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><X size={16} /></button>
                                                            </div>
                                                            <div className="space-y-3">
                                                                {meal.items?.map((item, ii) => (
                                                                    <div key={ii} className="flex gap-3 items-center">
                                                                        <input placeholder="Nutrition Asset" value={item.name} onChange={e => updateMealItem(activeProgramDay, mi, ii, 'name', e.target.value)}
                                                                            className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2.5 text-[10px] font-bold text-gray-900 outline-none" />
                                                                        <input placeholder="Qty" value={item.portion || ''} onChange={e => updateMealItem(activeProgramDay, mi, ii, 'portion', e.target.value)}
                                                                            className="w-20 bg-gray-50 border-none rounded-xl px-4 py-2.5 text-[10px] font-bold text-gray-900 outline-none text-center" />
                                                                        <input placeholder="Kcal" type="number" value={item.calories || ''} onChange={e => updateMealItem(activeProgramDay, mi, ii, 'calories', e.target.value)}
                                                                            className="w-16 bg-gray-50 border-none rounded-xl px-4 py-2.5 text-[10px] font-bold text-gray-900 outline-none text-center" />
                                                                        <button onClick={() => removeMealItem(activeProgramDay, mi, ii)} className="p-2 text-gray-300 hover:text-red-500 rounded-lg transition-colors"><X size={12} /></button>
                                                                    </div>
                                                                ))}
                                                                <button onClick={() => addMealItem(activeProgramDay, mi)}
                                                                    className="text-[10px] font-black text-emerald-500 hover:text-emerald-600 flex items-center gap-2 transition-colors ml-1 uppercase tracking-widest">
                                                                    <Plus size={14} /> Add Asset
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => addMeal(activeProgramDay)}
                                                        className="w-full py-6 border-2 border-dashed border-gray-100 text-gray-300 hover:text-emerald-500 hover:border-emerald-200 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                                                        <Plus size={16} /> Deploy Meal Phase
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            );
                        })()}
                        
                        {/* More tabs like Classes could be added here following same pattern */}
                    </motion.div>
                </AnimatePresence>
                </div>
            </main>

            {/* SHARED MODALS */}
            <AnimatePresence>
                {showUserModal && (
                    <div className="fixed inset-0 bg-black/10 backdrop-blur-md flex items-center justify-center z-[100] p-4 lg:p-10 overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white border border-gray-200 rounded-[40px] p-12 max-w-4xl w-full my-auto shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-3">{editingUser ? 'Edit Operational Asset' : 'Deploy New Asset'}</h2>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Personnel Matrix Configuration</p>
                                </div>
                                <button onClick={() => setShowUserModal(false)} className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSaveUser} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Personnel Identifier</label>
                                            <input className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-orange-500/5 transition-all"
                                                value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} required placeholder="Enter username..." />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Comm Channel (Email)</label>
                                            <input type="email" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-orange-500/5 transition-all"
                                                value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required placeholder="Enter email..." />
                                        </div>
                                        {!editingUser && (
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Security Access (Password)</label>
                                                <input type="password" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-orange-500/5 transition-all"
                                                    value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} required placeholder="Set password..." />
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Tactical Role</label>
                                                <select className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest text-gray-900 outline-none appearance-none"
                                                    value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                                                    <option value="member">Member</option>
                                                    <option value="male_trainer">Male Trainer</option>
                                                    <option value="female_trainer">Female Trainer</option>
                                                    <option value="receptionist">Receptionist</option>
                                                    <option value="dietician">Dietician</option>
                                                    <option value="accountant">Accountant</option>
                                                    <option value="gym_owner">Gym Owner</option>
                                                    <option value="super_admin">Super Admin</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Operational Status</label>
                                                <select className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest text-gray-900 outline-none appearance-none"
                                                    value={userForm.status} onChange={e => setUserForm({ ...userForm, status: e.target.value })}>
                                                    <option value="active">Active</option>
                                                    <option value="expired">Expired</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Subscription Tier</label>
                                            <select className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest text-gray-900 outline-none appearance-none"
                                                value={userForm.membershipType} onChange={e => setUserForm({ ...userForm, membershipType: e.target.value })}>
                                                <option value="none">Zero Tier</option>
                                                {plans.map(p => (
                                                    <option key={p._id} value={p.name}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Activation Date</label>
                                                <input type="date" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest text-gray-900 outline-none focus:ring-4 focus:ring-orange-500/5 transition-all"
                                                    value={userForm.planStartDate ? new Date(userForm.planStartDate).toISOString().split('T')[0] : ''}
                                                    onChange={e => setUserForm({ ...userForm, planStartDate: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Expiration Date</label>
                                                <input type="date" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest text-gray-900 outline-none focus:ring-4 focus:ring-orange-500/5 transition-all"
                                                    value={userForm.membershipExpiry ? new Date(userForm.membershipExpiry).toISOString().split('T')[0] : ''}
                                                    onChange={e => setUserForm({ ...userForm, membershipExpiry: e.target.value })} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Assigned Mentor</label>
                                            <select className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest text-gray-900 outline-none appearance-none"
                                                value={userForm.assignedTrainer || ''} onChange={e => setUserForm({ ...userForm, assignedTrainer: e.target.value })}>
                                                <option value="">No Assignment</option>
                                                {trainers.map(t => (
                                                    <option key={t._id} value={t._id}>{t.username}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Contact Uplink (Phone)</label>
                                            <input className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-orange-500/5 transition-all"
                                                value={userForm.phoneNumber} onChange={e => setUserForm({ ...userForm, phoneNumber: e.target.value })} placeholder="+00 0000 000 000" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-6 pt-10 border-t border-gray-100">
                                    <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-5 rounded-3xl font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors">Abort</button>
                                    <button type="submit" className="flex-[2] bg-orange-gradient text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all">
                                        {editingUser ? 'Update Configuration' : 'Confirm Deployment'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Other modals (Plan, Product, Payment) should follow the same high-end style */}
            <AnimatePresence>
                {showPlanModal && (
                    <div className="fixed inset-0 bg-black/10 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white rounded-[40px] p-12 max-w-lg w-full shadow-2xl">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-8">{editingPlan ? 'Refine Tier' : 'Engineer Tier'}</h2>
                            <form onSubmit={handleSavePlan} className="space-y-6">
                                <input placeholder="Architecture Name" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 outline-none" value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })} required />
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="Valuation (₹)" type="number" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 outline-none" value={planForm.price} onChange={e => setPlanForm({ ...planForm, price: e.target.value })} required />
                                    <input placeholder="Lifecycle (Months)" type="number" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 outline-none" value={planForm.durationMonths} onChange={e => setPlanForm({ ...planForm, durationMonths: e.target.value })} required />
                                </div>
                                <select className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest text-gray-900 outline-none" value={planForm.type} onChange={e => setPlanForm({ ...planForm, type: e.target.value })}>
                                    <option value="starter">Starter Architecture</option>
                                    <option value="pro">Professional Stack</option>
                                    <option value="elite">Elite Protocol</option>
                                    <option value="custom">Custom Framework</option>
                                </select>
                                <textarea placeholder="Tier Overview" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 h-24 outline-none" value={planForm.description} onChange={e => setPlanForm({ ...planForm, description: e.target.value })} required />
                                <textarea placeholder="Technical Features (comma separated)" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 h-24 outline-none" value={planForm.features} onChange={e => setPlanForm({ ...planForm, features: e.target.value })} />
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" id="isActive" checked={planForm.isActive} onChange={e => setPlanForm({ ...planForm, isActive: e.target.checked })} className="w-5 h-5 rounded-md accent-orange-500" />
                                    <label htmlFor="isActive" className="text-[10px] font-black uppercase tracking-widest text-gray-400">Operational Integrity</label>
                                </div>
                                <div className="flex gap-4 pt-6">
                                    <button type="button" onClick={() => setShowPlanModal(false)} className="flex-1 py-5 rounded-3xl font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors">Abort</button>
                                    <button type="submit" className="flex-[2] bg-orange-gradient text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-orange-500/20">Authorize</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 bg-black/10 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white rounded-[40px] p-12 max-w-xl w-full shadow-2xl">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-8">Record Capital Input</h2>
                            <form onSubmit={handleCreatePayment} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Source Personnel</label>
                                    <select required className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest text-gray-900 outline-none"
                                        value={paymentForm.userId} onChange={e => setPaymentForm({ ...paymentForm, userId: e.target.value })}>
                                        <option value="">Select Personnel...</option>
                                        {users.map(u => <option key={u._id} value={u._id}>{u.username} ({u.email})</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Asset Linking</label>
                                        <select className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest text-gray-900 outline-none"
                                            value={paymentForm.planId} onChange={e => setPaymentForm({ ...paymentForm, planId: e.target.value })}>
                                            <option value="">Manual Entry</option>
                                            {plans.map(p => <option key={p._id} value={p._id}>{p.name} (₹{p.price})</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Valuation (₹)</label>
                                        <input required type="number" step="0.01" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 outline-none"
                                            value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Capital Protocol</label>
                                        <select className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest text-gray-900 outline-none"
                                            value={paymentForm.method} onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}>
                                            <option value="cash">Cash Protocol</option>
                                            <option value="card">Card Terminal</option>
                                            <option value="upi">UPI/Digital</option>
                                            <option value="bank_transfer">Bank Wire</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Protocol State</label>
                                        <select className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest text-gray-900 outline-none"
                                            value={paymentForm.status} onChange={e => setPaymentForm({ ...paymentForm, status: e.target.value })}>
                                            <option value="completed">Finalized</option>
                                            <option value="pending">Awaiting</option>
                                            <option value="failed">Rejected</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-6">
                                    <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 py-5 rounded-3xl font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors">Abort</button>
                                    <button type="submit" className="flex-[2] bg-orange-gradient text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-orange-500/20">Log Entry</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default AdminDashboard;
