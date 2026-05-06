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
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Get In Touch</h2>
                    <p className="text-base text-zinc-400">Have questions? We're here to help.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Info */}
                    <div className="space-y-6">
                        <div className="clean-card p-6 flex items-start gap-5">
                            <div className="p-3 bg-white/5 rounded-lg text-gym-accent">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-white mb-1">Location</h4>
                                <p className="text-sm text-zinc-400">123 Iron Street, Muscle Beach, CA 90210</p>
                            </div>
                        </div>
                        <div className="clean-card p-6 flex items-start gap-5">
                            <div className="p-3 bg-white/5 rounded-lg text-gym-accent">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-white mb-1">Phone</h4>
                                <p className="text-sm text-zinc-400">+1 (555) 123-4567</p>
                            </div>
                        </div>
                        <div className="clean-card p-6 flex items-start gap-5">
                            <div className="p-3 bg-white/5 rounded-lg text-gym-accent">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-white mb-1">Email</h4>
                                <p className="text-sm text-zinc-400">contact@corex.fitness</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="clean-card p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-clean px-4 py-3 text-base"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="input-clean px-4 py-3 text-base"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Message</label>
                                <textarea
                                    required
                                    className="input-clean px-4 py-3 text-base min-h-[150px] resize-y"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-3 text-base font-bold mt-2"
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
