import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Hero = () => {
    const { user } = useAuth();

    const dest = user
        ? user.role === 'admin' ? '/admin' : user.role === 'trainer' ? '/trainer' : '/profile'
        : '/register';

    return (
        <section className="relative w-full min-h-screen bg-white overflow-hidden pt-24 pb-20 flex flex-col items-center justify-center">
            
            {/* Soft Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-orange-400/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 w-full flex flex-col items-center text-center">
                
                {/* Micro-Header Badge */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-8 cursor-default hover:bg-orange-100 transition-colors">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                        Premium Fitness Intelligence
                    </span>
                </div>

                {/* Massive Centered Headline */}
                <h1 className="font-extrabold text-gray-900 leading-[1.05] tracking-tight mb-8"
                    style={{ fontSize: 'clamp(3.5rem, 8vw, 6.5rem)', fontFamily: "'Inter', sans-serif" }}>
                    Redefining Your <br />
                    <span className="relative inline-block mt-2">
                        <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
                            Physical Limits.
                        </span>
                        {/* Decorative swoosh under text */}
                        <svg className="absolute w-full h-4 -bottom-1 left-0 text-orange-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="8" fill="transparent" strokeLinecap="round" />
                        </svg>
                    </span>
                </h1>

                {/* Sub-headline */}
                <p className="text-gray-500 text-lg md:text-xl font-normal leading-relaxed max-w-2xl mb-12">
                    CoreX is an elite, technology-driven training facility. We combine expert coaching, state-of-the-art equipment, and AI analytics to guarantee results.
                </p>

                {/* Primary Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full sm:w-auto">
                    <Link
                        to={dest}
                        className="group flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-orange-500 text-white text-base font-bold uppercase tracking-wide shadow-xl shadow-orange-500/25 hover:bg-orange-600 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
                    >
                        {user ? 'Open Dashboard' : 'Start Your Journey'}
                        <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                    </Link>

                    <button
                        className="group flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-white border-2 border-gray-200 text-gray-900 text-base font-bold uppercase tracking-wide hover:border-gray-900 transition-all duration-300 w-full sm:w-auto"
                    >
                        <PlayCircle size={22} className="text-orange-500 group-hover:scale-110 transition-transform duration-300" />
                        Facility Tour
                    </button>
                </div>
            </div>

            {/* ── Massive Feature Image Component ── */}
            <div className="relative z-10 w-full max-w-6xl mx-auto px-6 mt-4">
                <div className="relative aspect-[16/7] md:aspect-[21/9] rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-900/10 border-8 border-white group">
                    <img
                        src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop"
                        alt="CoreX Facility Interior"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                    
                    {/* Dark gradient at bottom to make floating stats readable */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gray-900/80 to-transparent" />

                    {/* Integrated Floating Stats inside the image */}
                    <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-orange-400" size={24} />
                            <span className="text-white font-semibold tracking-wide">Premium Biometric Scanners</span>
                        </div>
                        <div className="hidden md:block w-px h-8 bg-white/20"></div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-orange-400" size={24} />
                            <span className="text-white font-semibold tracking-wide">Olympic Grade Lifting Platforms</span>
                        </div>
                        <div className="hidden lg:block w-px h-8 bg-white/20"></div>
                        <div className="hidden lg:flex items-center gap-3">
                            <CheckCircle2 className="text-orange-400" size={24} />
                            <span className="text-white font-semibold tracking-wide">24/7 Unlimited Access</span>
                        </div>
                    </div>
                </div>
            </div>

        </section>
    );
};

export default Hero;