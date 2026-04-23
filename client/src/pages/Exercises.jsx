import { useState, useEffect } from 'react';
import { Search, X, Dumbbell } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const bodyParts = ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Cardio', 'Abs'];

const Exercises = () => {
    const [exercises, setExercises] = useState([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { fetchExercises(); }, [filter]);

    const fetchExercises = async () => {
        setLoading(true);
        try {
            let url = '/exercises';
            if (filter !== 'All') url += `?bodyPart=${filter}`;
            const res = await api.get(url);
            setExercises(res.data);
        } catch (error) {
            toast.error('Failed to load exercises');
        } finally {
            setLoading(false);
        }
    };

    const filtered = exercises.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="page-container relative">
            <div className="section-header flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="section-title">Exercise Library</h1>
                    <p className="section-subtitle">Master your form with our detailed guides.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search exercises..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="input-clean pl-8 pr-8 w-full sm:w-48"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                                <X size={12} />
                            </button>
                        )}
                    </div>
                    <select 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="input-clean w-full sm:w-32 bg-gym-dark appearance-none"
                    >
                        {bodyParts.map(part => <option key={part} value={part}>{part}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="spinner" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map((exercise) => (
                        <div
                            key={exercise._id}
                            onClick={() => setSelectedExercise(exercise)}
                            className="clean-card group cursor-pointer overflow-hidden flex flex-col"
                        >
                            <div className="h-40 bg-zinc-800 relative">
                                <img
                                    src={exercise.gifUrl}
                                    alt={exercise.name}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    loading="lazy"
                                />
                                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 backdrop-blur rounded text-[9px] font-bold text-white uppercase">
                                    {exercise.targetBodyPart}
                                </div>
                            </div>
                            <div className="p-3">
                                <h3 className="text-sm font-medium text-white mb-1 group-hover:text-gym-accent transition-colors line-clamp-1">
                                    {exercise.name}
                                </h3>
                                <p className="text-xs text-zinc-500 uppercase">{exercise.equipment}</p>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="col-span-full py-16 text-center text-zinc-500 border border-white/5 rounded-xl border-dashed">
                            No exercises found.
                        </div>
                    )}
                </div>
            )}

            {/* Simple Modal */}
            {selectedExercise && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedExercise(null)}>
                    <div className="clean-card w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <h2 className="text-lg font-bold text-white capitalize">{selectedExercise.name}</h2>
                            <button onClick={() => setSelectedExercise(null)} className="text-zinc-400 hover:text-white p-1">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-zinc-800 rounded-lg overflow-hidden h-48 md:h-full min-h-[200px]">
                                <img src={selectedExercise.gifUrl} alt={selectedExercise.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <div className="flex gap-2 mb-4">
                                    <span className="px-2 py-1 bg-white/5 text-gym-accent text-[10px] uppercase font-bold rounded">{selectedExercise.targetBodyPart}</span>
                                    <span className="px-2 py-1 bg-white/5 text-zinc-300 text-[10px] uppercase font-bold rounded">{selectedExercise.equipment}</span>
                                </div>
                                <h3 className="text-sm font-semibold text-white mb-2">Instructions</h3>
                                <ol className="space-y-2 text-xs text-zinc-400 list-decimal list-inside">
                                    {selectedExercise.instructions?.map((step, i) => (
                                        <li key={i} className="leading-relaxed">{step}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Exercises;
