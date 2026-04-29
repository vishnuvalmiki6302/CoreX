import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
    return (
        <div className="relative min-h-[85vh] flex items-center justify-center bg-gym-dark pt-16 border-b border-white/5">
            {/* Subtle background image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
                    alt="Gym Background"
                    className="w-full h-full object-cover opacity-10 object-center grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gym-dark to-transparent" />
            </div>

            <div className="container mx-auto px-4 z-10 relative">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300 mb-6">
                        <span className="w-2 h-2 rounded-full bg-gym-accent mr-2"></span>
                        Next Generation Fitness Platform
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
                        Forge Your Legacy with <br />
                        <span className="text-gym-accent">Data & Discipline</span>
                    </h1>

                    <p className="text-base md:text-lg text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Elevate your performance with CoreX. Combine elite physical training with AI-driven insights to push beyond your limits.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="btn-primary w-full sm:w-auto px-8 py-3 text-base">
                            Start Free Trial <ArrowRight size={18} />
                        </Link>
                        <Link to="/classes" className="btn-outline w-full sm:w-auto px-8 py-3 text-base">
                            View Schedule
                        </Link>
                    </div>
                </div>

                {/* Clean Stats */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-white/5 pt-8">
                    {[
                        { label: 'Active Members', value: '2.4k' },
                        { label: 'Elite Programs', value: '50+' },
                        { label: 'Success Rate', value: '98%' },
                        { label: 'Expert Trainers', value: '25+' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Hero;