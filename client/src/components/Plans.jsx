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

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await getPlans();
                if (Array.isArray(data)) setPlans(data);
                else setPlans([]);
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
        setSelectedPlan(plan);
    };

    return (
        <section className="py-20 bg-gym-dark" id="plans">
            {selectedPlan && (
                <PaymentModal
                    plan={selectedPlan}
                    onClose={() => setSelectedPlan(null)}
                    onSuccess={() => refreshUser()}
                />
            )}
            
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Membership Plans</h2>
                    <p className="text-base text-zinc-400 max-w-xl mx-auto">
                        Choose the right tier for your fitness journey. Upgrade or downgrade at any time.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center h-48 items-center">
                        <div className="spinner" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-end">
                        {plans.map((plan) => (
                            <div
                                key={plan._id}
                                className={`clean-card p-8 flex flex-col h-full relative ${
                                    plan.highlight ? 'border-gym-accent shadow-lg md:-translate-y-4' : ''
                                }`}
                            >
                                {plan.highlight && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gym-accent text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-white">₹{plan.price}</span>
                                        <span className="text-sm text-zinc-500">/mo</span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8 flex-grow">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                                            <Check size={18} className={plan.highlight ? 'text-gym-accent mt-0.5' : 'text-zinc-500 mt-0.5'} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleSelectPlan(plan)}
                                    className={`w-full py-3 text-base rounded transition-colors font-bold mt-auto ${
                                        plan.highlight ? 'btn-primary' : 'btn-outline'
                                    }`}
                                >
                                    Select Plan
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Plans;
