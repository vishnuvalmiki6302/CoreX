import { useState } from 'react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import { submitContact } from '../api/content';
import toast from 'react-hot-toast';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await submitContact(formData);
            toast.success('Message sent successfully!');
            setFormData({ name: '', email: '', message: '' });
        } catch {
            toast.error('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-white py-16" id="contact">
            {/* Decreased container size to max-w-5xl */}
            <div className="container mx-auto px-4 max-w-5xl">
                
                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 overflow-hidden flex flex-col lg:flex-row border border-gray-100">
                    
                    {/* Left Side: Visual & Info (Compact) */}
                    <div className="w-full lg:w-5/12 relative h-[250px] lg:h-auto lg:min-h-full">
                        {/* Background Image */}
                        <img 
                            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop" 
                            alt="Gym Athlete" 
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Dark Overlay with Orange Tint */}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-orange-900/40 mix-blend-multiply"></div>
                        
                        <div className="absolute inset-0 p-8 flex flex-col justify-end">
                            <h2 className="text-3xl font-black text-white mb-2">Start Your Journey.</h2>
                            <p className="text-gray-300 mb-6 text-sm">Reach out to us and let's build your ultimate fitness plan together.</p>
                            
                            {/* Hidden on very small screens to save space, visible otherwise */}
                            <div className="hidden sm:flex flex-col space-y-4">
                                <div className="flex items-center gap-3 text-white">
                                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                        <MapPin size={16} className="text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold leading-tight">Location</p>
                                        <p className="text-xs text-gray-300">123 Iron St, Muscle Beach</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-white">
                                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                        <Phone size={16} className="text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold leading-tight">Call Us</p>
                                        <p className="text-xs text-gray-300">+1 (555) 123-4567</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Form (Compact) */}
                    <div className="w-full lg:w-7/12 p-8 md:p-10 bg-white">
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Send a Message</h3>
                        <p className="text-sm text-gray-500 mb-8">We usually reply within a few hours.</p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">First & Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 text-sm rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all outline-none"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="john@example.com"
                                        className="w-full px-4 py-3 text-sm rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all outline-none"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">How can we help?</label>
                                <textarea
                                    required
                                    placeholder="Tell us about your fitness goals..."
                                    className="w-full px-4 py-3 text-sm rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all outline-none min-h-[120px] resize-y"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                ></textarea>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className="group w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white text-sm font-bold uppercase tracking-wide hover:bg-orange-500 transition-colors duration-300 disabled:opacity-70 mt-2"
                            >
                                {loading ? 'Sending...' : 'Send Message'}
                                {!loading && <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                            </button>
                        </form>
                    </div>
                    
                </div>
            </div>
        </section>
    );
};

export default Contact;
