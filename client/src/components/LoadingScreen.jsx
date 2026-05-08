import { motion } from 'framer-motion';
import Logo from './Logo';

const LoadingScreen = ({ message = "Loading..." }) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center"
        >
            <div className="relative flex flex-col items-center">
                {/* Logo with Snappy Pulse */}
                <motion.div
                    animate={{
                        scale: [1, 1.02, 1],
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="mb-6"
                >
                    <Logo className="scale-125" />
                </motion.div>

                {/* Minimalist Progress Line */}
                <div className="w-32 h-[1px] bg-gray-100 rounded-full overflow-hidden relative">
                    <motion.div
                        className="absolute inset-0 bg-orange-500"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>
                
                <p className="mt-4 text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em]">
                    {message}
                </p>
            </div>
        </motion.div>
    );
};

export default LoadingScreen;
