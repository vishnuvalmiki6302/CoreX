import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CreditCard, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const PaymentModal = ({ plan, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('summary'); // summary, processing, success

    const handlePayment = async () => {
        setLoading(true);
        setStep('processing');

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Call API to record payment
            await api.post('/payments', {
                userId: user._id,
                planId: plan._id,
                amount: plan.price,
                method: 'mock_card',
                status: 'completed',
                notes: 'Mock payment for demonstration'
            });

            setStep('success');
            toast.success(`Successfully subscribed to ${plan.name}!`);

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);

        } catch (error) {
            console.error("Payment failed", error);
            toast.error(error.response?.data?.message || "Payment failed. Please try again.");
            setStep('summary');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-zinc-900 border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                        disabled={loading}
                    >
                        <X size={20} className="text-gray-400" />
                    </button>

                    {step === 'summary' && (
                        <>
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-black text-white mb-2 uppercase italic">Confirm Subscription</h3>
                                <p className="text-gray-400 text-sm">You are upgrading to the <span className="text-gym-accent font-bold">{plan.name}</span> plan.</p>
                            </div>

                            <div className="bg-black/40 rounded-xl p-4 mb-6 border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400">Plan Price</span>
                                    <span className="text-white font-bold">${plan.price}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400">Duration</span>
                                    <span className="text-white font-bold">{plan.durationMonths} Month{plan.durationMonths > 1 ? 's' : ''}</span>
                                </div>
                                <div className="h-px bg-white/10 my-3"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-bold text-lg">Total</span>
                                    <span className="text-gym-accent font-black text-2xl">${plan.price}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3 p-3 rounded-lg border border-gym-accent/30 bg-gym-accent/5">
                                    <CreditCard className="text-gym-accent" size={20} />
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-bold">Mock Credit Card</p>
                                        <p className="text-xs text-gray-500">**** **** **** 4242</p>
                                    </div>
                                    <Check className="text-gym-accent" size={16} />
                                </div>
                                <p className="text-[10px] text-center text-gray-500 mt-2">
                                    <ShieldCheck size={12} className="inline mr-1" />
                                    This is a secure mock payment for demonstration purposes. No real money will be charged.
                                </p>
                            </div>

                            <button
                                onClick={handlePayment}
                                className="w-full mt-6 bg-gym-accent hover:bg-gym-accent/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-gym-accent/25 uppercase tracking-wide"
                            >
                                Confirm & Pay
                            </button>
                        </>
                    )}

                    {step === 'processing' && (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 border-4 border-gym-accent/30 border-t-gym-accent rounded-full animate-spin mb-6"></div>
                            <h3 className="text-xl font-bold text-white mb-2">Processing Payment...</h3>
                            <p className="text-gray-400 text-sm">Please do not close this window.</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="py-8 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                <Check size={40} className="text-green-500" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 uppercase italic">Payment Successful!</h3>
                            <p className="text-gray-400 text-sm mb-6">Welcome to the {plan.name} team.</p>
                        </div>
                    )}

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PaymentModal;
