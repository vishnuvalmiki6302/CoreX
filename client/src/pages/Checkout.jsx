import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, ShieldCheck, MapPin, Package, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Checkout = () => {
    const { cart, totalPrice, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [orderStatus, setOrderStatus] = useState('idle'); // idle, processing, success
    const [address, setAddress] = useState({
        street: '123 Gym Street',
        city: 'Fitness City',
        state: 'Power State',
        zipCode: '90210',
        country: 'USA'
    });

    const tax = totalPrice * 0.08;
    const finalTotal = totalPrice + tax;

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        setOrderStatus('processing');

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2500));

            const orderData = {
                orderItems: cart.map(item => ({
                    product: item._id,
                    name: item.name,
                    quantity: item.quantity,
                    priceAtPurchase: item.price,
                    image: item.image
                })),
                shippingAddress: {
                    ...address,
                    zip: address.zipCode
                },
                paymentResult: {
                    id: 'MOCK_PAY_ID_' + Math.random().toString(36).substr(2, 9),
                    status: 'completed',
                    update_time: new Date().toISOString()
                },
                totalAmount: finalTotal
            };

            await api.post('/orders', orderData);

            setOrderStatus('success');
            toast.success("Order placed successfully!");
            clearCart();

            setTimeout(() => {
                navigate('/profile');
            }, 3000);

        } catch (error) {
            console.error("Order error", error);
            toast.error(error.response?.data?.message || "Failed to place order");
            setOrderStatus('idle');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0 && orderStatus !== 'success') {
        navigate('/products');
        return null;
    }

    if (orderStatus === 'success') {
        return (
            <div className="min-h-screen bg-gym-dark flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-zinc-900 border border-white/5 p-12 rounded-3xl max-w-lg w-full text-center shadow-2xl"
                >
                    <div className="w-24 h-24 bg-gym-accent/20 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 size={48} className="text-gym-accent" />
                    </div>
                    <h2 className="text-4xl font-black text-white italic uppercase mb-4 tracking-tighter">Order Success!</h2>
                    <p className="text-gray-400 mb-8 text-lg">Your gear is on the way. Redirecting to your profile to view orders...</p>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 3 }}
                            className="h-full bg-gym-accent"
                        />
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gym-dark pt-32 pb-20 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Left Column: Form */}
                    <div className="flex-grow space-y-8">
                        <div>
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">Checkout</h1>
                            <p className="text-gray-400">Complete your order and gear up for greatness.</p>
                        </div>

                        {/* Shipping Address */}
                        <section className="bg-zinc-900 border border-white/5 p-8 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                                <MapPin size={120} />
                            </div>

                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-gym-accent text-black flex items-center justify-center text-sm font-black italic">01</span>
                                Shipping Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Full Name</label>
                                    <input
                                        type="text"
                                        defaultValue={user?.username}
                                        className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-gym-accent transition-colors"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Street Address</label>
                                    <input
                                        type="text"
                                        value={address.street}
                                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-gym-accent transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">City</label>
                                    <input
                                        type="text"
                                        value={address.city}
                                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-gym-accent transition-colors"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-1/2 space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">State</label>
                                        <input
                                            type="text"
                                            value={address.state}
                                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-gym-accent transition-colors"
                                        />
                                    </div>
                                    <div className="w-1/2 space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Zip Code</label>
                                        <input
                                            type="text"
                                            value={address.zipCode}
                                            onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-gym-accent transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Payment Method */}
                        <section className="bg-zinc-900 border border-white/5 p-8 rounded-2xl">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-gym-accent text-black flex items-center justify-center text-sm font-black italic">02</span>
                                Payment Method
                            </h2>

                            <div className="bg-gym-accent/5 border border-gym-accent/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                                <div className="w-full md:w-auto flex-shrink-0">
                                    <div className="w-full md:w-56 aspect-[1.58/1] bg-gradient-to-br from-zinc-800 to-black rounded-xl p-4 flex flex-col justify-between border border-white/10 shadow-xl">
                                        <div className="flex justify-between items-start">
                                            <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                                                <CreditCard size={20} className="text-gym-accent" />
                                            </div>
                                            <span className="text-white/20 font-black italic">GYM PASS</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-mono tracking-widest text-sm mb-1">**** **** **** 4242</p>
                                            <div className="flex justify-between text-[8px] text-gray-500 uppercase font-black">
                                                <span>{user?.username}</span>
                                                <span>12/28</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-grow space-y-2">
                                    <h3 className="text-white font-bold flex items-center gap-2">
                                        Mock Card Payment <ShieldCheck size={16} className="text-gym-accent" />
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        This is a secure mock payment for demonstration. No actual funds will be deducted from your account. All test transactions are recorded for system integrity.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="w-full md:w-[400px] flex-shrink-0">
                        <aside className="bg-zinc-900 border border-white/5 p-8 rounded-3xl sticky top-32 space-y-8">
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Summary</h2>

                            {/* Items Scroll */}
                            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="w-16 h-16 bg-white/5 rounded-xl overflow-hidden border border-white/5 flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div className="flex-grow flex flex-col justify-center">
                                            <h4 className="text-white font-bold text-sm line-clamp-1">{item.name}</h4>
                                            <p className="text-gray-500 text-xs">Qty: {item.quantity} × ${item.price}</p>
                                        </div>
                                        <div className="flex items-center text-white font-black italic text-sm">
                                            ${(item.price * item.quantity).toFixed(0)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <div className="flex justify-between items-center text-gray-400 text-sm">
                                    <span>Subtotal</span>
                                    <span className="text-white font-bold">${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-400 text-sm">
                                    <span>Shipping</span>
                                    <span className="text-gym-accent font-bold italic uppercase">Complimentary</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-400 text-sm">
                                    <span>Tax (8%)</span>
                                    <span className="text-white font-bold">${tax.toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-white/10 my-4" />
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-gray-500 uppercase font-black text-[10px] tracking-widest block mb-1">Estimated Total</span>
                                        <span className="text-white font-black italic text-4xl tracking-tighter">${finalTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="w-full bg-gym-accent hover:bg-gym-accent/90 disabled:bg-zinc-800 disabled:text-gray-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-gym-accent/20 uppercase italic tracking-wider group"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Verifying Transaction
                                    </>
                                ) : (
                                    <>
                                        Place Order
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <p className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-widest">
                                Secure Encrypted Checkout
                            </p>
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
