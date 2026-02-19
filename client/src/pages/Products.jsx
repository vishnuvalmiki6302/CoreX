import { motion } from 'framer-motion';
import { ShoppingCart, Star, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const categories = ["All", "Supplements", "Gear", "Apparel", "Equipment"];

const Products = () => {
    const { addToCart } = useCart();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = selectedCategory === "All"
        ? products
        : products.filter(p => p.category === selectedCategory);

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-4 ">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">
                        Gym<span className="text-gym-accent">Store</span>
                    </h1>
                    <p className="text-gym-text-secondary max-w-2xl mx-auto">
                        Premium gear, supplements, and apparel to fuel your performance.
                    </p>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap justify-center gap-4 mb-12"
                >
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-2 rounded-full border text-sm font-bold transition-all duration-300 ${selectedCategory === category
                                ? 'bg-gym-accent border-gym-accent text-white shadow-lg shadow-gym-accent/25'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </motion.div>

                {/* Loading State */}
                {loading ? (
                    <div className="text-center text-white py-20">Loading products...</div>
                ) : (
                    /* Product Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 p-20">
                        {filteredProducts.map((product) => (
                            <motion.div
                                key={product._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden group hover:border-gym-accent/30 transition-colors"
                            >
                                <div className="relative aspect-square overflow-hidden bg-white/5">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    {/* Badge support if added to model, or generic */}
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-gym-accent hover:text-white shadow-lg"
                                    >
                                        <ShoppingCart size={20} />
                                    </button>
                                </div>

                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-xs text-gym-accent font-bold uppercase tracking-wider">{product.category}</p>
                                        {/* Rating placeholder since it might not be in model yet or generic */}
                                        <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
                                            <Star size={12} fill="currentColor" />
                                            {product.rating || '4.5'}
                                        </div>
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-2 leading-tight group-hover:text-gym-accent transition-colors">{product.name}</h3>
                                    <div className="text-xl font-black text-white">${product.price}</div>
                                </div>
                            </motion.div>
                        ))}
                        {filteredProducts.length === 0 && (
                            <div className="col-span-full text-center text-gray-500 py-10">
                                No products found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
