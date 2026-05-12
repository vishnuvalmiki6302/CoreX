import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[2.5rem] p-12 max-w-md w-full text-center shadow-xl shadow-slate-200/50 border border-slate-100"
                >
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <ShoppingBag size={32} className="text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Your Bag is Empty</h2>
                    <p className="text-slate-400 font-medium mb-8 leading-relaxed">It seems you haven't added any gear to your inventory yet. Push your limits with our premium equipment.</p>
                    <button 
                        onClick={() => navigate('/products')}
                        className="w-full h-14 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all"
                    >
                        Browse Performance Gear
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none mb-3">Shopping Bag</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="text-gym-orange">●</span> {cart.length} Performance Items Selected
                        </p>
                    </div>
                    <button onClick={clearCart} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-all">Clear Manifest</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Cart Items List */}
                    <div className="lg:col-span-8 space-y-4">
                        <AnimatePresence mode="popLayout">
                            {cart.map((item) => (
                                <motion.div 
                                    layout
                                    key={item._id || item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="w-28 h-28 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>

                                    <div className="flex-grow w-full text-center sm:text-left">
                                        <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                                            <span className="text-[9px] font-black text-gym-orange uppercase tracking-widest px-2 py-0.5 bg-orange-50 rounded border border-orange-100">{item.category}</span>
                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">In Stock</span>
                                        </div>
                                        <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2 leading-tight">{item.name}</h3>
                                        <div className="text-xl font-black text-slate-900 tracking-tighter">₹{item.price}</div>
                                    </div>

                                    <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                                        <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-1.5 border border-slate-100">
                                            <button
                                                onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white transition-all shadow-sm disabled:opacity-30"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="text-slate-900 font-black text-sm w-6 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white transition-all shadow-sm"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item._id || item.id)}
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-3xl p-8 sticky top-24 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Summary Manifest</h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-400">Total Price</span>
                                    <span className="text-sm font-black text-slate-900">₹{totalPrice}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-400">Logistics</span>
                                    <span className="text-sm font-black text-emerald-500 uppercase tracking-widest text-[10px]">Free</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-400">GST (18%)</span>
                                    <span className="text-sm font-black text-slate-900">₹{(totalPrice * 0.18).toFixed(0)}</span>
                                </div>
                            </div>

                            <div className="h-px bg-slate-50 mb-8" />

                            <div className="flex justify-between items-end mb-10">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Commit</p>
                                    <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">₹{(totalPrice * 1.18).toFixed(0)}</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate('/checkout')}
                                className="w-full h-14 bg-gym-orange text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-gym-orange/10 flex items-center justify-center gap-3 hover:bg-[#e65500] transition-all group"
                            >
                                Secure Checkout
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="mt-8 space-y-4">
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <ShieldCheck size={16} className="text-emerald-500" /> 256-bit SSL Encryption
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <Truck size={16} className="text-gym-orange" /> Expedited Shipping Active
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
