import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Dumbbell } from 'lucide-react';
import { getPlans } from '../api/content';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PaymentModal from './PaymentModal';
import { AnimatePresence } from 'framer-motion';

const Plans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await getPlans();
                if (Array.isArray(data)) {
                    setPlans(data);
                } else {
                    console.error("Invalid plans data received:", data);
                    setPlans([]); // Fallback to empty array to prevent crash
                    toast.error("Failed to load plans: Invalid data format");
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to load plans');
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const getIcon = (type, className) => {
        switch (type) {
            case 'Dumbbell': return <Dumbbell size={32} className={`text-gym-text-secondary ${className}`} />;
            case 'Zap': return <Zap size={32} className={`text-gym-accent ${className}`} />;
            case 'Crown': return <Crown size={32} className={`text-gym-gold ${className}`} />;
            default: return <Dumbbell size={32} className={`text-gym-text-secondary ${className}`} />;
        }
    };

    const handleSelectPlan = (plan) => {
        if (!user) {
            toast.error("Please login to purchase a plan");
            navigate('/login');
            return;
        }
        setSelectedPlan(plan);
    };

    return (
        <section className="py-20 bg-gym-dark relative overflow-hidden" id="plans">
            <AnimatePresence>
                {selectedPlan && (
                    <PaymentModal
                        key="payment-modal"
                        plan={selectedPlan}
                        onClose={() => setSelectedPlan(null)}
                        onSuccess={() => {
                            // Start strict mode force reload of user profile if needed, 
                            // though PaymentModal or Profile page fetch might handle it.
                            // Ideally we could refetch user profile here.
                        }}
                    />
                )}
            </AnimatePresence>
            {selectedPlan && <div className="fixed inset-0 bg-black/50 z-40" />}

            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">
                        Choose Your <span className="text-gym-accent">Path</span>
                    </h2>
                    <p className="text-gym-text-secondary max-w-2xl mx-auto">
                        Whether you're just starting or pushing for the podium, we have a plan that fits your ambition.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center text-gym-accent">Loading Plans...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan, index) => (
                            <motion.div
                                key={plan._id} // Using _id from MongoDB
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={`relative p-8 rounded-2xl border ${plan.highlight ? 'border-gym-accent bg-gym-accent/5' : 'border-white/10 bg-white/5'} backdrop-blur-sm flex flex-col hover:border-gym-accent/50 transition-colors duration-300 group`}
                            >
                                {plan.highlight && (
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gym-accent text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-6 bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    {getIcon(plan.iconType, '')}
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-end gap-1 mb-6">
                                    <span className="text-4xl font-black text-white">{plan.price}</span>
                                    <span className="text-gym-text-secondary mb-1">/month</span>
                                </div>

                                <ul className="space-y-4 mb-8 flex-grow">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-gym-text-secondary text-sm">
                                            <Check size={16} className="text-gym-accent mt-0.5 flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleSelectPlan(plan)}
                                    className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${plan.highlight ? 'bg-gym-accent text-white hover:bg-gym-accent/90 shadow-lg shadow-gym-accent/25' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                >
                                    Select Plan
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Plans;
