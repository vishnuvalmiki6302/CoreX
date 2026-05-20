import { useState, useEffect } from 'react';
import { Instagram, Twitter, Linkedin } from 'lucide-react';
import { getTrainers } from '../api/content';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

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
            try { const data = await getTrainers(); setTrainers(data); }
            catch { toast.error('Failed to load trainers'); }
            finally { setLoading(false); }
        };
        fetchTrainers();
    }, []);

    return (
        <section className="py-24 bg-white border-t border-gray-100">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 border" style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-orange-600">Elite Coaching Staff</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
                        Meet The <span className="orange-text-gradient">Experts</span>
                    </h2>
                    <p className="text-base text-gray-500 max-w-xl mx-auto">
                        Certified professionals dedicated to engineering your peak performance.
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="rounded-2xl overflow-hidden border border-gray-100 bg-white">
                                <div className="aspect-[3/4] skeleton" />
                                <div className="p-5 space-y-2">
                                    <div className="h-3 skeleton rounded w-3/4 mx-auto" />
                                    <div className="h-2 skeleton rounded w-1/2 mx-auto" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {trainers.map((trainer, idx) => (
                            <motion.div
                                key={trainer._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group overflow-hidden flex flex-col cursor-pointer bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all duration-300"
                                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                            >
                                <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
                                    <img
                                        src={imageMap[trainer.imageUrl] || trainer.imageUrl}
                                        alt={trainer.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; }}
                                    />
                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }} />

                                    {/* Social icons on hover */}
                                    <div className="absolute bottom-4 inset-x-4 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                        {trainer.socials?.instagram && (
                                            <a href={trainer.socials.instagram}
                                                className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 transition-colors">
                                                <Instagram size={15} />
                                            </a>
                                        )}
                                        {trainer.socials?.twitter && (
                                            <a href={trainer.socials.twitter}
                                                className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 transition-colors">
                                                <Twitter size={15} />
                                            </a>
                                        )}
                                        {trainer.socials?.linkedin && (
                                            <a href={trainer.socials.linkedin}
                                                className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 transition-colors">
                                                <Linkedin size={15} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="p-5 text-center border-t border-gray-50">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 truncate">{trainer.name}</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-orange-500">{trainer.role}</p>
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
