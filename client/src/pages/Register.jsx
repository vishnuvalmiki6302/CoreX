import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const res = await register(formData.username, formData.email, formData.password);
        setIsLoading(false);
        if (res.success) {
            navigate('/');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20">
            <div className="bg-gym-gray border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Create Account</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gym-text-secondary mb-2">Username</label>
                        <input
                            type="text"
                            className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-xl p-3.5 text-white focus:outline-none focus:border-gym-accent focus:ring-1 focus:ring-gym-accent/50 transition-all duration-300"
                            placeholder="FitMaster"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gym-text-secondary mb-2">Email Address</label>
                        <input
                            type="email"
                            className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-xl p-3.5 text-white focus:outline-none focus:border-gym-accent focus:ring-1 focus:ring-gym-accent/50 transition-all duration-300"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gym-text-secondary mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-xl p-3.5 text-white focus:outline-none focus:border-gym-accent focus:ring-1 focus:ring-gym-accent/50 transition-all duration-300"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-gym-accent to-orange-600 hover:from-orange-600 hover:to-gym-accent text-white font-bold py-3.5 rounded-xl transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gym-accent/20"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Creating Account...
                            </span>
                        ) : 'Get Started'}
                    </button>
                </form>
                <p className="mt-8 text-center text-gym-text-secondary text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-gym-accent hover:text-orange-400 font-medium transition-colors">
                        Sign in
                    </Link>
                </p>
                <div id="signInDiv"></div>
            </div>
        </div>
    );
};

export default Register;
