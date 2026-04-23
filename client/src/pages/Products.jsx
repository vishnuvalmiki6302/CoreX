import { useState, useEffect } from 'react';
import { ShoppingCart, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const categories = ["All", "Supplements", "Gear", "Apparel", "Equipment"];

const Products = () => {
    const { addToCart } = useCart();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addedId, setAddedId] = useState(null);

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch {
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        setAddedId(product._id);
        setTimeout(() => setAddedId(null), 1500);
    };

    const filteredProducts = selectedCategory === "All"
        ? products
        : products.filter(p => p.category === selectedCategory);

    return (
        <div className="page-container">
            <div className="section-header flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="section-title">Premium Store</h1>
                    <p className="section-subtitle">Gear up with the best equipment and supplements.</p>
                </div>
                
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                selectedCategory === cat
                                    ? 'bg-gym-accent text-white'
                                    : 'bg-zinc-900 text-zinc-400 border border-white/5 hover:bg-zinc-800'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="spinner" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredProducts.map((product) => (
                        <div key={product._id} className="clean-card group flex flex-col overflow-hidden">
                            <div className="relative aspect-square bg-zinc-800">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
                                    onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; }}
                                />
                                {product.featured && (
                                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-gym-gold text-black text-[9px] font-bold uppercase rounded">
                                        Featured
                                    </div>
                                )}
                            </div>

                            <div className="p-3 flex flex-col flex-grow">
                                <div className="text-[10px] text-gym-accent font-medium uppercase mb-1">{product.category}</div>
                                <h3 className="text-white font-medium text-sm line-clamp-2 mb-1 group-hover:text-gym-accent transition-colors">
                                    {product.name}
                                </h3>
                                
                                <div className="mt-auto pt-3 flex items-center justify-between">
                                    <div className="font-semibold text-white">${product.price}</div>
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className={`p-1.5 rounded-md transition-colors ${
                                            addedId === product._id
                                                ? 'bg-green-500 text-white'
                                                : 'bg-white/5 text-zinc-300 hover:bg-gym-accent hover:text-white'
                                        }`}
                                    >
                                        {addedId === product._id ? <Package size={14} /> : <ShoppingCart size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredProducts.length === 0 && (
                        <div className="col-span-full py-16 text-center text-zinc-500 border border-white/5 rounded-xl border-dashed">
                            No products found in this category.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Products;
