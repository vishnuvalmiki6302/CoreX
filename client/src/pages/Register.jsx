import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', phone: '' });
    const { register, googleLogin } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        /* global google */
        if (window.google && !document.getElementById('signUpDiv').hasChildNodes()) {
            google.accounts.id.initialize({
                client_id: "554720621201-d8brfn201od31ugsv2ngujtdfeg2uthr.apps.googleusercontent.com",
                callback: handleCredentialResponse,
            });
            google.accounts.id.renderButton(
                document.getElementById('signUpDiv'),
                { theme: 'outline', size: 'large', width: '100%' }
            );
        }
    }, []);

    const handleCredentialResponse = async (response) => {
        const result = await googleLogin(response.credential);
        if (result?.success) {
            navigate('/');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(formData.username, formData.email, formData.password);
            toast.success('Registration successful!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center p-4">
            <div className="w-full max-w-[750px] flex flex-col md:flex-row-reverse bg-[#09090b] rounded-2xl overflow-hidden shadow-2xl border border-white/10">

                {/* Right Side: Clean Visual */}
                <div className="md:w-[45%] relative hidden md:block border-l border-white/10">
                    <img
                        src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop"
                        alt="Gym Equipment"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-between">
                        <div className="w-8 h-8 flex items-center justify-center">
                            <img src="/logo.png" alt="TitanEdge Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-1.5">Join CoreX !</h2>
                            <p className="text-zinc-300 text-xs leading-relaxed mb-2">
                                Create an account to access premium classes, diet plans, and our exclusive gear store.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Left Side: Clean Form */}
                <div className="md:w-[55%] p-6 sm:p-8 flex flex-col justify-center bg-[#18181b]">
                    <div className="mb-6">
                        <h1 className="text-xl font-semibold text-white mb-1">Create Account</h1>
                        <p className="text-xs text-zinc-400">Join our community and transform your life.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label className="block text-xs font-medium text-zinc-300 mb-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-1.5 bg-[#09090b] border border-white/10 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors text-sm"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="JohnDoe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-300 mb-1">Phone <span className="text-zinc-500">(Optional)</span></label>
                                <input
                                    type="tel"
                                    className="w-full px-3 py-1.5 bg-[#09090b] border border-white/10 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors text-sm"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+1 234 567"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-300 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full px-3 py-1.5 bg-[#09090b] border border-white/10 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors text-sm"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-3 py-1.5 bg-[#09090b] border border-white/10 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors text-sm"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>

                        <button type="submit" disabled={loading} className="w-full py-1.5 mt-2 bg-white text-black rounded-md font-medium text-sm hover:bg-zinc-200 transition-colors">
                            {loading ? 'Creating...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative flex py-2 items-center mb-5">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-zinc-500 text-xs">Or join with</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>

                        <div className="flex justify-center w-full">
                            <div id="signUpDiv" className="w-full flex justify-center overflow-hidden rounded-md"></div>
                        </div>
                    </div>

                    <div className="mt-6 text-center text-xs text-zinc-400">
                        Already have an account? <Link to="/login" className="text-white font-medium hover:underline">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
