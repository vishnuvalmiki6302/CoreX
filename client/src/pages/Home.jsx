import Hero from '../components/Hero';
import Plans from '../components/Plans';
import Trainers from '../components/Trainers';
import Contact from '../components/Contact';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

const Home = () => {
    const { user } = useAuth();

    return (
        <>
            <Hero />
            
            {/* Promotional Lock Section for Guests */}
            {!user && (
                <section className="py-12 bg-gym-accent/10 border-y border-gym-accent/20">
                    <div className="container mx-auto px-4 max-w-4xl text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gym-accent/20 text-gym-accent mb-4">
                            <Lock size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Members Only Features</h2>
                        <p className="text-sm text-zinc-300 mb-6 max-w-2xl mx-auto">
                            Join TitanEdge today to unlock our full suite of tools! Gym members get exclusive access to our 
                            <span className="text-gym-accent font-semibold"> Exercise Library</span>, 
                            <span className="text-gym-accent font-semibold"> Custom Diet Plans</span>, 
                            <span className="text-gym-accent font-semibold"> Live Class Booking</span>, and our 
                            <span className="text-gym-accent font-semibold"> Premium Gear Store</span>.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link to="/register" className="btn-primary">
                                Join The Gym
                            </Link>
                            <a href="#plans" className="btn-outline">
                                View Offers
                            </a>
                        </div>
                    </div>
                </section>
            )}

            <Plans />
            <Trainers />
            <Contact />
        </>
    );
};

export default Home;
