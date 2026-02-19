import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Play } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Exercises = () => {
    const [exercises, setExercises] = useState([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [selectedExercise, setSelectedExercise] = useState(null);

    useEffect(() => {
        fetchExercises();
    }, [filter]);

    const fetchExercises = async () => {
        setLoading(true);
        try {
            let url = '/exercises';
            if (filter !== 'All') {
                url += `?bodyPart=${filter}`;
            }
            const res = await api.get(url);
            setExercises(res.data);
        } catch (error) {
            console.error('Error fetching exercises:', error);
            toast.error('Failed to load exercises');
        } finally {
            setLoading(false);
        }
    };

    const bodyParts = ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Cardio', 'Abs'];

    return (
        <div className="min-h-screen bg-gym-dark text-white relative">
            {/* Header Section */}
            <div className="bg-zinc-900 border-b border-zinc-800 py-12">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-5xl font-black mb-4 tracking-tighter uppercase">
                        Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-gym-accent to-orange-500">Craft</span>
                    </h2>
                    <p className="text-gym-text-secondary max-w-2xl mx-auto text-lg">
                        Access our elite library of {exercises.length}+ exercises. Filter by muscle group and perfect your form with professional guidance.
                    </p>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap justify-center gap-3 mt-8">
                        {bodyParts.map((part) => (
                            <button
                                key={part}
                                onClick={() => setFilter(part)}
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all border ${filter === part
                                    ? 'bg-gym-accent border-gym-accent text-white shadow-lg shadow-gym-accent/25'
                                    : 'bg-zinc-800 border-zinc-700 text-gym-text-secondary hover:bg-zinc-700 hover:text-white'
                                    }`}
                            >
                                {part}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid Content */}
            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-96">
                        <div className="w-16 h-16 border-4 border-gym-accent border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gym-text-secondary animate-pulse">Loading Library...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {exercises.map((exercise, index) => (
                            <motion.div
                                key={exercise._id}
                                layoutId={`card-${exercise._id}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedExercise(exercise)}
                                className="group bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 cursor-pointer hover:border-gym-accent/50 transition-all hover:shadow-2xl hover:shadow-gym-accent/10 relative"
                            >
                                <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/10">
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">{exercise.targetBodyPart}</span>
                                </div>

                                <div className="h-56 overflow-hidden relative bg-zinc-800">
                                    <img
                                        src={exercise.gifUrl}
                                        alt={exercise.name}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-90" />
                                </div>

                                <div className="p-5 relative -mt-12">
                                    <h3 className="text-xl font-bold text-white mb-1 leading-tight group-hover:text-gym-accent transition-colors">{exercise.name}</h3>
                                    <p className="text-xs text-gym-text-secondary mb-4 uppercase tracking-wider">{exercise.equipment}</p>

                                    <button className="w-full bg-white/5 hover:bg-white/10 border border-white/5 text-sm font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 group-hover:bg-gym-accent group-hover:text-white group-hover:border-gym-accent">
                                        View Details <Play size={14} fill="currentColor" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detailed Modal */}
            <AnimatePresence>
                {selectedExercise && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                        onClick={() => setSelectedExercise(null)}
                    >
                        <motion.div
                            layoutId={`card-${selectedExercise._id}`}
                            className="bg-zinc-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-700 shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedExercise(null)}
                                className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black p-2 rounded-full text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2">
                                <div className="h-64 md:h-full min-h-[400px] bg-zinc-800 relative">
                                    <img
                                        src={selectedExercise.gifUrl}
                                        alt={selectedExercise.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-900 to-transparent">
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 bg-gym-accent text-white text-xs font-bold rounded-full uppercase">{selectedExercise.targetBodyPart}</span>
                                            <span className="px-3 py-1 bg-zinc-700 text-white text-xs font-bold rounded-full uppercase">{selectedExercise.equipment}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 space-y-8">
                                    <div>
                                        <h2 className="text-4xl font-black text-white mb-2 uppercase leading-none">{selectedExercise.name}</h2>
                                        <p className="text-gym-text-secondary text-lg">Master the technique</p>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold text-gym-accent border-b border-zinc-800 pb-2">Instructions</h3>
                                        <ol className="space-y-4">
                                            {selectedExercise.instructions.map((step, i) => (
                                                <li key={i} className="flex gap-4 items-start group">
                                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-gym-accent font-bold flex items-center justify-center group-hover:bg-gym-accent group-hover:text-white transition-colors">
                                                        {i + 1}
                                                    </span>
                                                    <p className="text-gray-300 leading-relaxed pt-1">{step}</p>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>

                                    <div className="bg-gym-accent/10 border border-gym-accent/20 p-4 rounded-xl">
                                        <p className="text-sm text-gym-accent font-semibold text-center">
                                            💡 Pro Tip: Focus on form over weight to maximize hypertrophy and prevent injury.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Exercises;
