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
        <section className="py-20 bg-gym-dark border-t border-white/5">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Get In Touch</h2>
                    <p className="text-sm text-zinc-400">Have questions? We're here to help.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Info */}
                    <div className="space-y-6">
                        <div className="clean-card p-5 flex items-start gap-4">
                            <div className="p-2 bg-white/5 rounded text-gym-accent">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-white">Location</h4>
                                <p className="text-xs text-zinc-400">123 Iron Street, Muscle Beach, CA 90210</p>
                            </div>
                        </div>
                        <div className="clean-card p-5 flex items-start gap-4">
                            <div className="p-2 bg-white/5 rounded text-gym-accent">
                                <Phone size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-white">Phone</h4>
                                <p className="text-xs text-zinc-400">+1 (555) 123-4567</p>
                            </div>
                        </div>
                        <div className="clean-card p-5 flex items-start gap-4">
                            <div className="p-2 bg-white/5 rounded text-gym-accent">
                                <Mail size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-white">Email</h4>
                                <p className="text-xs text-zinc-400">contact@titanedge.fitness</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="clean-card p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-clean"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="input-clean"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">Message</label>
                                <textarea
                                    required
                                    className="input-clean min-h-[120px] resize-y"
                                    value={formData.message}
                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full"
                            >
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
