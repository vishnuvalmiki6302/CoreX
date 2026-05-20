import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, CheckCircle2, Zap, Users, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Hero = () => {
    const { user } = useAuth();
    const dest = user
        ? user.role === 'admin' ? '/admin' : user.role === 'trainer' ? '/trainer' : '/profile'
        : '/register';

    const stats = [
        { label: 'Active Members', value: '2,400+', icon: Users },
        { label: 'Programs', value: '48', icon: Trophy },
        { label: 'AI-Powered', value: '100%', icon: Zap },
    ];

    return (
        <section className="relative w-full min-h-screen bg-gray-100 overflow-hidden pt-24 pb-20 flex flex-col items-center justify-center">
            {/* Decorative orange blobs */}
            <div className="absolute top-0 right-0 w-[520px] h-[520px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)' }} />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)' }} />

            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)', backgroundSize: '72px 72px' }} />

            <div className="relative z-10 max-w-5xl mx-auto px-6 w-full flex flex-col items-center text-center">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border mb-10 cursor-default"
                    style={{ background: '#fff7ed', borderColor: '#fed7aa' }}
                >
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                        AI-Powered Elite Training Platform
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                    className="font-extrabold leading-[1.04] tracking-tight mb-8 text-gray-900"
                    style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', fontFamily: "'Outfit', sans-serif" }}
                >
                    Forge Your{' '}
                    <span className="orange-text-gradient">Elite</span>
                    <br />
                    <span className="text-gray-400">Physique.</span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl font-normal text-gray-500 leading-relaxed max-w-2xl mb-14"
                >
                    CoreX is an elite, AI-driven training facility. Expert coaching, state-of-the-art equipment, and real-time analytics — engineered to deliver results.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full sm:w-auto"
                >
                    <Link to={dest}
                        className="group flex items-center justify-center gap-3 w-full sm:w-auto btn-primary text-base"
                        style={{ paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '2.5rem', paddingRight: '2.5rem', borderRadius: '0.875rem', fontSize: '0.85rem' }}
                    >
                        {user ? 'Open Dashboard' : 'Start Your Journey'}
                        <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                    </Link>

                    <button className="group flex items-center justify-center gap-3 w-full sm:w-auto btn-secondary text-base"
                        style={{ paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '2.5rem', paddingRight: '2.5rem', borderRadius: '0.875rem', fontSize: '0.85rem' }}>
                        <PlayCircle size={22} className="text-orange-500 group-hover:scale-110 transition-transform" />
                        Facility Tour
                    </button>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-wrap items-center justify-center gap-10 mb-16"
                >
                    {stats.map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: '#fff7ed', border: '1.5px solid #fed7aa' }}>
                                <s.icon size={18} className="text-orange-500" />
                            </div>
                            <div>
                                <p className="text-xl font-black text-gray-900 leading-none">{s.value}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Feature Image */}
            <motion.div
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
                className="relative z-10 w-full max-w-6xl mx-auto px-6"
            >
                <div className="relative aspect-[16/7] md:aspect-[21/9] rounded-2xl overflow-hidden group"
                    style={{ border: '1px solid #e5e7eb', boxShadow: '0 24px 64px rgba(0,0,0,0.12)' }}>
                    <img
                        src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop"
                        alt="CoreX Facility"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />

                    <div className="absolute bottom-5 left-5 right-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-6 py-4 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)' }}>
                        {[
                            'Premium Biometric Scanners',
                            'Olympic Grade Lifting Platforms',
                            '24/7 Unlimited Access'
                        ].map((feat, i) => (
                            <div key={i} className="flex items-center gap-3">
                                {i > 0 && <div className="hidden md:block w-px h-7 bg-white/20" />}
                                <CheckCircle2 size={20} className="text-orange-400 flex-shrink-0" />
                                <span className="text-white font-semibold text-sm">{feat}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default Hero;