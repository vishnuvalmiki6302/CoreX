import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Hero = () => {
    const { user } = useAuth();

    const dest = user
        ? user.role === 'admin' ? '/admin' : user.role === 'trainer' ? '/trainer' : '/profile'
        : '/register';

    return (
        <section className="w-full h-screen flex pt-16 bg-black overflow-hidden">

            {/* ── LEFT PANEL: Content ── */}
            <div className="relative z-10 w-full lg:w-[52%] flex flex-col justify-between px-8 md:px-14 py-12">

                {/* Top label */}
                <div className="flex items-center gap-3">
                    <span className="h-[2px] w-8 bg-orange-500 inline-block" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-400">
                        Premium · Unisex · Est. 2020
                    </span>
                </div>

                {/* Middle: Main headline + CTA */}
                <div>
                    <h1
                        className="font-black text-white leading-[1.0] tracking-tight mb-6"
                        style={{
                            fontSize: 'clamp(3rem, 6.5vw, 6rem)',
                            fontFamily: "'Inter', sans-serif",
                        }}
                    >
                        No Excuses.<br />
                        <span className="text-orange-500">Just Results.</span>
                    </h1>

                    <p className="text-zinc-400 text-base md:text-lg font-light leading-relaxed max-w-md mb-10">
                        Premium unisex fitness club built for everyone who's ready to work.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-14">
                        {/* Primary — gradient pill with glow */}
                        <Link
                            to={dest}
                            className="group relative inline-flex items-center justify-center gap-3 px-9 py-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold uppercase tracking-widest shadow-[0_0_24px_rgba(249,115,22,0.45)] hover:shadow-[0_0_40px_rgba(249,115,22,0.7)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
                        >
                            {user ? 'My Dashboard' : 'Start Free Trial'}
                            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
                        </Link>

                        {/* Secondary — transparent pill, subtle border */}
                        <Link
                            to="/classes"
                            className="group relative inline-flex items-center justify-center gap-3 px-9 py-4 rounded-full border border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold uppercase tracking-widest backdrop-blur-sm transition-all duration-200"
                        >
                            View Classes
                            <ChevronRight size={15} className="text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200" />
                        </Link>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-6 border-t border-zinc-800 pt-8">
                        {[
                            { n: '2,400+', l: 'Members' },
                            { n: '50+',    l: 'Weekly Classes' },
                            { n: '25+',    l: 'Expert Trainers' },
                        ].map((s, i) => (
                            <div key={i}>
                                <p className="text-white font-black text-2xl md:text-3xl leading-none mb-1"
                                   style={{ fontFamily: "'Inter', sans-serif" }}>
                                    {s.n}
                                </p>
                                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold">{s.l}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom: Tags */}
                <div className="flex flex-wrap gap-2">
                    {['Strength', 'Yoga', 'HIIT', 'Pilates', 'Cardio', 'Boxing'].map(t => (
                        <span key={t} className="px-3 py-1 border border-zinc-800 text-zinc-500 text-[10px] uppercase tracking-widest font-semibold hover:border-orange-500 hover:text-orange-400 transition-colors cursor-default">
                            {t}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── RIGHT PANEL: Image ── */}
            <div className="hidden lg:block relative flex-1 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=90&w=2070&auto=format&fit=crop"
                    alt="CoreX Unisex Fitness Facility"
                    className="w-full h-full object-cover object-center"
                    style={{ filter: 'brightness(0.75) contrast(1.05)' }}
                />
                {/* Subtle left edge fade to blend with dark panel */}
                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent" />

                {/* Floating "Unisex" badge on the image */}
                <div className="absolute bottom-12 right-10 bg-black/70 backdrop-blur-md border border-white/10 px-6 py-4 text-right">
                    <p className="text-white font-bold text-lg leading-none mb-1">Men &amp; Women</p>
                    <p className="text-zinc-400 text-xs uppercase tracking-widest">Fully Inclusive</p>
                </div>
            </div>

        </section>
    );
};

export default Hero;