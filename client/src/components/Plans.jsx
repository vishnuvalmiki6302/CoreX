import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { getPlans } from '../api/content';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PaymentModal from './PaymentModal';

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
                    // Sort so the 'highlight' plan is always in the middle (index 1) if there are 3 plans
                    const highlighted = data.filter(p => p.highlight);
                    const normal = data.filter(p => !p.highlight);
                    
                    if (highlighted.length > 0 && normal.length >= 2) {
                        setPlans([normal[0], highlighted[0], normal[1], ...normal.slice(2)]);
                    } else {
                        setPlans(data);
                    }
                } else {
                    setPlans([]);
                }
            } catch {
                toast.error('Failed to load plans');
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleSelectPlan = (plan) => {
        if (!user) {
            toast.error("Please login to purchase a plan");
            navigate('/login');
            return;
        }

        const planToPurchase = {
            ...plan,
            name: `${plan.name} (${isYearly ? 'Yearly' : 'Monthly'})`,
            price: isYearly ? plan.price * 10 : plan.price,
            durationMonths: isYearly ? 12 : plan.durationMonths || 1
        };

        setSelectedPlan(planToPurchase);
    };

    return (
        <section className="py-20 bg-white" id="plans">
            {selectedPlan && (
                <PaymentModal
                    plan={selectedPlan}
                    onClose={() => setSelectedPlan(null)}
                    onSuccess={() => refreshUser()}
                />
            )}
            
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Membership Plans</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
                        Choose the right tier for your fitness journey. Upgrade or downgrade at any time.
                    </p>

                    {/* Monthly / Yearly Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <span className={`text-sm font-bold ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
                        
                        <button 
                            onClick={() => setIsYearly(!isYearly)}
                            className="relative inline-flex h-8 w-16 items-center rounded-full bg-gray-200 transition-colors focus:outline-none hover:bg-gray-300"
                        >
                            <span 
                                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${isYearly ? 'translate-x-9 bg-orange-500' : 'translate-x-1'}`}
                            />
                        </button>
                        
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>Yearly</span>
                            <span className="bg-orange-100 text-orange-600 text-[10px] font-black uppercase px-2 py-1 rounded-full tracking-wider">
                                Save 20%
                            </span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center h-48 items-center">
                        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-end pt-8">
                        {plans.map((plan) => {
                            // Calculate prices for maximum psychological attraction
                            const monthlyOriginal = Math.round(plan.price * 1.25); // Show a 20% fake discount on monthly
                            const yearlyOriginal = monthlyOriginal * 12;
                            
                            const displayPrice = isYearly ? plan.price * 9 : plan.price; // 3 months free for yearly
                            const displayOriginal = isYearly ? yearlyOriginal : monthlyOriginal;
                            const displayPeriod = isYearly ? '/yr' : '/mo';
                            
                            // Calculate actual percentage saved based on the fake original price
                            const percentSaved = Math.round(((displayOriginal - displayPrice) / displayOriginal) * 100);

                            return (
                                <div
                                    key={plan._id}
                                    className={`bg-white rounded-3xl p-8 flex flex-col h-full relative border transition-all duration-300 ${
                                        plan.highlight 
                                            ? 'border-orange-500 shadow-2xl shadow-orange-500/10 md:-translate-y-4 ring-1 ring-orange-500' 
                                            : 'border-gray-200 shadow-xl shadow-gray-200/50 hover:border-gray-300'
                                    }`}
                                >
                                    {plan.highlight && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-400 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-orange-500/30">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                        
                                        {/* Strikethrough Original Price & Discount Badge */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-gray-400 line-through text-sm font-semibold">₹{displayOriginal}</span>
                                            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                                                Save {percentSaved}%
                                            </span>
                                        </div>

                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-gray-900">₹{displayPrice}</span>
                                            <span className="text-sm font-semibold text-gray-500">{displayPeriod}</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-4 mb-8 flex-grow">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                                                <Check size={18} strokeWidth={3} className={plan.highlight ? 'text-orange-500 mt-0.5' : 'text-gray-400 mt-0.5'} />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handleSelectPlan(plan)}
                                        className={`w-full py-4 text-sm rounded-xl transition-all font-bold uppercase tracking-wide mt-auto ${
                                            plan.highlight 
                                                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30' 
                                                : 'bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200'
                                        }`}
                                    >
                                        Select Plan
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Plans;
