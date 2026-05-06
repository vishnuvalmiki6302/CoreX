import { useState, useEffect } from 'react';
import { Instagram, Twitter, Linkedin } from 'lucide-react';
import { getTrainers } from '../api/content';
import toast from 'react-hot-toast';

import NGB from "../assets/Images/NGB.jpg";
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
            } catch {
                toast.error('Failed to load trainers');
            } finally {
                setLoading(false);
            }
        };
        fetchTrainers();
    }, []);

    return (
        <section className="py-20 bg-gym-dark border-t border-white/5">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Expert Trainers</h2>
                    <p className="text-base text-zinc-400 max-w-xl mx-auto">
                        Work with certified professionals to reach your fitness goals.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center h-40 items-center">
                        <div className="spinner" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {trainers.map((trainer) => (
                            <div key={trainer._id} className="clean-card overflow-hidden flex flex-col group">
                                <div className="aspect-[3/4] bg-zinc-800 relative overflow-hidden">
                                    <img
                                        src={imageMap[trainer.imageUrl] || trainer.imageUrl}
                                        alt={trainer.name}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; }}
                                    />
                                </div>
                                <div className="p-5 text-center border-t border-white/5">
                                    <h3 className="text-base font-semibold text-white truncate">{trainer.name}</h3>
                                    <p className="text-xs text-zinc-400 uppercase mb-3">{trainer.role}</p>
                                    <div className="flex justify-center gap-3 text-zinc-500">
                                        {trainer.socials?.instagram && (
                                            <a href={trainer.socials.instagram} className="hover:text-gym-accent transition-colors"><Instagram size={18} /></a>
                                        )}
                                        {trainer.socials?.twitter && (
                                            <a href={trainer.socials.twitter} className="hover:text-gym-accent transition-colors"><Twitter size={18} /></a>
                                        )}
                                        {trainer.socials?.linkedin && (
                                            <a href={trainer.socials.linkedin} className="hover:text-gym-accent transition-colors"><Linkedin size={18} /></a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Trainers;
