import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login, googleLogin, user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    useEffect(() => {
        if (user) { navigate('/'); return; }
        /* global google */
        if (window.google && !document.getElementById('signInDiv').hasChildNodes()) {
            google.accounts.id.initialize({
                client_id: "554720621201-d8brfn201od31ugsv2ngujtdfeg2uthr.apps.googleusercontent.com",
                callback: handleCredentialResponse,
            });
            google.accounts.id.renderButton(
                document.getElementById('signInDiv'),
                { theme: 'outline', size: 'large', width: '100%' }
            );
        }
    }, [user, navigate]);

    const handleCredentialResponse = async (response) => {
        const result = await googleLogin(response.credential);
        if (result?.success) navigate('/');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userData = await login(formData.email, formData.password);
            toast.success('Welcome back!');
            if (['super_admin', 'admin', 'gym_owner'].includes(userData.role)) navigate('/admin');
            else if (userData.role === 'receptionist') navigate('/reception');
            else if (userData.role?.includes('trainer')) navigate('/trainer');
            else navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left – warm photo side */}
            <div className="hidden lg:block lg:w-5/12 relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop"
                    alt="Gym"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Simple dark-to-transparent overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Brand name bottom-left */}
                <div className="absolute bottom-10 left-10">
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">CoreX Fitness</p>
                    <h2 className="text-white text-3xl font-bold leading-snug">
                        Every rep<br />counts.
                    </h2>
                </div>
            </div>

            {/* Right – form */}
            <div className="flex-1 flex items-center justify-center bg-white px-8 py-16">
                <div className="w-full max-w-[380px]">

                    {/* Logo mark */}
                    <div className="mb-10">
                        <span className="text-orange-500 font-black text-2xl tracking-tight">CoreX</span>
                        <p className="text-gray-400 text-sm mt-0.5 font-medium">Fitness Intelligence Platform</p>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
                    <p className="text-sm text-gray-500 mb-8">Good to have you back. Enter your details below.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                            <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all bg-white">
                                <Mail size={15} className="ml-3.5 text-gray-400 shrink-0" />
                                <input
                                    type="email" required placeholder="you@email.com"
                                    className="flex-1 px-3 py-3 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-xs font-semibold text-gray-600">Password</label>
                                <Link to="/forgot-password" className="text-xs text-orange-500 hover:underline">Forgot password?</Link>
                            </div>
                            <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all bg-white">
                                <Lock size={15} className="ml-3.5 text-gray-400 shrink-0" />
                                <input
                                    type={showPass ? 'text' : 'password'} required placeholder="••••••••"
                                    className="flex-1 px-3 py-3 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button type="button" onClick={() => setShowPass(s => !s)} className="mr-3 text-gray-400 hover:text-gray-600 transition-colors">
                                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit" disabled={loading}
                            className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold tracking-wide transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                        >
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400">or</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Google */}
                    <div id="signInDiv" className="w-full flex justify-center" />

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-orange-500 font-semibold hover:underline">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
