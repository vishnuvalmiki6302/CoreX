import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Linkedin } from 'lucide-react';
import { getTrainers } from '../api/content';
import toast from 'react-hot-toast';

// Imports for mapping (Temporary solution until real image upload is implemented)
import NGB from "../assets/Images/NGB.jpg";
// import Gaurav from "../assets/Images/Gaurav.jpg";
import M1 from "../assets/Images/M1.avif";
import M2 from "../assets/Images/M2.avif";
import Vastav from "../assets/Images/Vastav.jpg";

const imageMap = {
    "/assets/Images/NGB.jpg": NGB,
    "/assets/Images/Vastav.jpg": Vastav,
    "/assets/Images/M2.avif": M2,
    "/assets/Images/M1.avif": M1
};

const Trainers = () => {
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrainers = async () => {
            try {
                const data = await getTrainers();
                setTrainers(data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load trainers');
            } finally {
                setLoading(false);
            }
        };
        fetchTrainers();
    }, []);

    return (
        <section className="py-20 bg-black relative">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">
                        Meet The <span className="text-gym-accent">Elite</span>
                    </h2>
                    <p className="text-gym-text-secondary max-w-2xl mx-auto">
                        World-class experts dedicated to sculpting your potential.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center text-gym-accent">Loading Trainers...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {trainers.map((trainer, index) => (
                            <motion.div
                                key={trainer._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group relative overflow-hidden rounded-2xl aspect-[3/4]"
                            >
                                <img
                                    src={imageMap[trainer.imageUrl] || trainer.imageUrl} // Fallback to URL if not in map
                                    alt={trainer.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/300x400?text=Trainer"; }} // Fallback
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>

                                <div className="absolute bottom-0 left-0 w-full p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <h3 className="text-xl font-bold text-white leading-tight mb-1">{trainer.name}</h3>
                                    <p className="text-gym-accent text-sm font-medium mb-4">{trainer.role}</p>

                                    <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                        <a href={trainer.socials?.instagram || '#'} className="text-white hover:text-gym-accent transition-colors"><Instagram size={18} /></a>
                                        <a href={trainer.socials?.twitter || '#'} className="text-white hover:text-gym-accent transition-colors"><Twitter size={18} /></a>
                                        <a href={trainer.socials?.linkedin || '#'} className="text-white hover:text-gym-accent transition-colors"><Linkedin size={18} /></a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Trainers;
