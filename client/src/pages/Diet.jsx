import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, Utensils, Award, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Diet = () => {
    const [diets, setDiets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDiets();
    }, []);

    const fetchDiets = async () => {
        try {
            const res = await api.get('/diets');
            setDiets(res.data);
        } catch (error) {
            console.error('Error fetching diets:', error);
            toast.error('Failed to load diet plans');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-24 pb-16 font-sans">
            <div className="container mx-auto px-4 md:px-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <span className="text-gym-gold text-sm font-bold tracking-[0.2em] uppercase mb-4 block">Nutrition Strategies</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-white mb-6">
                        Fuel Your <span className="text-gym-gold italic">Legacy</span>
                    </h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                        Curated nutrition plans designed for the dedicated. Whether you seek to sculpt, build, or sustain, our protocols are your blueprint to excellence.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gym-gold"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {diets.map((diet, index) => (
                            <motion.div
                                key={diet._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.15, duration: 0.6 }}
                                className="bg-zinc-900/50 border border-white/5 rounded-none p-0 group hover:border-gym-gold/30 transition-all duration-500 flex flex-col h-full"
                            >
                                {/* Card Header */}
                                <div className="p-8 pb-6 border-b border-white/5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gym-gold/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-gym-gold/10 transition-colors duration-700"></div>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-zinc-950 border border-white/10 px-3 py-1 text-xs font-bold tracking-wider uppercase text-gym-gold rounded-sm truncate max-w-[60%]">
                                            {diet.isCustom ? 'Custom' : 'Standard'}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-serif text-white">{diet.totalCalories}</div>
                                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Kcal / Day</div>
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-serif text-white mb-2 group-hover:text-gym-gold transition-colors duration-300">{diet.name}</h3>
                                    <p className="text-zinc-400 text-sm line-clamp-2">{diet.description}</p>
                                </div>

                                {/* Meals List */}
                                <div className="p-8 py-6 flex-grow space-y-6">
                                    <div className="space-y-4">
                                        {diet.dailyMeals && diet.dailyMeals.slice(0, 3).map((meal, mIndex) => (
                                            <div key={mIndex} className="border-l-2 border-white/10 pl-4 py-1 group-hover:border-gym-gold/50 transition-colors">
                                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">{meal.type} <span className="text-zinc-600 ml-1">{meal.time}</span></h4>
                                                <ul className="space-y-1">
                                                    {meal.items && meal.items.slice(0, 2).map((item, i) => (
                                                        <li key={i} className="text-sm text-zinc-300 font-light flex items-center gap-2">
                                                            <span className="w-1 h-1 bg-gym-gold rounded-full"></span>
                                                            {item.name} <span className="text-zinc-500 text-xs">({item.portion})</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="p-8 pt-0 mt-auto">
                                    <button className="w-full py-4 border border-white/10 hover:bg-gym-gold hover:text-black hover:border-gym-gold text-white text-sm font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-4">
                                        View Full Plan <ChevronRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Diet;
