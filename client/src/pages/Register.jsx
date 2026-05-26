import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', phone: '' });
    const { register, googleLogin, user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) { navigate('/'); return; }
        /* global google */
        if (window.google && !document.getElementById('signUpDiv').hasChildNodes()) {
            google.accounts.id.initialize({
                client_id: "554720621201-d8brfn201od31ugsv2ngujtdfeg2uthr.apps.googleusercontent.com",
                callback: handleCredentialResponse,
            });
            google.accounts.id.renderButton(
                document.getElementById('signUpDiv'),
                { theme: 'outline', size: 'large', type: 'standard', text: 'signup_with', width: '280' }
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
            await register(formData.username, formData.email, formData.password);
            toast.success('Account created! Welcome to CoreX.');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="h-screen pt-16 flex items-center justify-center bg-[#f0f2f5] px-4 overflow-hidden">
            <div className="bg-white rounded-[30px] shadow-2xl flex max-w-[850px] w-full relative overflow-hidden">
                
                {/* Left Side - Colored Panel (Matches the image) */}
                <div 
                    className="hidden md:flex w-2/5 bg-gradient-to-br from-orange-400 to-orange-600 text-white flex-col items-center justify-center px-8 text-center relative z-20 shadow-[10px_0_30px_rgba(0,0,0,0.1)]"
                    style={{ borderTopRightRadius: '120px', borderBottomRightRadius: '120px' }}
                >
                    <h2 className="text-[28px] font-bold mb-3">Welcome Back!</h2>
                    <p className="text-[13px] mb-6 text-orange-50 font-medium leading-relaxed px-2">
                        To keep connected with us please login with your personal info
                    </p>
                    <Link 
                        to="/login" 
                        className="px-12 py-3 rounded-full border border-white text-white font-bold tracking-widest text-[12px] uppercase hover:bg-white hover:text-orange-600 transition-all"
                    >
                        Sign In
                    </Link>
                </div>

                {/* Right Side - Form (Register) */}
                <div className="w-full md:w-3/5 p-6 md:p-10 flex flex-col items-center justify-center bg-white z-10">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 tracking-tight">Create Account</h2>
                    
                    <form className="w-full max-w-sm flex flex-col gap-3.5" onSubmit={handleSubmit}>
                        <input 
                            type="text" required placeholder="Name"
                            className="bg-gray-100 px-4 py-3.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-200 transition-all border-none"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                        />
                        <input 
                            type="email" required placeholder="Email"
                            className="bg-gray-100 px-4 py-3.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-200 transition-all border-none"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                        <input 
                            type="password" required placeholder="Password"
                            className="bg-gray-100 px-4 py-3.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-200 transition-all border-none"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                        <input 
                            type="tel" placeholder="Phone (optional)"
                            className="bg-gray-100 px-4 py-3.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-200 transition-all border-none"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />

                        <button 
                            type="submit" disabled={loading}
                            className="bg-orange-500 text-white rounded-full py-3.5 mt-4 font-bold tracking-widest text-[13px] uppercase hover:bg-orange-600 transition-all shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] mx-auto px-14 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing up...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 w-full max-w-sm my-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 uppercase tracking-wider">or continue with</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Google Auth */}
                    <div className="flex justify-center w-full max-w-sm mb-4">
                        <div id="signUpDiv" />
                    </div>

                    {/* Mobile only toggle link */}
                    <div className="md:hidden mt-8">
                        <span className="text-sm text-gray-500">Already have an account? </span>
                        <Link to="/login" className="text-sm text-orange-500 font-bold hover:underline">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
