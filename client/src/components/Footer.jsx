import { Link } from "react-router-dom";
import {
    Instagram,
    Twitter,
    Facebook,
    Mail,
    Phone,
    MapPin,
    Send
} from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-zinc-950 text-white mt-20 border-t border-white/10">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Brand & About */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black italic tracking-tighter">
                            GYM<span className="text-gym-accent">APP</span>
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Your digital forge for elite fitness. Join a community dedicated to
                            breaking limits and sculpting legacies.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-gym-accent hover:text-white transition-colors">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-gym-accent hover:text-white transition-colors">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-gym-accent hover:text-white transition-colors">
                                <Facebook size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-white border-l-4 border-gym-accent pl-3">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/" className="text-gray-400 hover:text-gym-accent transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link to="/classes" className="text-gray-400 hover:text-gym-accent transition-colors">Classes</Link>
                            </li>
                            <li>
                                <Link to="/products" className="text-gray-400 hover:text-gym-accent transition-colors">Shop</Link>
                            </li>
                            <li>
                                <Link to="/diets" className="text-gray-400 hover:text-gym-accent transition-colors">Nutrition Plans</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-white border-l-4 border-gym-accent pl-3">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin size={20} className="text-gym-accent mt-1 flex-shrink-0" />
                                <span className="text-gray-400 text-sm">
                                    123 Iron Street, Muscle City, <br />
                                    Fitness State 90000
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={20} className="text-gym-accent flex-shrink-0" />
                                <span className="text-gray-400 text-sm">+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={20} className="text-gym-accent flex-shrink-0" />
                                <span className="text-gray-400 text-sm">support@gymapp.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-white border-l-4 border-gym-accent pl-3">Newsletter</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Subscribe for workout tips and exclusive offers.
                        </p>
                        <form className="flex flex-col gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gym-accent transition-colors text-sm"
                            />
                            <button className="bg-gym-accent text-white font-bold py-2 rounded-lg hover:bg-gym-accent/80 transition-colors flex items-center justify-center gap-2">
                                Subscribe <Send size={16} />
                            </button>
                        </form>
                    </div>

                </div>

                <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} GymApp. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
