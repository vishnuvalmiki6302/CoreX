import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
    Zap, User, Activity, Heart, Target, ChevronRight, 
    ChevronLeft, Sparkles, Dumbbell, Utensils, Calendar,
    CheckCircle2, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

const STEPS = ['Personal Data', 'Biometrics', 'Objectives', 'Intelligence Plan'];

const GOAL_OPTIONS = ['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'General Fitness', 'Strength'];
const CONDITION_OPTIONS = ['None', 'Diabetes', 'Hypertension', 'PCOS', 'Back Pain', 'Knee Issues', 'Asthma'];

export default function AIFitnessAssessment() {
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [form, setForm] = useState({
        gender: user?.gender || '',
        age: user?.profile?.age || '',
        weight: user?.profile?.weight || '',
        height: user?.profile?.height || '',
        bodyFat: user?.profile?.bodyFat || '',
        goals: [],
        medicalConditions: [],
        fitnessLevel: user?.fitnessLevel || 'beginner',
    });

    const bmi = form.weight && form.height
        ? (form.weight / ((form.height / 100) ** 2)).toFixed(1)
        : null;

    const toggleItem = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value],
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await api.post('/ai/fitness-assessment', form);
            setResult(res.data.assessment);
            setStep(3);
            toast.success('AI Intelligence Plan generated!');
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Assessment failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white py-20 px-6 font-sans overflow-hidden relative">
            
            {/* BACKGROUND DECO */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-[150px] -mr-96 -mt-96 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-[150px] -ml-96 -mb-96 pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* HEADER */}
                <header className="text-center mb-16">
                    <div className="flex justify-center mb-6">
                        <Logo iconSize={24} />
                    </div>
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6 animate-bounce">
                        <Sparkles size={14} /> AI Engine Active
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4 leading-none italic">
                        FITNESS <span className="text-orange-500">INTELLIGENCE</span>
                    </h1>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Personalized 4-week protocol powered by CoreX AI</p>
                </header>

                {/* PROGRESS */}
                <div className="flex gap-4 mb-16">
                    {STEPS.map((s, i) => (
                        <div key={s} className="flex-1">
                            <div className={`h-1.5 rounded-full mb-3 transition-all duration-700 ${i <= step ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-gray-100'}`} />
                            <p className={`text-[10px] font-black uppercase tracking-widest text-center transition-colors ${i <= step ? 'text-gray-900' : 'text-gray-300'}`}>{s}</p>
                        </div>
                    ))}
                </div>

                {/* MAIN FORM CARD */}
                <div className="premium-card p-12 relative overflow-hidden bg-white/80 backdrop-blur-xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {step === 0 && (
                                <div className="space-y-10">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                                            <User size={24} />
                                        </div>
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Personnel Identification</h2>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Biological Gender</label>
                                            <div className="flex gap-3">
                                                {['male', 'female', 'other'].map(g => (
                                                    <button key={g} onClick={() => setForm(p => ({ ...p, gender: g }))} 
                                                        className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                            form.gender === g ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
                                                        }`}>
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tactical Experience</label>
                                            <div className="flex gap-3">
                                                {['beginner', 'intermediate', 'advanced'].map(l => (
                                                    <button key={l} onClick={() => setForm(p => ({ ...p, fitnessLevel: l }))}
                                                        className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                            form.fitnessLevel === l ? 'bg-gray-900 border-gray-900 text-white shadow-lg shadow-gray-900/20' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
                                                        }`}>
                                                        {l}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Personnel Age</label>
                                            <input type="number" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} 
                                                className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all" placeholder="Enter age..." />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Height Metric (cm)</label>
                                            <input type="number" value={form.height} onChange={e => setForm(p => ({ ...p, height: e.target.value }))}
                                                className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all" placeholder="e.g. 180" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-10">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                                            <Activity size={24} />
                                        </div>
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Biometric Analysis</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Body Mass (kg)</label>
                                            <input type="number" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))}
                                                className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all" placeholder="Current weight" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Adipose Percentage (%)</label>
                                            <input type="number" value={form.bodyFat} onChange={e => setForm(p => ({ ...p, bodyFat: e.target.value }))}
                                                className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all" placeholder="Body fat (optional)" />
                                        </div>
                                    </div>
                                    {bmi && (
                                        <div className="bg-orange-50 border border-orange-100 rounded-[24px] p-8 flex items-center gap-8 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full group-hover:scale-125 transition-transform" />
                                            <div className="text-center">
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Body Mass Index</div>
                                                <div className="text-5xl font-black text-orange-500 tracking-tighter leading-none">{bmi}</div>
                                            </div>
                                            <div className="h-12 w-px bg-orange-200" />
                                            <div>
                                                <div className="text-xs font-black text-gray-900 uppercase tracking-widest mb-1 italic">
                                                    {bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Optimized ✅' : bmi < 30 ? 'Overweight' : 'Obese'}
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">System scan suggests {bmi < 25 ? 'healthy equilibrium' : 'caloric recalibration'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-10">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                                            <Target size={24} />
                                        </div>
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Mission Objectives</h2>
                                    </div>
                                    <div className="space-y-10">
                                        <div className="space-y-6">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Primary Directives</label>
                                            <div className="flex flex-wrap gap-3">
                                                {GOAL_OPTIONS.map(g => (
                                                    <button key={g} onClick={() => toggleItem('goals', g)}
                                                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                            form.goals.includes(g) ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                                                        }`}>
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Biological Constraints</label>
                                            <div className="flex flex-wrap gap-3">
                                                {CONDITION_OPTIONS.map(c => (
                                                    <button key={c} onClick={() => toggleItem('medicalConditions', c)}
                                                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                            form.medicalConditions.includes(c) ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                                                        }`}>
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && result && (
                                <div className="space-y-12">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                                                <Heart size={24} />
                                            </div>
                                            <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none uppercase italic">Tactical Output Generated</h2>
                                        </div>
                                        <button className="text-[10px] font-black text-orange-500 uppercase tracking-widest border border-orange-200 px-4 py-2 rounded-xl hover:bg-orange-50 transition-all">Download PDF</button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { label: 'Caloric Threshold', value: result.calorieTarget, unit: 'kcal', icon: <Zap size={18} />, color: 'orange' },
                                            { label: 'Protein Synthesis', value: result.proteinTarget, unit: 'g/day', icon: <Dumbbell size={18} />, color: 'gray' },
                                            { label: 'Operation Cycle', value: result.trainingFrequency, unit: 'days/week', icon: <Calendar size={18} />, color: 'orange' },
                                        ].map(card => (
                                            <div key={card.label} className="bg-gray-50 border border-gray-100 rounded-[28px] p-8 text-center group hover:bg-white hover:shadow-xl hover:border-orange-100 transition-all duration-500">
                                                <div className={`w-12 h-12 ${card.color === 'orange' ? 'bg-orange-50 text-orange-500' : 'bg-white text-gray-400'} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                                                    {card.icon}
                                                </div>
                                                <div className="text-4xl font-black text-gray-900 tracking-tighter mb-1 leading-none">{card.value}</div>
                                                <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{card.label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-8">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                            <Activity size={14} className="text-orange-500" /> Weekly Operational Schedule
                                        </h3>
                                        <div className="space-y-4">
                                            {result.weeklySchedule?.map((day, i) => (
                                                <div key={i} className="flex gap-6 p-6 bg-white border border-gray-50 rounded-3xl hover:border-orange-100 transition-all group">
                                                    <div className="min-w-[100px]">
                                                        <div className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-1">{day.day}</div>
                                                        <div className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{day.duration || '60 mins'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-gray-900 uppercase italic mb-1 group-hover:text-orange-500 transition-colors">{day.focus}</div>
                                                        <div className="text-xs font-bold text-gray-400 leading-relaxed italic">{(day.exercises || []).join(' · ')}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-gray-900 rounded-[32px] p-10 text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                                        <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                            <Info size={14} /> CoreX Strategic Advice
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {result.keyRecommendations?.map((rec, i) => (
                                                <div key={i} className="flex gap-4">
                                                    <CheckCircle2 size={18} className="text-orange-500 shrink-0 mt-0.5" />
                                                    <span className="text-xs font-bold text-gray-300 leading-relaxed italic">{rec}</span>
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
                        <div className="flex gap-4 mt-16 pt-10 border-t border-gray-50">
                            <button
                                onClick={() => setStep(s => Math.max(0, s - 1))}
                                disabled={step === 0}
                                className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${
                                    step === 0 ? 'bg-gray-50 text-gray-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                }`}>
                                <ChevronLeft size={16} /> Back
                            </button>
                            {step < 2 ? (
                                <button
                                    onClick={() => setStep(s => s + 1)}
                                    className="flex-[2] bg-gray-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-xl shadow-gray-900/10">
                                    Continue <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-[2] bg-orange-gradient text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-orange-500/20 disabled:opacity-50">
                                    {loading ? 'Processing Data...' : 'Deploy AI Engine'} <Sparkles size={16} />
                                </button>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="mt-12 flex justify-center">
                            <button onClick={() => { setStep(0); setResult(null); }} 
                                className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-orange-500 transition-colors flex items-center gap-2">
                                <Zap size={14} /> New Strategic Assessment
                            </button>
                        </div>
                    )}
                </div>

                <footer className="mt-20 text-center opacity-30">
                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.5em]">Neural Link Status: Optimized</p>
                </footer>
            </div>
        </div>
    );
}
