import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-gym-dark border-t border-white/5 pt-12 pb-6">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="md:col-span-1 space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="TitanEdge" className="w-5 h-5 object-contain" />
                            <span className="text-base font-bold text-white tracking-tight">TitanEdge</span>
                        </Link>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            A clean, modern platform for fitness intelligence and management.
                        </p>
                        <div className="flex gap-2">
                            {[Instagram, Twitter, Facebook].map((Icon, i) => (
                                <a key={i} href="#" className="p-1.5 rounded bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                                    <Icon size={14} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4">Explore</h4>
                        <ul className="space-y-2 text-xs text-zinc-400">
                            <li><Link to="/classes" className="hover:text-gym-accent transition-colors">Classes</Link></li>
                            <li><Link to="/products" className="hover:text-gym-accent transition-colors">Store</Link></li>
                            <li><Link to="/exercises" className="hover:text-gym-accent transition-colors">Exercises</Link></li>
                            <li><Link to="/diets" className="hover:text-gym-accent transition-colors">Diet Plans</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
                        <ul className="space-y-2 text-xs text-zinc-400">
                            <li className="flex items-center gap-2"><MapPin size={12} /> 123 Iron St, CA</li>
                            <li className="flex items-center gap-2"><Phone size={12} /> +1 (555) 123-4567</li>
                            <li className="flex items-center gap-2"><Mail size={12} /> support@titanedge.fitness</li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4">Newsletter</h4>
                        <p className="text-xs text-zinc-400 mb-2">Subscribe for updates.</p>
                        <div className="flex gap-2">
                            <input type="email" placeholder="Email" className="input-clean text-xs py-1.5" />
                            <button className="btn-primary py-1.5 px-3 text-xs">Join</button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-zinc-500">
                    <p>&copy; {new Date().getFullYear()} TitanEdge Fitness. All rights reserved.</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-white">Privacy</a>
                        <a href="#" className="hover:text-white">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
