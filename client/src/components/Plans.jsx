import { useState, useEffect } from 'react';
import { Check, Zap } from 'lucide-react';
import { getPlans } from '../api/content';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PaymentModal from './PaymentModal';
import { motion } from 'framer-motion';

const Plans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isYearly, setIsYearly] = useState(false);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await getPlans();
                if (Array.isArray(data)) {
                    const highlighted = data.filter(p => p.highlight);
                    const normal = data.filter(p => !p.highlight);
                    if (highlighted.length > 0 && normal.length >= 2) {
                        setPlans([normal[0], highlighted[0], normal[1], ...normal.slice(2)]);
                    } else {
                        setPlans(data);
                    }
                } else { setPlans([]); }
            } catch { toast.error('Failed to load plans'); }
            finally { setLoading(false); }
        };
        fetchPlans();
    }, []);

    const handleSelectPlan = (plan) => {
        if (!user) { toast.error("Please login to purchase a plan"); navigate('/login'); return; }
        setSelectedPlan({
            ...plan,
            name: `${plan.name} (${isYearly ? 'Yearly' : 'Monthly'})`,
            price: isYearly ? plan.price * 10 : plan.price,
            durationMonths: isYearly ? 12 : plan.durationMonths || 1
        });
    };

    return (
        <section className="py-24 bg-gray-50" id="plans">
            {selectedPlan && (
                <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} onSuccess={() => refreshUser()} />
            )}

            <div className="container mx-auto px-6 max-w-6xl">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border" style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
                        <Zap size={12} className="text-orange-500" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-orange-600">Membership Plans</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-5 tracking-tight">
                        Choose Your <span className="orange-text-gradient">Level</span>
                    </h2>
                    <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
                        Upgrade or downgrade anytime. All plans include AI fitness tools.
                    </p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-sm font-bold ${!isYearly ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
                        <button onClick={() => setIsYearly(!isYearly)} className={`toggle-track ${isYearly ? 'active' : ''}`}>
                            <span className="toggle-thumb" />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${isYearly ? 'text-gray-900' : 'text-gray-400'}`}>Yearly</span>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-200">Save 20%</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center h-48 items-center">
                        <div className="w-10 h-10 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-end pt-8">
                        {plans.map((plan, idx) => {
                            const monthlyOriginal = Math.round(plan.price * 1.25);
                            const yearlyOriginal = monthlyOriginal * 12;
                            const displayPrice = isYearly ? plan.price * 9 : plan.price;
                            const displayOriginal = isYearly ? yearlyOriginal : monthlyOriginal;
                            const displayPeriod = isYearly ? '/yr' : '/mo';
                            const percentSaved = Math.round(((displayOriginal - displayPrice) / displayOriginal) * 100);

                            return (
                                <motion.div
                                    key={plan._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`relative flex flex-col rounded-2xl p-8 ${plan.highlight ? 'md:-translate-y-5' : ''}`}
                                    style={{
                                        background: plan.highlight ? 'linear-gradient(160deg, #1f2937 0%, #111827 100%)' : '#ffffff',
                                        border: plan.highlight ? '1px solid rgba(249,115,22,0.3)' : '1px solid #e5e7eb',
                                        boxShadow: plan.highlight
                                            ? '0 24px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(249,115,22,0.15)'
                                            : '0 1px 4px rgba(0,0,0,0.04)'
                                    }}
                                >
                                    {plan.highlight && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-[10px] font-black px-5 py-1.5 rounded-full uppercase tracking-widest shadow-lg btn-primary">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <h3 className={`text-lg font-black uppercase tracking-wider mb-3 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-sm line-through font-medium ${plan.highlight ? 'text-gray-500' : 'text-gray-400'}`}>₹{displayOriginal}</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">Save {percentSaved}%</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>₹{displayPrice}</span>
                                            <span className={`text-sm font-semibold ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>{displayPeriod}</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-3.5 mb-8 flex-grow">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className={`flex items-start gap-3 text-sm font-medium ${plan.highlight ? 'text-gray-300' : 'text-gray-600'}`}>
                                                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                                                    style={{
                                                        background: plan.highlight ? 'rgba(249,115,22,0.2)' : '#fff7ed',
                                                        border: plan.highlight ? '1px solid rgba(249,115,22,0.35)' : '1px solid #fed7aa'
                                                    }}>
                                                    <Check size={11} strokeWidth={3} className="text-orange-500" />
                                                </div>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handleSelectPlan(plan)}
                                        className={`w-full py-4 text-[11px] rounded-xl font-black uppercase tracking-widest transition-all mt-auto`}
                                        style={plan.highlight ? {
                                            background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                            color: 'white',
                                            boxShadow: '0 4px 20px rgba(249,115,22,0.4)',
                                        } : {
                                            background: '#f9fafb',
                                            color: '#374151',
                                            border: '1.5px solid #e5e7eb',
                                        }}
                                        onMouseEnter={e => { if (!plan.highlight) { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.color = '#f97316'; }}}
                                        onMouseLeave={e => { if (!plan.highlight) { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}}
                                    >
                                        Select Plan
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Plans;
