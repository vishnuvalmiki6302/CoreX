import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Activity, Flame, ArrowRight, Play, Zap } from "lucide-react";

// Import video assets
// import video1 from "../assets/39475-422765136_medium.mp4";
import video2 from "../assets/148208-793717949_medium.mp4";
import video3 from "../assets/148201-793717934_medium.mp4";
import video1 from "../assets/v1.mp4";





const videos = [video1, video2, video3];

const Hero = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 300], [0, 100]);

    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const videoRefs = useRef([]);

    useEffect(() => {
        const video = videoRefs.current[currentVideoIndex];
        if (!video) return;

        // Reset ready state when index changes
        setIsVideoReady(false);

        // Try to play immediately (browser might cache)
        const playVideo = async () => {
            try {
                // If it's already ready, play
                if (video.readyState >= 3) {
                    await video.play();
                    setIsVideoReady(true);
                } else {
                    // Wait for it
                    video.load(); // Force load
                }
            } catch (err) {
                console.warn("Play interrupted", err);
            }
        };

        playVideo();

        // Pause others
        videos.forEach((_, idx) => {
            if (idx !== currentVideoIndex && videoRefs.current[idx]) {
                try {
                    videoRefs.current[idx].pause();
                    videoRefs.current[idx].currentTime = 0;
                } catch (e) { /* ignore */ }
            }
        });

    }, [currentVideoIndex]);

    const handleVideoEnded = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    };

    const handleCanPlay = (index) => {
        if (index === currentVideoIndex) {
            setIsVideoReady(true);
            videoRefs.current[index]?.play().catch(e => console.log("Auto-play blocked", e));
        }
    };

    return (
        <div className="relative overflow-hidden min-h-screen flex items-center bg-zinc-900">

            {/* Video Background */}
            <div className="absolute inset-0 z-0">
                {videos.map((src, index) => (
                    <video
                        key={index}
                        ref={(el) => (videoRefs.current[index] = el)}
                        src={src}
                        muted
                        playsInline
                        preload="auto"
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentVideoIndex && isVideoReady ? "opacity-100 z-10" : "opacity-0 z-0"
                            }`}
                        onCanPlay={() => handleCanPlay(index)}
                        onEnded={() => {
                            if (index === currentVideoIndex) {
                                handleVideoEnded();
                            }
                        }}
                        onError={(e) => console.error(`Video ${index} Error:`, e)}
                    />
                ))}

                {/* Fallback Image/Gradient while loading */}
                <div className={`absolute inset-0 bg-gym-dark transition-opacity duration-500 ${isVideoReady ? 'opacity-0' : 'opacity-100'} z-0`} />

                {/* Dark Overlay for Readability */}
                <div className="absolute inset-0 bg-black/40 z-20"></div>
                {/* Noise Texture */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-20"></div>
            </div>


            <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 right-0 w-[500px] h-[500px] bg-gym-accent/10 rounded-full blur-[80px] z-0"
            />

            <motion.div
                animate={{ scale: [1, 1.3, 1], x: [0, 100, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gym-gold/5 rounded-full blur-[60px] z-0"
            />

            {/* Content Container */}
            <div className="container ml-30 mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full pt-20">

                {/* Left Side Spacer (Hidden on Mobile) */}
                <div className="hidden lg:block relative mr-80 mb-20">
                    {/* Floating Widget: Calories Burned */}
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-20 right-10 hidden lg:flex items-center gap-3 bg-zinc-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl"
                    >
                        <div className="bg-orange-500/20 p-3 rounded-full">
                            <Flame className="text-orange-500 fill-orange-500" size={24} />
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg">520 kcal</p>
                            <p className="text-xs text-gray-400">Burned today</p>
                        </div>
                    </motion.div>
                </div>


                <div className="lg:col-start-2 flex flex-col justify-center items-start mb-20">


                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6 inline-flex items-center gap-3 p-1 pr-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
                    >
                        <span className="bg-gym-accent/20 text-gym-accent p-1.5 rounded-full ">
                            <Zap size={14} fill="currentColor" />
                        </span>
                        <span className="text-gym-text-secondary text-sm font-medium tracking-wide">
                            #1 Fitness App 2026
                        </span>
                    </motion.div>

                    {/* Heading */}
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[1.1] drop-shadow-lg">
                        SCULPT <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gym-accent via-blue-400 to-indigo-500 animate-gradient-x">
                            YOUR
                        </span>{" "}
                        <br />
                        LEGACY
                    </h1>

                    {/* Description */}
                    <p className="text-xl text-gym-text-secondary max-w-xl border-l-4 border-gym-gold pl-6 mt-6 drop-shadow-md bg-black/20 backdrop-blur-sm rounded-r-lg py-2">
                        Unlock elite potential with AI-driven workout plans and precision
                        nutrition. This isn’t just a gym app; it’s your{" "}
                        <span className="text-white font-bold">digital forge</span>.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-8 w-full sm:w-auto">
                        <Link
                            to="/register"
                            className="group relative px-8 py-4 bg-gym-accent rounded-xl overflow-hidden shadow-2xl shadow-gym-accent/30 font-bold text-lg text-white text-center"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            <span className="flex items-center justify-center gap-2">
                                Start Free Trial <ArrowRight size={20} />
                            </span>
                        </Link>

                        <div className="flex items-center gap-4 px-6 py-4 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md cursor-pointer hover:bg-black/60 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                <Play size={20} className="text-white ml-1" />
                            </div>
                            <span className="text-white font-medium">Watch Demo</span>
                        </div>
                    </div>

                    {/* Stats & Social Proof */}
                    <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-white/10 mt-8 w-full">
                        <div>
                            <p className="text-3xl font-bold text-white drop-shadow-md">50K+</p>
                            <p className="text-sm text-gym-text-secondary drop-shadow-md">Active Users</p>
                        </div>
                        <div className="w-px h-10 bg-white/20 hidden sm:block"></div>
                        <div>
                            <p className="text-3xl font-bold text-white drop-shadow-md">100+</p>
                            <p className="text-sm text-gym-text-secondary drop-shadow-md">Pro Trainers</p>
                        </div>

                        {/* NEW: Avatars Section */}
                        <div className="flex items-center -space-x-3 ml-auto sm:ml-0">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-full h-full object-cover opacity-80" />
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-xs text-white font-bold">
                                +2k
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;