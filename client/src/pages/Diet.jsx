import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Diet = () => {
    const [diets, setDiets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => { fetchDiets(); }, []);

    const fetchDiets = async () => {
        try {
            const res = await api.get('/diets');
            setDiets(res.data);
        } catch {
            toast.error('Failed to load diet plans');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="section-header">
                <h1 className="section-title">Nutrition Plans</h1>
                <p className="section-subtitle">Goal-oriented meal protocols.</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="spinner" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {diets.map((diet) => (
                        <div key={diet._id} className="clean-card p-5 flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-gym-accent/10 text-gym-accent">
                                    {diet.goal || 'Standard'}
                                </span>
                                <span className="text-sm font-bold text-white">
                                    {diet.calories || diet.totalCalories} <span className="text-[10px] text-zinc-500 font-normal">kcal</span>
                                </span>
                            </div>

                            <h3 className="text-base font-semibold text-white mb-1">{diet.title || diet.name}</h3>
                            <p className="text-xs text-zinc-400 mb-4 line-clamp-2">{diet.description}</p>

                            {diet.macros && (
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {Object.entries(diet.macros).map(([key, val]) => (
                                        <div key={key} className="bg-white/5 rounded p-2 text-center">
                                            <div className="text-xs font-semibold text-white">{val}</div>
                                            <div className="text-[9px] text-zinc-500 uppercase">{key}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => setSelected(diet)}
                                className="mt-auto btn-outline w-full py-2 text-xs"
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Diet Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelected(null)}>
                    <div className="clean-card w-full max-w-xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gym-gray border-b border-white/5 p-4 flex justify-between items-center z-10">
                            <div>
                                <span className="text-[10px] text-gym-accent uppercase font-bold">{selected.goal}</span>
                                <h2 className="text-lg font-bold text-white leading-tight">{selected.title || selected.name}</h2>
                            </div>
                            <button onClick={() => setSelected(null)} className="text-zinc-400 hover:text-white p-1">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-4 md:p-6 space-y-6">
                            <p className="text-sm text-zinc-400">{selected.description}</p>
                            
                            {selected.macros && (
                                <div className="grid grid-cols-3 gap-3">
                                    {Object.entries(selected.macros).map(([key, val]) => (
                                        <div key={key} className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
                                            <div className="text-sm font-bold text-white">{val}</div>
                                            <div className="text-[10px] text-zinc-500 uppercase">{key}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-semibold text-white mb-3 border-b border-white/5 pb-2">Meals</h3>
                                <div className="space-y-3">
                                    {selected.dailyMeals?.map((meal, i) => (
                                        <div key={i} className="bg-white/5 rounded-lg p-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="text-xs font-bold text-white uppercase">{meal.type}</h4>
                                                {meal.time && <span className="text-[10px] text-zinc-500">{meal.time}</span>}
                                            </div>
                                            <div className="space-y-1.5 border-t border-white/5 pt-2 mt-1">
                                                {meal.items?.map((item, j) => (
                                                    <div key={j} className="flex justify-between items-center text-xs">
                                                        <span className="text-zinc-300">{item.name}</span>
                                                        <div className="flex gap-2 text-zinc-500 text-[10px]">
                                                            <span>{item.portion}</span>
                                                            {item.calories && <span className="text-gym-accent">{item.calories} cal</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Diet;
