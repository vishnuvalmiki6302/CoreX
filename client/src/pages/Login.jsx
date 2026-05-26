import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login, googleLogin, user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

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
                { theme: 'outline', size: 'large', type: 'standard', text: 'continue_with', width: '280' }
            );
        }
    }, [user, navigate]);

    const handleCredentialResponse = async (response) => {
        const result = await googleLogin(response.credential);
        if (result?.success) navigate('/');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await performLogin(formData.email, formData.password);
    };

    const handleQuickLogin = async (email, password) => {
        setFormData({ email, password });
        await performLogin(email, password);
    };

    const performLogin = async (email, password) => {
        setLoading(true);
        try {
            const userData = await login(email, password);
            toast.success('Welcome back!');
            if (['super_admin', 'admin', 'gym_owner'].includes(userData.role)) navigate('/admin');
            else if (userData.role === 'receptionist') navigate('/reception');
            else if (userData.role?.includes('trainer') || userData.role === 'male_trainer' || userData.role === 'female_trainer') navigate('/trainer');
            else navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-40 pt-16 flex items-center justify-center bg-[#f0f2f5] px-4 overflow-hidden">
            <div className="bg-white rounded-[30px] shadow-2xl flex max-w-[800px] w-full relative overflow-hidden">

                {/* Left Side - Form (Login) */}
                <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col items-center justify-center bg-white z-10">
                    <h2 className="text-2xl font-bold text-gray-800 mb-5 tracking-tight">Sign in</h2>

                    <form className="w-full max-w-sm flex flex-col gap-2.5" onSubmit={handleSubmit}>
                        <input
                            type="email" required placeholder="Email"
                            className="bg-gray-100 px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-200 transition-all border-none"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                        <input
                            type="password" required placeholder="Password"
                            className="bg-gray-100 px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-200 transition-all border-none"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />

                        <div className="flex justify-center mt-1 mb-2">
                            <Link to="/forgot-password" className="text-[13px] text-gray-500 hover:text-gray-800 border-b border-transparent hover:border-gray-800 transition-colors">
                                Forgot your password?
                            </Link>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="bg-orange-500 text-white rounded-full py-3 mt-1 font-bold tracking-widest text-[12px] uppercase hover:bg-orange-600 transition-all shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] mx-auto px-12 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Developer Quick Login Panel */}
                    {/* <div className="w-full max-w-sm mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mb-2">Developer Quick Login</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { role: 'Admin', email: 'admin@gmail.com', pass: '123456', color: 'bg-indigo-100 text-indigo-700' },
                                { role: 'Reception', email: 'receptionist@gmail.com', pass: '123456', color: 'bg-teal-100 text-teal-700' },
                                { role: 'Trainer', email: 'trainer@gmail.com', pass: '123456', color: 'bg-blue-100 text-blue-700' },
                                { role: 'Member', email: 'user@gmail.com', pass: '123456', color: 'bg-emerald-100 text-emerald-700' }
                            ].map(btn => (
                                <button
                                    key={btn.role}
                                    type="button"
                                    onClick={() => handleQuickLogin(btn.email, btn.pass)}
                                    disabled={loading}
                                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${btn.color} hover:opacity-80 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {btn.role}
                                </button>
                            ))}
                        </div>
                    </div> */}

                    <div className="flex items-center gap-3 w-full max-w-sm my-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 uppercase tracking-wider">or continue with</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Google Auth */}
                    <div className="flex justify-center w-full max-w-sm mb-4">
                        <div id="signInDiv" />
                    </div>

                    {/* Mobile only toggle link */}
                    <div className="md:hidden mt-6">
                        <span className="text-xs text-gray-500">Don't have an account? </span>
                        <Link to="/register" className="text-xs text-orange-500 font-bold hover:underline">Sign Up</Link>
                    </div>
                </div>

                {/* Right Side - Colored Panel */}
                <div
                    className="hidden md:flex w-2/5 bg-gradient-to-br from-orange-400 to-orange-600 text-white flex-col items-center justify-center px-6 text-center relative z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.1)]"
                    style={{ borderTopLeftRadius: '100px', borderBottomLeftRadius: '100px' }}
                >
                    <h2 className="text-2xl font-bold mb-3">Hello, Friend!</h2>
                    <p className="text-[12px] mb-6 text-orange-50 font-medium leading-relaxed px-2">
                        Enter your personal details and start journey with us
                    </p>
                    <Link
                        to="/register"
                        className="px-10 py-2.5 rounded-full border border-white text-white font-bold tracking-widest text-[11px] uppercase hover:bg-white hover:text-orange-600 transition-all"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
