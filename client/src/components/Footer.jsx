import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, MapPin, Phone, Mail, Zap } from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
    return (
        <footer className="bg-gray-900 pt-16 pb-8">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-1 space-y-6">
                        <Link to="/">
                            <Logo iconSize={14} />
                        </Link>
                        <p className="text-sm leading-relaxed text-gray-400">
                            A premium, AI-driven platform for elite fitness management and peak performance.
                        </p>
                        <div className="flex gap-2">
                            {[Instagram, Twitter, Facebook].map((Icon, i) => (
                                <a key={i} href="#"
                                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-800 text-gray-400 border border-gray-700 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all"
                                >
                                    <Icon size={15} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white mb-6">Explore</h4>
                        <ul className="space-y-3">
                            {[
                                { label: 'Classes', path: '/classes' },
                                { label: 'Store', path: '/products' },
                                { label: 'Exercises', path: '/exercises' },
                                { label: 'Diet Plans', path: '/diets' },
                            ].map(l => (
                                <li key={l.path}>
                                    <Link to={l.path} className="text-sm text-gray-400 hover:text-orange-400 transition-colors font-medium">{l.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white mb-6">Contact</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-sm text-gray-400">
                                <MapPin size={13} className="text-orange-500 flex-shrink-0" /> 123 Iron Street, CA
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-400">
                                <Phone size={13} className="text-orange-500 flex-shrink-0" /> +1 (555) 123-4567
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-400">
                                <Mail size={13} className="text-orange-500 flex-shrink-0" /> support@corex.fitness
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white mb-6">Newsletter</h4>
                        <p className="text-sm text-gray-400 mb-4">Subscribe for training intel and product launches.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter email"
                                className="flex-1 px-4 py-2.5 text-sm rounded-xl outline-none bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-orange-500 transition-colors"
                            />
                            <button className="px-4 py-2.5 rounded-xl text-white text-xs font-bold uppercase btn-primary">
                                Join
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-800">
                    <div className="flex items-center gap-2">
                        <Zap size={12} className="text-orange-500" />
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-600">
                            © {new Date().getFullYear()} CoreX Fitness. All rights reserved.
                        </p>
                    </div>
                    <div className="flex gap-6">
                        {['Privacy', 'Terms', 'Cookies'].map(t => (
                            <a key={t} href="#" className="text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:text-orange-500 transition-colors">{t}</a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
