import { useState, useEffect } from 'react';
import { ShoppingCart, Package, Filter, ChevronDown, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import LoadingScreen from '../components/LoadingScreen';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [sortBy, setSortBy] = useState("Recommended");
    const [isSortOpen, setIsSortOpen] = useState(false);

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        const minLoadingTime = 1000;
        const startTime = Date.now();
        setLoading(true);
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch {
            toast.error("Failed to load products");
        } finally {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
            setTimeout(() => setLoading(false), remainingTime);
        }
    };

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        setAddedId(product._id);
        setTimeout(() => setAddedId(null), 1500);
    };

    // Advanced filtering & sorting logic
    const filteredProducts = products
        .filter(p => {
            if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
            
            if (selectedPrice === "Under ₹1000" && p.price >= 1000) return false;
            if (selectedPrice === "₹1000 - ₹2000" && (p.price < 1000 || p.price > 2000)) return false;
            if (selectedPrice === "Above ₹2000" && p.price <= 2000) return false;

            return true;
        })
        .sort((a, b) => {
            if (sortBy === "Price: Low to High") return a.price - b.price;
            if (sortBy === "Price: High to Low") return b.price - a.price;
            if (sortBy === "Newest") return new Date(b.createdAt) - new Date(a.createdAt);
            return 0; // "Recommended" or default
        });

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] pt-28 pb-12 font-sans">
            <div className="max-w-[1500px] mx-auto px-4">
                
                {/* ── TOP PROMOTIONAL BANNER ── */}
                <div className="relative w-full h-[300px] md:h-[350px] mb-8 rounded-xl overflow-hidden shadow-md group">
                    <img src="/images/banner_bg.png" className="absolute inset-0 w-full h-full object-cover" alt="Sale Banner" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                    
                    <div className="relative h-full flex flex-col justify-center px-8 md:px-12 z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-600 rounded-md mb-4 w-fit shadow-lg">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Great Summer Sale | Live Now</span>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-2 leading-tight">
                            Up to 60% off
                        </h1>
                        <p className="text-lg md:text-xl font-medium text-gray-200 mb-8 max-w-lg leading-relaxed">
                            Discover high-performance gear designed to push your limits.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg flex items-center gap-4 shadow-sm border border-white/20 transition-transform hover:translate-y-[-2px] cursor-pointer">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">
                                    %
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Extra Cashback</p>
                                    <p className="text-sm font-bold text-gray-900 uppercase">Up to ₹500 OFF*</p>
                                </div>
                            </div>
                            <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg flex items-center gap-4 shadow-sm border border-white/20 transition-transform hover:translate-y-[-2px] cursor-pointer">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold">
                                    ⚡
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Instant Discount</p>
                                    <p className="text-sm font-bold text-gray-900 uppercase">10% Off on HDFC*</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="min-h-[400px] flex items-center justify-center">
                            <LoadingScreen message="Loading Store..." />
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
                        >
                            {/* ── SECTION 1: TOP PERFORMANCE ── */}
                            <div className="bg-white p-5 shadow-sm rounded-lg flex flex-col h-full border border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">Top Performance Picks</h2>
                                <div className="grid grid-cols-2 gap-3 flex-1">
                                    {products.slice(0, 4).map((p, idx) => {
                                        const images = ["/images/protein.png", "/images/dumbbells.png", "/images/gear.png", "/images/protein.png"];
                                        return (
                                            <div key={p._id} className="group cursor-pointer">
                                                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-1.5 relative border border-gray-100 group-hover:border-orange-200 transition-all">
                                                    <img src={images[idx] || p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                                                </div>
                                                <p className="text-[11px] font-medium text-gray-700 truncate">{p.name}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button className="mt-6 text-xs font-bold text-orange-600 hover:underline text-left">See more elite gear</button>
                            </div>

                            {/* ── SECTION 2: FLASH SALE ── */}
                            <div className="bg-white p-5 shadow-sm rounded-lg flex flex-col h-full border border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">Flash Sale Deals</h2>
                                <div className="grid grid-cols-2 gap-3 flex-1">
                                    {products.slice(1, 5).map((p, idx) => {
                                        const images = ["/images/dumbbells.png", "/images/gear.png", "/images/protein.png", "/images/dumbbells.png"];
                                        return (
                                            <div key={p._id} className="group cursor-pointer">
                                                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-1.5 relative border border-gray-100">
                                                    <img src={images[idx] || p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                                                    <div className="absolute bottom-2 left-2 bg-[#cc0c39] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                                                        60% off
                                                    </div>
                                                </div>
                                                <p className="text-[11px] font-bold text-red-600">Limited time deal</p>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button className="mt-6 text-xs font-bold text-orange-600 hover:underline text-left">Explore all offers</button>
                            </div>

                            {/* ── SECTION 3: CATEGORIES ── */}
                            <div className="bg-white p-5 shadow-sm rounded-lg flex flex-col h-full border border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">Keep Shopping For</h2>
                                <div className="grid grid-cols-2 gap-3 flex-1">
                                    {categories.slice(1, 5).map(cat => (
                                        <div key={cat} onClick={() => setSelectedCategory(cat)} className="group cursor-pointer">
                                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-1.5 flex items-center justify-center group-hover:bg-orange-50 transition-colors border border-gray-100">
                                                <Package size={28} className="text-gray-300 group-hover:text-orange-500 transition-colors" />
                                            </div>
                                            <p className="text-[11px] font-medium text-gray-700 text-center">{cat}</p>
                                        </div>
                                    ))}
                                </div>
                                <button className="mt-6 text-xs font-bold text-orange-600 hover:underline text-left">Browse categories</button>
                            </div>

                            {/* ── SECTION 4: EDITOR'S PICK ── */}
                            <div className="bg-white p-5 shadow-sm rounded-lg flex flex-col h-full border border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">Editor's Choice</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Performance Grade</p>
                                <div className="flex-1 bg-gray-50 rounded-xl overflow-hidden relative group cursor-pointer border border-gray-100 shadow-inner">
                                    <img src="/images/protein.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Featured" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-4 left-4">
                                        <p className="text-white font-bold tracking-tight text-lg shadow-sm">CoreX Whey Pro</p>
                                        <p className="text-orange-400 text-[10px] font-bold uppercase tracking-widest">Shop Now</p>
                                    </div>
                                </div>
                                <button className="mt-6 text-xs font-bold text-orange-600 hover:underline text-left">View highlight</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── ALL PRODUCTS GRID SECTION ── */}
                {!loading && (
                    <div className="mt-16">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-gray-200 pb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-none mb-1">Premium Catalog</h2>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Top Rated Products</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {categories.slice(0, 4).map(cat => (
                                    <button 
                                        key={cat} 
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${selectedCategory === cat ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-200'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {filteredProducts.map((product, idx) => {
                                const fallbackImages = ["/images/protein.png", "/images/dumbbells.png", "/images/gear.png"];
                                return (
                                    <div 
                                        key={product._id} 
                                        className="bg-white group cursor-pointer transition-all rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl"
                                    >
                                        <div className="aspect-[3/4] overflow-hidden bg-gray-50 relative">
                                            <img src={fallbackImages[idx % 3] || product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} />
                                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-sm text-[9px] font-bold text-gray-900 shadow-sm">
                                                Best Seller
                                            </div>
                                            <button 
                                                onClick={(e) => handleAddToCart(e, product)} 
                                                className="absolute bottom-3 left-3 right-3 py-2 bg-white text-gray-900 text-[10px] font-bold uppercase tracking-wider rounded border border-gray-200 translate-y-[150%] group-hover:translate-y-0 transition-transform duration-300 hover:bg-orange-500 hover:text-white hover:border-orange-500 shadow-sm"
                                            >
                                                Add to Bag
                                            </button>
                                        </div>
                                        <div className="p-4">
                                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">CoreX</p>
                                            <h3 className="text-[13px] font-semibold text-gray-900 line-clamp-1 mb-2">{product.name}</h3>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
                                                <span className="text-[10px] text-gray-400 line-through font-medium">{formatPrice(product.price * 1.4)}</span>
                                                <span className="text-[10px] text-emerald-600 font-bold">40% OFF</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
