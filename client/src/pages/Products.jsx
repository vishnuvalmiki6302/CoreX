import { useState, useEffect } from 'react';
import { ShoppingCart, Package, Filter, ChevronDown, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const categories = ["All", "Supplements", "Gear", "Apparel", "Equipment"];
const priceRanges = ["All", "Under ₹1000", "₹1000 - ₹2000", "Above ₹2000"];
const brands = ["CoreX Pro", "Titan", "Optimum", "Nike", "Under Armour"];

const Products = () => {
    const { addToCart } = useCart();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedPrice, setSelectedPrice] = useState("All");
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

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        setAddedId(product._id);
        setTimeout(() => setAddedId(null), 1500);
    };

    // Advanced filtering logic
    const filteredProducts = products.filter(p => {
        if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
        
        if (selectedPrice === "Under ₹1000" && p.price >= 1000) return false;
        if (selectedPrice === "₹1000 - ₹2000" && (p.price < 1000 || p.price > 2000)) return false;
        if (selectedPrice === "Above ₹2000" && p.price <= 2000) return false;

        return true;
    });

    return (
        <div className="min-h-screen bg-gym-dark pt-24 pb-12">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
                
                {/* ── HEADER & BREADCRUMBS ── */}
                <div className="mb-6 border-b border-white/10 pb-4">
                    <div className="text-xs text-zinc-500 mb-3 font-semibold tracking-wider uppercase">
                        Home / Store / <span className="text-white">{selectedCategory}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-baseline gap-3">
                            <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Premium Store</h1>
                            <span className="text-zinc-500 text-sm font-medium">- {filteredProducts.length} items</span>
                        </div>
                        
                        {/* Sort Dropdown Placeholder */}
                        <div className="flex items-center gap-2 group cursor-pointer border border-white/10 px-4 py-2 rounded-sm hover:border-white/30 transition-colors">
                            <span className="text-xs font-semibold text-zinc-400 uppercase">Sort By:</span>
                            <span className="text-xs font-bold text-white uppercase">Recommended</span>
                            <ChevronDown size={14} className="text-zinc-400 group-hover:text-white" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* ── LEFT SIDEBAR FILTERS (Myntra Style) ── */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="sticky top-24 pr-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Filters</h2>
                                <Filter size={16} className="text-zinc-500" />
                            </div>
                            
                            {/* Categories */}
                            <div className="border-t border-white/10 py-5">
                                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Categories</h3>
                                <div className="space-y-3">
                                    {categories.map(cat => (
                                        <div key={cat} onClick={() => setSelectedCategory(cat)} className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${selectedCategory === cat ? 'bg-orange-500 border-orange-500' : 'border-zinc-600 group-hover:border-zinc-400'}`}>
                                                {selectedCategory === cat && <div className="w-2 h-2 bg-white rounded-sm" />}
                                            </div>
                                            <span className={`text-sm ${selectedCategory === cat ? 'text-white font-semibold' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                                                {cat}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="border-t border-white/10 py-5">
                                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Price Range</h3>
                                <div className="space-y-3">
                                    {priceRanges.map(price => (
                                        <div key={price} onClick={() => setSelectedPrice(price)} className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${selectedPrice === price ? 'border-orange-500' : 'border-zinc-600 group-hover:border-zinc-400'}`}>
                                                {selectedPrice === price && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                                            </div>
                                            <span className={`text-sm ${selectedPrice === price ? 'text-white font-semibold' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                                                {price}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Dummy Brands */}
                            <div className="border-t border-white/10 py-5 opacity-50">
                                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Brands</h3>
                                <div className="space-y-3">
                                    {brands.map(brand => (
                                        <label key={brand} className="flex items-center gap-3 cursor-not-allowed">
                                            <div className="w-4 h-4 rounded-sm border border-zinc-700 bg-zinc-800" />
                                            <span className="text-sm text-zinc-500">{brand}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* ── RIGHT PRODUCT GRID ── */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="spinner" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                                {filteredProducts.map((product) => {
                                    // Generate dummy original price for Myntra effect
                                    const originalPrice = (product.price * 1.3).toFixed(2);
                                    const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

                                    return (
                                        <div key={product._id} className="group relative flex flex-col cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] bg-[#18181b] border border-transparent hover:border-white/10 rounded-sm overflow-hidden">
                                            
                                            {/* Image Box */}
                                            <div className="relative aspect-[3/4] bg-zinc-900 overflow-hidden">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; }}
                                                />
                                                
                                                {/* Wishlist Icon */}
                                                <button className="absolute top-2 right-2 p-1.5 bg-white/10 backdrop-blur-md hover:bg-white hover:text-black rounded-full text-white transition-colors opacity-0 group-hover:opacity-100">
                                                    <Heart size={14} />
                                                </button>

                                                {/* ADD TO CART OVERLAY BUTTON */}
                                                <div className="absolute bottom-0 left-0 w-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10">
                                                    <button
                                                        onClick={(e) => handleAddToCart(e, product)}
                                                        className={`w-full py-2.5 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest ${
                                                            addedId === product._id
                                                                ? 'bg-green-500 text-white'
                                                                : 'bg-white text-black hover:bg-zinc-200'
                                                        }`}
                                                    >
                                                        {addedId === product._id ? (
                                                            <><Package size={14} /> Added</>
                                                        ) : (
                                                            <><ShoppingCart size={14} /> Add to Bag</>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Product Info */}
                                            <div className="p-3.5 flex flex-col bg-[#18181b] relative z-20 group-hover:bg-[#18181b]">
                                                <h3 className="text-white font-bold text-[15px] truncate mb-0.5">
                                                    CoreX Elite
                                                </h3>
                                                <p className="text-zinc-400 text-xs font-medium truncate mb-2">
                                                    {product.name}
                                                </p>
                                                
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-white font-bold text-sm">₹{product.price}</span>
                                                    <span className="text-zinc-500 text-xs line-through">₹{originalPrice}</span>
                                                    <span className="text-orange-500 font-bold text-[10px] uppercase">({discountPercent}% OFF)</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {filteredProducts.length === 0 && (
                                    <div className="col-span-full py-20 flex flex-col items-center justify-center border border-white/5 rounded-sm border-dashed">
                                        <Package size={48} className="text-zinc-700 mb-4" />
                                        <p className="text-zinc-400 font-medium">No products match your filters.</p>
                                        <button onClick={() => { setSelectedCategory("All"); setSelectedPrice("All"); }} className="mt-4 text-orange-500 text-sm font-bold hover:underline">
                                            Clear Filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
