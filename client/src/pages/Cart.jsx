import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 pt-28">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl p-12 max-w-md w-full text-center border border-gray-200 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <ShoppingBag size={32} className="text-gray-300" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Your Bag is Empty</h2>
                    <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed">You haven't added any gear yet. Push your limits with our premium equipment.</p>
                    <button onClick={() => navigate('/products')}
                        className="w-full btn-primary py-4 rounded-xl text-[11px] tracking-[0.2em]">
                        Browse Performance Gear
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase leading-none mb-2">Shopping Bag</h1>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="text-orange-500">●</span>{cart.length} Item{cart.length !== 1 ? 's' : ''} Selected
                        </p>
                    </div>
                    <button onClick={clearCart} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-all">
                        Clear Bag
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Items */}
                    <div className="lg:col-span-8 space-y-4">
                        <AnimatePresence mode="popLayout">
                            {cart.map((item) => (
                                <motion.div layout key={item._id || item.id}
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                    className="bg-white rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 border border-gray-200 shadow-sm hover:border-orange-200 hover:shadow-md transition-all group">
                                    <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>

                                    <div className="flex-grow w-full text-center sm:text-left">
                                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                                            <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest px-2 py-1 bg-orange-50 rounded-lg border border-orange-100">{item.category}</span>
                                            <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">In Stock</span>
                                        </div>
                                        <h3 className="text-base font-black text-gray-900 uppercase tracking-tight mb-1">{item.name}</h3>
                                        <p className="text-xl font-black text-gray-900">₹{item.price}</p>
                                    </div>

                                    <div className="flex flex-row sm:flex-col items-center gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50 w-full sm:w-auto">
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1.5 border border-gray-100">
                                            <button onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white transition-all shadow-sm disabled:opacity-30">
                                                <Minus size={13} />
                                            </button>
                                            <span className="text-gray-900 font-black text-sm w-5 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white transition-all shadow-sm">
                                                <Plus size={13} />
                                            </button>
                                        </div>
                                        <button onClick={() => removeFromCart(item._id || item.id)}
                                            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl p-8 sticky top-24 shadow-sm border border-gray-200">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">Order Summary</h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-500">Subtotal</span>
                                    <span className="text-sm font-black text-gray-900">₹{totalPrice}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-500">Shipping</span>
                                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Free</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-500">GST (18%)</span>
                                    <span className="text-sm font-black text-gray-900">₹{(totalPrice * 0.18).toFixed(0)}</span>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 mb-8" />

                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                                    <p className="text-4xl font-black text-gray-900 tracking-tighter leading-none">₹{(totalPrice * 1.18).toFixed(0)}</p>
                                </div>
                            </div>

                            <button onClick={() => navigate('/checkout')}
                                className="w-full btn-primary py-4 rounded-xl text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 group">
                                Secure Checkout
                                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="mt-7 space-y-3">
                                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <ShieldCheck size={14} className="text-green-500" /> 256-bit SSL Encryption
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <Truck size={14} className="text-orange-500" /> Free Express Shipping
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
