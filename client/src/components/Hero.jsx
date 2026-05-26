import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Zap, Users, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

const SLIDES = [
    {
        src: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop',
        label: 'Olympic Lifting Floor',
    },
    {
        src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop',
        label: 'Elite Training Zone',
    },
    {
        src: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=2075&auto=format&fit=crop',
        label: 'Cardio & Conditioning',
    },
    {
        src: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop',
        label: 'Free Weights Area',
    },
    {
        src: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?q=80&w=2067&auto=format&fit=crop',
        label: 'Recovery & Stretch Zone',
    },
];

const slideVariants = {
    enter: (d) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: d > 0 ? -60 : 60 }),
};

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

    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);

    const next = useCallback(() => {
        setDirection(1);
        setCurrent(c => (c + 1) % SLIDES.length);
    }, []);

    const prev = useCallback(() => {
        setDirection(-1);
        setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length);
    }, []);

    const goTo = useCallback((i) => {
        setDirection(i > current ? 1 : -1);
        setCurrent(i);
    }, [current]);

    // Auto-advance every 5 seconds
    useEffect(() => {
        const t = setInterval(next, 5000);
        return () => clearInterval(t);
    }, [next]);

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

                    <a href="#plans" className="group flex items-center justify-center gap-3 w-full sm:w-auto btn-secondary text-base"
                        style={{ paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '2.5rem', paddingRight: '2.5rem', borderRadius: '0.875rem', fontSize: '0.85rem' }}>
                        View Plans
                    </a>
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

            {/* ── Auto-Sliding Image Carousel ── */}
            <motion.div
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
                className="relative z-10 w-full max-w-6xl mx-auto px-6"
            >
                <div className="relative aspect-[16/7] md:aspect-[21/9] rounded-2xl overflow-hidden"
                    style={{ border: '1px solid #e5e7eb', boxShadow: '0 24px 64px rgba(0,0,0,0.12)' }}>

                    {/* Slides */}
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                        <motion.img
                            key={current}
                            src={SLIDES[current].src}
                            alt={SLIDES[current].label}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
                            className="absolute inset-0 w-full h-full object-cover object-center"
                        />
                    </AnimatePresence>

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 z-10"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 50%, transparent 100%)' }} />

                    {/* Prev arrow */}
                    <button onClick={prev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                        style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
                        <ChevronLeft size={20} className="text-white" />
                    </button>

                    {/* Next arrow */}
                    <button onClick={next}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                        style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
                        <ChevronRight size={20} className="text-white" />
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-20 md:bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                        {SLIDES.map((_, i) => (
                            <button key={i} onClick={() => goTo(i)}
                                className="transition-all duration-300 rounded-full"
                                style={{
                                    width: i === current ? '24px' : '7px',
                                    height: '7px',
                                    background: i === current ? '#f97316' : 'rgba(255,255,255,0.45)',
                                }}
                            />
                        ))}
                    </div>

                    {/* Slide label */}
                    <div className="absolute bottom-[72px] md:bottom-[52px] right-5 z-20">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={current}
                                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.3 }}
                                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                                style={{ color: 'rgba(255,255,255,0.55)' }}
                            >
                                {SLIDES[current].label}
                            </motion.span>
                        </AnimatePresence>
                    </div>

                    {/* Feature bar */}
                    <div className="absolute bottom-5 left-5 right-5 z-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-6 py-4 rounded-xl"
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