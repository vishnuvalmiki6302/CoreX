import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gym-dark pt-32 pb-12 flex flex-col items-center justify-center text-center px-20 p-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-zinc-900 border border-white/5 p-8 rounded-2xl max-w-md w-full"
                >
                    <h2 className="text-2xl font-bold text-white mb-4">Your Cart is Empty</h2>
                    <p className="text-gray-400 mb-8">Looks like you haven't added any gear properly yet.</p>
                    <Link
                        to="/products"
                        className="inline-block bg-gym-accent text-white font-bold py-3 px-8 rounded-xl hover:bg-gym-accent/90 transition-colors"
                    >
                        Start Shopping
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gym-dark pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-6xl">
                <h1 className="text-3xl md:text-4xl font-black text-white mb-8 uppercase tracking-tighter">
                    Your <span className="text-gym-accent">Cart</span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        <AnimatePresence>
                            {cart.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-zinc-900 border border-white/5 p-4 rounded-xl flex items-center gap-4"
                                >
                                    <div className="w-20 h-20 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>

                                    <div className="flex-grow">
                                        <h3 className="text-white font-bold text-lg">{item.name}</h3>
                                        <p className="text-gym-accent font-medium">${item.price}</p>
                                    </div>

                                    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-1">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="p-1 text-gray-400 hover:text-white transition-colors"
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="text-white font-bold w-4 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="p-1 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl sticky top-24">
                            <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>

                            <div className="space-y-3 mb-6 border-b border-white/10 pb-6">
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="text-white font-medium">${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Shipping</span>
                                    <span className="text-green-500 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Tax (Est.)</span>
                                    <span className="text-white font-medium">${(totalPrice * 0.08).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-8">
                                <span className="text-lg font-bold text-white">Total</span>
                                <span className="text-2xl font-black text-gym-accent">${(totalPrice * 1.08).toFixed(2)}</span>
                            </div>

                            <Link to="/checkout" className="w-full bg-gym-accent text-white font-bold py-4 rounded-xl hover:bg-gym-accent/90 transition-all shadow-lg shadow-gym-accent/25 flex items-center justify-center gap-2 group">
                                Proceed to Checkout
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <button
                                onClick={clearCart}
                                className="w-full mt-4 text-gray-500 text-sm hover:text-white transition-colors"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
