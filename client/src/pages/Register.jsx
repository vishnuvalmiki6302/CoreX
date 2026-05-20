import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', phone: '' });
    const { register, googleLogin, user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

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
            await register(formData.username, formData.email, formData.password);
            toast.success('Account created! Welcome to CoreX.');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    const strength = formData.password.length === 0 ? 0
        : formData.password.length < 6 ? 1
        : formData.password.length < 10 ? 2
        : 3;

    const strengthLabel = ['', 'Weak', 'Fair', 'Strong'];
    const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-green-500'];

    const Field = ({ icon: Icon, label, type, placeholder, name, required, hint }) => (
        <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {label} {hint && <span className="text-gray-400 font-normal">{hint}</span>}
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all bg-white">
                <Icon size={15} className="ml-3.5 text-gray-400 shrink-0" />
                {name === 'password' ? (
                    <>
                        <input
                            type={showPass ? 'text' : 'password'} required={required} placeholder={placeholder}
                            className="flex-1 px-3 py-3 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none"
                            value={formData[name]}
                            onChange={e => setFormData({ ...formData, [name]: e.target.value })}
                        />
                        <button type="button" onClick={() => setShowPass(s => !s)} className="mr-3 text-gray-400 hover:text-gray-600 transition-colors">
                            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </>
                ) : (
                    <input
                        type={type || 'text'} required={required} placeholder={placeholder}
                        className="flex-1 px-3 py-3 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none"
                        value={formData[name]}
                        onChange={e => setFormData({ ...formData, [name]: e.target.value })}
                    />
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex">
            {/* Left – photo panel */}
            <div className="hidden lg:block lg:w-5/12 relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop"
                    alt="Gym"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Quote bottom-left */}
                <div className="absolute bottom-10 left-10">
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">CoreX Fitness</p>
                    <h2 className="text-white text-3xl font-bold leading-snug">
                        Begin your<br />best chapter.
                    </h2>
                </div>
            </div>

            {/* Right – form */}
            <div className="flex-1 flex items-center justify-center bg-white px-8 py-16 overflow-y-auto">
                <div className="w-full max-w-[400px]">

                    {/* Brand */}
                    <div className="mb-10">
                        <span className="text-orange-500 font-black text-2xl tracking-tight">CoreX</span>
                        <p className="text-gray-400 text-sm mt-0.5 font-medium">Fitness Intelligence Platform</p>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
                    <p className="text-sm text-gray-500 mb-8">Takes less than a minute. No credit card required.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Field icon={User} label="Name" placeholder="John Doe" name="username" required />
                            <Field icon={Phone} label="Phone" hint="(optional)" type="tel" placeholder="+91 XXXXX" name="phone" />
                        </div>

                        <Field icon={Mail} label="Email" type="email" placeholder="you@email.com" name="email" required />

                        <div>
                            <Field icon={Lock} label="Password" placeholder="Min 8 characters" name="password" required />
                            {formData.password.length > 0 && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex gap-1 flex-1">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor[strength] : 'bg-gray-200'}`} />
                                        ))}
                                    </div>
                                    <span className={`text-[11px] font-semibold ${strength === 1 ? 'text-red-400' : strength === 2 ? 'text-amber-500' : 'text-green-600'}`}>
                                        {strengthLabel[strength]}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full py-3 mt-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold tracking-wide transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                        >
                            {loading ? 'Creating account…' : 'Create account'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400">or</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Google */}
                    <div id="signUpDiv" className="w-full flex justify-center" />

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-orange-500 font-semibold hover:underline">Sign in</Link>
                    </p>

                    <p className="mt-5 text-center text-xs text-gray-400 leading-relaxed">
                        By signing up you agree to our{' '}
                        <span className="underline cursor-pointer hover:text-gray-600 transition-colors">Terms</span> and{' '}
                        <span className="underline cursor-pointer hover:text-gray-600 transition-colors">Privacy Policy</span>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
