import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Load cart from local storage on initial render
    useEffect(() => {
        const storedCart = localStorage.getItem('gym-cart');
        if (storedCart) {
            try {
                setCart(JSON.parse(storedCart));
            } catch (e) {
                console.error("Failed to parse cart data");
            }
        }
    }, []);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('gym-cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        let isUpdate = false;
        
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item._id === (product._id || product.id));
            if (existingItem) {
                isUpdate = true;
                return prevCart.map((item) =>
                    item._id === (product._id || product.id) ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                isUpdate = false;
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });

        // Fire toast OUTSIDE of state setter
        if (isUpdate) {
            toast.success(`Updated quantity for ${product.name}`);
        } else {
            toast.success(`Added ${product.name} to cart`);
        }
    };

    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => (item._id || item.id) !== productId));
        toast.error('Item removed from cart');
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) return;
        setCart((prevCart) =>
            prevCart.map((item) =>
                (item._id || item.id) === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('gym-cart');
    };

    const totalPrice = cart.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems }}>
            {children}
        </CartContext.Provider>
    );
};
