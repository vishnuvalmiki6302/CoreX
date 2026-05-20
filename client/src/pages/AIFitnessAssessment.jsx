import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    Zap, User, Activity, Heart, Target, ChevronRight,
    ChevronLeft, Sparkles, Dumbbell, Utensils, Calendar,
    CheckCircle2, Info, Apple, Flame, Scale, Clock,
    ClipboardList, TrendingUp, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

const STEPS = [
    { id: 'personal', label: 'Biometrics', icon: <User size={16} /> },
    { id: 'habits', label: 'Dietary', icon: <Utensils size={16} /> },
    { id: 'goals', label: 'Objectives', icon: <Target size={16} /> },
    { id: 'results', label: 'Protocol', icon: <ClipboardList size={16} /> }
];

const DIET_OPTIONS = [
    { id: 'omnivore', label: 'Omnivore', desc: 'Balanced intake', icon: <Apple size={18} /> },
    { id: 'vegetarian', label: 'Vegetarian', desc: 'Plant-based + dairy', icon: <LeafIcon size={18} /> },
    { id: 'vegan', label: 'Vegan', desc: 'Strictly plants', icon: <Sparkles size={18} /> },
    { id: 'keto', label: 'Keto', desc: 'High fat, low carb', icon: <Flame size={18} /> },
    { id: 'paleo', label: 'Paleo', desc: 'Whole food focus', icon: <Dumbbell size={18} /> }
];

const GOAL_OPTIONS = [
    { id: 'weight_loss', label: 'Weight Loss', icon: <TrendingUp size={18} className="rotate-180" /> },
    { id: 'muscle_gain', label: 'Muscle Gain', icon: <Dumbbell size={18} /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Scale size={18} /> },
    { id: 'performance', label: 'Performance', icon: <Zap size={18} /> }
];

function LeafIcon({ size }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Z" />
            <path d="M11 20v-5a4 4 0 0 1 4-4h5" />
        </svg>
    );
}

export default function AIFitnessAssessment() {
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [form, setForm] = useState({
        gender: user?.gender || 'male',
        age: user?.profile?.age || '',
        weight: user?.profile?.weight || '',
        height: user?.profile?.height || '',
        bodyFat: user?.profile?.bodyFat || '',
        dietType: 'omnivore',
        mealsPerDay: 3,
        goals: [],
        activityLevel: 'moderate',
        fitnessLevel: user?.fitnessLevel || 'beginner',
    });

    const bmi = form.weight && form.height
        ? (form.weight / ((form.height / 100) ** 2)).toFixed(1)
        : null;

    const toggleGoal = (goal) => {
        setForm(prev => ({
            ...prev,
            goals: prev.goals.includes(goal)
                ? prev.goals.filter(g => g !== goal)
                : [...prev.goals, goal]
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await api.post('/ai/fitness-assessment', form);
            const assessment = res.data.assessment;
            const calories = assessment.calorieTarget || 2000;
            const protein = assessment.proteinTarget || 150;
            const fatGrams = Math.round((calories * 0.25) / 9);
            const proteinCals = protein * 4;
            const fatCals = fatGrams * 9;
            const carbGrams = Math.round((calories - proteinCals - fatCals) / 4);

            setResult({
                ...assessment,
                macros: { protein, carbs: carbGrams, fats: fatGrams }
            });
            setStep(3);
            toast.success('Protocol Generated');
        } catch (err) {
            toast.error('Assessment engine failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 pt-32 pb-16 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                {/* HEADER - Tighter */}
                <header className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <Logo iconSize={24} />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">AI Intelligence v3</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                        Nutrition <span className="text-gym-orange">Protocol</span>
                    </h1>
                    <p className="text-sm text-slate-500 max-w-lg mx-auto font-medium">
                        Enterprise-grade physiological assessment for metabolic optimization.
                    </p>
                </header>

                {/* PROGRESS - Standard Geometry */}
                <div className="max-w-xl mx-auto mb-12">
                    <div className="flex justify-between relative">
                        <div className="absolute top-4 left-0 w-full h-[1px] bg-slate-100 z-0" />
                        <div
                            className="absolute top-4 left-0 h-[1px] bg-gym-orange transition-all duration-500 z-0"
                            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
                        />
                        {STEPS.map((s, i) => (
                            <div key={s.id} className="relative z-10 flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${i <= step ? 'bg-white border border-gym-orange text-gym-orange shadow-sm scale-110' : 'bg-slate-50 border border-slate-200 text-slate-300'
                                    }`}>
                                    {i < step ? <CheckCircle2 size={14} /> : s.icon}
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-widest mt-2 ${i <= step ? 'text-slate-900' : 'text-slate-300'}`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CONTENT CARD - Reduced Radius, Tighter Spacing */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-10 min-h-[500px] relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {step === 0 && (
                                <div className="space-y-10">
                                    <div className="border-b border-slate-50 pb-4">
                                        <h2 className="text-xl font-bold text-slate-900">Physiological Profile</h2>
                                        <p className="text-xs text-slate-400 mt-1">Foundational biometrics for BMR calculation.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Biological Gender</label>
                                            <div className="flex p-1 bg-slate-50 rounded-lg border border-slate-100">
                                                {['male', 'female'].map(g => (
                                                    <button key={g} onClick={() => setForm(p => ({ ...p, gender: g }))}
                                                        className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${form.gender === g ? 'bg-white text-gym-orange shadow-sm border border-slate-200' : 'text-slate-400'
                                                            }`}>
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Experience</label>
                                            <div className="flex p-1 bg-slate-50 rounded-lg border border-slate-100">
                                                {['beginner', 'advanced'].map(l => (
                                                    <button key={l} onClick={() => setForm(p => ({ ...p, fitnessLevel: l }))}
                                                        className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${form.fitnessLevel === l ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400'
                                                            }`}>
                                                        {l}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Age</label>
                                                <input type="number" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-gym-orange outline-none" placeholder="25" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Height (cm)</label>
                                                <input type="number" value={form.height} onChange={e => setForm(p => ({ ...p, height: e.target.value }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-gym-orange outline-none" placeholder="180" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Weight (kg)</label>
                                                <input type="number" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-gym-orange outline-none" placeholder="75" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Body Fat %</label>
                                                <input type="number" value={form.bodyFat} onChange={e => setForm(p => ({ ...p, bodyFat: e.target.value }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-gym-orange outline-none" placeholder="15" />
                                            </div>
                                        </div>
                                    </div>

                                    {bmi && (
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-gym-orange shadow-sm">
                                                    <Activity size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Body Mass Index</p>
                                                    <h4 className="text-lg font-black text-slate-900">{bmi} <span className="text-[10px] font-bold text-slate-400 ml-2 uppercase">
                                                        {bmi < 25 ? 'Healthy' : 'Metabolic Adjust.'}
                                                    </span></h4>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-10">
                                    <div className="border-b border-slate-50 pb-4">
                                        <h2 className="text-xl font-bold text-slate-900">Dietary Habits</h2>
                                        <p className="text-xs text-slate-400 mt-1">Select your primary nutritional structure.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {DIET_OPTIONS.map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setForm(p => ({ ...p, dietType: opt.id }))}
                                                className={`p-4 rounded-xl border-2 text-left transition-all ${form.dietType === opt.id ? 'bg-white border-gym-orange shadow-sm' : 'bg-slate-50 border-transparent hover:border-slate-200'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-4 ${form.dietType === opt.id ? 'bg-gym-orange text-white' : 'bg-white text-slate-400'
                                                    }`}>
                                                    {opt.icon}
                                                </div>
                                                <h3 className="text-xs font-bold text-slate-900 mb-1">{opt.label}</h3>
                                                <p className="text-[10px] text-slate-400 font-medium">{opt.desc}</p>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-bold text-slate-900">Meal Frequency</h3>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Per 24h Cycle</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {[2, 3, 4, 5, 6].map(num => (
                                                <button key={num} onClick={() => setForm(p => ({ ...p, mealsPerDay: num }))}
                                                    className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${form.mealsPerDay === num ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-400 border border-slate-200'
                                                        }`}>
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-10">
                                    <div className="border-b border-slate-50 pb-4">
                                        <h2 className="text-xl font-bold text-slate-900">Objectives & Activity</h2>
                                        <p className="text-xs text-slate-400 mt-1">Define goals and physical exertion level.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Primary Objective</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {GOAL_OPTIONS.map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => toggleGoal(opt.label)}
                                                    className={`p-6 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${form.goals.includes(opt.label) ? 'bg-white border-gym-orange shadow-sm' : 'bg-slate-50 border-transparent'
                                                        }`}
                                                >
                                                    <div className={form.goals.includes(opt.label) ? 'text-gym-orange' : 'text-slate-300'}>{opt.icon}</div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${form.goals.includes(opt.label) ? 'text-slate-900' : 'text-slate-400'}`}>
                                                        {opt.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Activity Multiplier</label>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                            {['sedentary', 'light', 'moderate', 'active', 'elite'].map(lvl => (
                                                <button key={lvl} onClick={() => setForm(p => ({ ...p, activityLevel: lvl }))}
                                                    className={`p-3 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${form.activityLevel === lvl ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-slate-50 border-transparent text-slate-400'
                                                        }`}>
                                                    {lvl}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && result && (
                                <div className="space-y-12">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Protocol <span className="text-gym-orange italic">Output</span></h2>
                                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mt-1">Engine Analysis Complete</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-sm">
                                                <ClipboardList size={16} />
                                            </button>
                                            <button className="p-2.5 bg-white text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
                                                <Info size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-8 rounded-2xl bg-slate-900 text-white">
                                            <div className="text-[9px] font-black text-gym-orange uppercase tracking-widest mb-4">Daily Calories</div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black">{result.calorieTarget}</span>
                                                <span className="text-xs opacity-40 font-bold uppercase tracking-widest">kcal</span>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 p-8 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                                            {[
                                                { l: 'Protein', v: result.macros.protein, c: 'text-gym-orange' },
                                                { l: 'Carbs', v: result.macros.carbs, c: 'text-emerald-500' },
                                                { l: 'Fats', v: result.macros.fats, c: 'text-slate-900' }
                                            ].map(m => (
                                                <div key={m.l} className="text-center">
                                                    <div className={`text-xl font-black ${m.c} mb-1`}>{m.v}g</div>
                                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m.l}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-2 border-gym-orange pl-3">4-Week Timeline</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {result.weeklySchedule?.slice(0, 6).map((day, i) => (
                                                <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between group hover:bg-white hover:border-slate-200 transition-all">
                                                    <div>
                                                        <div className="text-[10px] font-bold text-gym-orange uppercase mb-1">{day.day}</div>
                                                        <div className="text-xs font-black text-slate-900 uppercase tracking-tight">{day.focus}</div>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded border border-slate-100">{day.duration}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Sparkles size={14} className="text-emerald-600" />
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Key Insights</span>
                                        </div>
                                        <div className="space-y-3">
                                            {result.keyRecommendations?.slice(0, 3).map((rec, i) => (
                                                <div key={i} className="flex gap-2 text-[11px] font-medium text-slate-600 leading-relaxed italic">
                                                    <span className="text-emerald-400 mt-0.5">•</span> {rec}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* NAVIGATION */}
                    {step < 3 && (
                        <div className="flex gap-3 mt-10 pt-8 border-t border-slate-50">
                            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
                                className={`flex-1 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${step === 0 ? 'bg-slate-50 text-slate-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                    }`}>
                                <ChevronLeft size={14} /> Back
                            </button>
                            {step < 2 ? (
                                <button onClick={() => setStep(s => s + 1)}
                                    className="flex-[2] bg-slate-900 text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-sm">
                                    Next Phase <ChevronRight size={14} />
                                </button>
                            ) : (
                                <button onClick={handleSubmit} disabled={loading}
                                    className="flex-[2] bg-gym-orange text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#e65500] transition-all shadow-sm disabled:opacity-50">
                                    {loading ? 'Initializing Analysis...' : <><Sparkles size={14} /> Generate Protocol</>}
                                </button>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="mt-8 flex justify-center border-t border-slate-50 pt-8">
                            <button onClick={() => { setStep(0); setResult(null); }}
                                className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all">
                                <Zap size={14} /> Reset Assessment
                            </button>
                        </div>
                    )}
                </div>

                <footer className="mt-12 text-center">
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.5em]">CoreX Intelligence Engine</p>
                </footer>
            </div>
        </div>
    );
}
