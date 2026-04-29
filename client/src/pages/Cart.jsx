import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

    if (cart.length === 0) {
        return (
            <div className="page-container flex flex-col items-center justify-center min-h-[70vh] text-center">
                <div className="clean-card p-12 max-w-md w-full">
                    <ShoppingBag size={48} className="mx-auto mb-4 text-zinc-600" />
                    <h2 className="text-xl font-bold text-white mb-2">Your Cart is Empty</h2>
                    <p className="text-zinc-400 text-sm mb-6">You haven't added any gear to your cart yet.</p>
                    <Link to="/products" className="btn-primary">
                        Browse Store
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* hero section */}
            {/* <div className="hero"> */}
            {/* <h1>Shopping Cart</h1>
                <p>Review your selected items before checkout.</p> */}
            {/* </div> */}
            <div className="section-header">
                <h1 className="section-title">Shopping Cart</h1>
                <p className="section-subtitle">Review your selected items before checkout.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Cart Items List */}
                <div className="lg:col-span-8 space-y-3">
                    {cart.map((item) => (
                        <div key={item.id} className="clean-card p-4 flex flex-col sm:flex-row items-center gap-4">
                            <div className="w-20 h-20 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>

                            <div className="flex-grow w-full text-center sm:text-left">
                                <div className="text-xs text-gym-accent font-medium mb-1">{item.category}</div>
                                <h3 className="text-white font-medium text-sm mb-1">{item.name}</h3>
                                <div className="text-sm font-semibold text-white">${item.price}</div>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="flex items-center gap-2 bg-zinc-900 border border-white/5 rounded-lg p-1">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                                        disabled={item.quantity <= 1}
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                                    title="Remove item"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-4">
                    <div className="clean-card p-6 sticky top-24">
                        <h3 className="text-base font-semibold text-white mb-4 border-b border-white/5 pb-4">Order Summary</h3>

                        <div className="space-y-3 mb-6 text-sm">
                            <div className="flex justify-between text-zinc-400">
                                <span>Subtotal ({cart.length} items)</span>
                                <span className="text-white">${totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-zinc-400">
                                <span>Shipping</span>
                                <span className="text-green-500">Free</span>
                            </div>
                            <div className="flex justify-between text-zinc-400">
                                <span>Estimated Tax (8%)</span>
                                <span className="text-white">${(totalPrice * 0.08).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-6 pt-4 border-t border-white/5">
                            <span className="text-sm font-medium text-white">Total</span>
                            <span className="text-xl font-bold text-white">
                                ${(totalPrice * 1.08).toFixed(2)}
                            </span>
                        </div>

                        <Link to="/checkout" className="btn-primary w-full justify-center py-2.5 mb-3">
                            Proceed to Checkout
                        </Link>

                        <button
                            onClick={clearCart}
                            className="w-full text-zinc-500 text-xs hover:text-white transition-colors"
                        >
                            Clear Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
