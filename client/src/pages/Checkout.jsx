import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
    CreditCard, MapPin, Package, CheckCircle2, 
    ChevronDown, Truck, ShieldCheck, ArrowLeft,
    Check, ShoppingBag, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Checkout = () => {
    const { cart, totalPrice, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [orderStatus, setOrderStatus] = useState('idle'); // idle, processing, success
    const [activeSection, setActiveSection] = useState(1); // 1: Login, 2: Address, 3: Summary, 4: Payment
    const [address, setAddress] = useState({
        name: user?.username || '',
        phone: user?.phoneNumber || '',
        pincode: '560001',
        locality: 'Indiranagar',
        street: '12th Main Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        landmark: 'Near Metro Station',
        alternatePhone: ''
    });

    const tax = totalPrice * 0.18; // 18% GST
    const shipping = 0;
    const finalTotal = totalPrice + tax + shipping;

    const handlePlaceOrder = async () => {
        setLoading(true);
        setOrderStatus('processing');

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            const orderData = {
                orderItems: cart.map(item => ({
                    product: item._id || item.id,
                    name: item.name,
                    quantity: item.quantity,
                    priceAtPurchase: item.price,
                    image: item.image
                })),
                shippingAddress: address,
                paymentResult: {
                    id: 'TXN_' + Math.random().toString(36).substr(2, 10).toUpperCase(),
                    status: 'completed',
                    update_time: new Date().toISOString()
                },
                totalAmount: finalTotal
            };

            await api.post('/orders', orderData);

            setOrderStatus('success');
            clearCart();
        } catch (error) {
            console.error("Order error", error);
            toast.error(error.response?.data?.message || "Failed to place order");
            setOrderStatus('idle');
            setActiveSection(4);
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0 && orderStatus !== 'success') {
        useEffect(() => { navigate('/products'); }, []);
        return null;
    }

    if (orderStatus === 'success') {
        return (
            <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-10 md:p-16 max-w-2xl w-full text-center border border-slate-100"
                >
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12 }}
                        >
                            <CheckCircle2 size={56} className="text-emerald-500" />
                        </motion.div>
                    </div>
                    
                    <div className="space-y-4 mb-10">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">Payment Successful</h2>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Order ID: #CORE-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-8 mb-10 text-left border border-slate-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                <Truck size={20} className="text-gym-orange" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Estimate</p>
                                <p className="text-sm font-black text-slate-900">Arriving by Thursday, 14th May</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                <MapPin size={20} className="text-gym-orange" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shipping To</p>
                                <p className="text-sm font-black text-slate-900">{address.name}, {address.city}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={() => navigate('/profile')} className="flex-1 h-14 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all">
                            View Order History
                        </button>
                        <button onClick={() => navigate('/products')} className="flex-1 h-14 bg-white border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">
                            Continue Shopping
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
                
                {/* ── LEFT: CHECKOUT STEPS ── */}
                <div className="flex-grow space-y-4">
                    
                    {/* STEP 1: LOGIN DETAILS */}
                    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all ${activeSection !== 1 ? 'opacity-80' : ''}`}>
                        <div className={`px-6 py-4 flex items-center justify-between ${activeSection === 1 ? 'bg-gym-orange text-white' : 'bg-white'}`}>
                            <div className="flex items-center gap-4">
                                <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${activeSection === 1 ? 'bg-white text-gym-orange' : 'bg-slate-100 text-slate-400'}`}>1</span>
                                <h3 className="text-xs font-black uppercase tracking-widest">Login Credentials</h3>
                                {activeSection > 1 && <Check size={16} className="text-emerald-500 ml-2" />}
                            </div>
                            {activeSection > 1 && (
                                <button onClick={() => setActiveSection(1)} className="text-[10px] font-black uppercase tracking-widest text-gym-orange hover:underline">Change</button>
                            )}
                        </div>
                        {activeSection === 1 && (
                            <div className="p-8 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-black text-slate-900">{user?.username}</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-tight">{user?.email}</p>
                                </div>
                                <button onClick={() => setActiveSection(2)} className="h-12 px-8 bg-gym-orange text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-gym-orange/10">Proceed to Shipping</button>
                            </div>
                        )}
                    </div>

                    {/* STEP 2: DELIVERY ADDRESS */}
                    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all ${activeSection !== 2 ? 'opacity-80' : ''}`}>
                        <div className={`px-6 py-4 flex items-center justify-between ${activeSection === 2 ? 'bg-gym-orange text-white' : 'bg-white'}`}>
                            <div className="flex items-center gap-4">
                                <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${activeSection === 2 ? 'bg-white text-gym-orange' : 'bg-slate-100 text-slate-400'}`}>2</span>
                                <h3 className="text-xs font-black uppercase tracking-widest">Delivery Protocol</h3>
                                {activeSection > 2 && <Check size={16} className="text-emerald-500 ml-2" />}
                            </div>
                            {activeSection > 2 && (
                                <button onClick={() => setActiveSection(2)} className="text-[10px] font-black uppercase tracking-widest text-gym-orange hover:underline">Change</button>
                            )}
                        </div>
                        {activeSection === 2 && (
                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <input className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-gym-orange transition-all" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Contact</label>
                                        <input className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-gym-orange transition-all" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Pincode</label>
                                        <input className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-gym-orange transition-all" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Locality</label>
                                        <input className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-gym-orange transition-all" value={address.locality} onChange={e => setAddress({...address, locality: e.target.value})} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Address (Street / Area)</label>
                                    <textarea className="w-full h-24 p-5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-gym-orange transition-all resize-none" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
                                </div>
                                <button onClick={() => setActiveSection(3)} className="w-full h-14 bg-gym-orange text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-gym-orange/10">Deliver to this location</button>
                            </div>
                        )}
                        {activeSection > 2 && (
                            <div className="p-6 px-16">
                                <p className="text-sm font-black text-slate-900">{address.name} <span className="mx-2 text-slate-300">|</span> {address.phone}</p>
                                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tight">{address.street}, {address.locality}, {address.city}, {address.state} - {address.pincode}</p>
                            </div>
                        )}
                    </div>

                    {/* STEP 3: ORDER SUMMARY */}
                    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all ${activeSection !== 3 ? 'opacity-80' : ''}`}>
                        <div className={`px-6 py-4 flex items-center justify-between ${activeSection === 3 ? 'bg-gym-orange text-white' : 'bg-white'}`}>
                            <div className="flex items-center gap-4">
                                <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${activeSection === 3 ? 'bg-white text-gym-orange' : 'bg-slate-100 text-slate-400'}`}>3</span>
                                <h3 className="text-xs font-black uppercase tracking-widest">Inventory Manifest</h3>
                                {activeSection > 3 && <Check size={16} className="text-emerald-500 ml-2" />}
                            </div>
                            {activeSection > 3 && (
                                <button onClick={() => setActiveSection(3)} className="text-[10px] font-black uppercase tracking-widest text-gym-orange hover:underline">View</button>
                            )}
                        </div>
                        {activeSection === 3 && (
                            <div className="p-8">
                                <div className="space-y-6 mb-10">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex gap-6 pb-6 border-b border-slate-50 last:border-0">
                                            <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-grow py-1">
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">{item.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Quantity: {item.quantity}</p>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-lg font-black text-slate-900 tracking-tight">₹{item.price}</span>
                                                    <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Verified Authentic</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Delivery</p>
                                                <p className="text-xs font-black text-slate-900 italic">2-4 Business Days</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setActiveSection(4)} className="w-full h-14 bg-gym-orange text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-gym-orange/10">Commit to Payment</button>
                            </div>
                        )}
                    </div>

                    {/* STEP 4: PAYMENT OPTIONS */}
                    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all ${activeSection !== 4 ? 'opacity-80' : ''}`}>
                        <div className={`px-6 py-4 flex items-center gap-4 ${activeSection === 4 ? 'bg-gym-orange text-white' : 'bg-white'}`}>
                            <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${activeSection === 4 ? 'bg-white text-gym-orange' : 'bg-slate-100 text-slate-400'}`}>4</span>
                            <h3 className="text-xs font-black uppercase tracking-widest">Financial Gateway</h3>
                        </div>
                        {activeSection === 4 && (
                            <div className="p-8">
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 mb-10 flex flex-col md:flex-row items-center gap-8 group">
                                    <div className="w-full md:w-64 aspect-[1.58/1] bg-slate-900 rounded-2xl p-6 flex flex-col justify-between shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gym-orange/10 rounded-bl-full" />
                                        <div className="flex justify-between items-start">
                                            <CreditCard size={24} className="text-gym-orange" />
                                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] italic">GYM PASS</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-mono tracking-[0.2em] text-sm mb-1">**** **** **** 4242</p>
                                            <div className="flex justify-between text-[8px] text-white/30 uppercase font-black tracking-widest">
                                                <span>{user?.username}</span>
                                                <span>12/28</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-grow space-y-4">
                                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                            Mock Transaction Protocol <ShieldCheck size={16} className="text-gym-orange" />
                                        </h3>
                                        <p className="text-[11px] text-slate-400 font-bold leading-relaxed italic">
                                            This is a secure simulation. No actual capital will be debited from your accounts. All transactions are logged for internal auditing.
                                        </p>
                                        <div className="pt-2">
                                            <button 
                                                onClick={handlePlaceOrder}
                                                disabled={loading}
                                                className="h-14 w-full bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 hover:bg-slate-800 transition-all disabled:opacity-50"
                                            >
                                                {loading ? 'Processing Protocol...' : 'Finalize Transaction'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── RIGHT: PRICE SUMMARY ── */}
                <div className="w-full lg:w-[400px] shrink-0">
                    <aside className="bg-white rounded-xl border border-slate-200 shadow-sm sticky top-32 overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Price Breakdown</h3>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                                    <span>Price ({cart.length} items)</span>
                                    <span>₹{totalPrice}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-emerald-500">
                                    <span>Discount Applied</span>
                                    <span>- ₹{(totalPrice * 0.1).toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                                    <span>Logistics Protocol</span>
                                    <span className="text-emerald-500 uppercase">Complimentary</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                                    <span>GST (18%)</span>
                                    <span>₹{tax.toFixed(0)}</span>
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Commit</p>
                                    <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">₹{(finalTotal - (totalPrice * 0.1)).toFixed(0)}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest text-center">
                                    You will save ₹{(totalPrice * 0.1).toFixed(0)} on this order
                                </p>
                            </div>
                        </div>
                    </aside>

                    <div className="mt-8 flex items-center justify-center gap-8 px-4 opacity-40">
                        <ShieldCheck size={32} className="text-slate-300" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                            Safe and Secure Payments. Easy returns. 100% Authentic products.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Checkout;
