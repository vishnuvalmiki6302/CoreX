import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Camera, X, CheckCircle2, LogOut, AlertCircle, Scan, ShieldCheck, UserCheck, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';

const STATUS_CONFIG = { 
    checkin: { 
        icon: <UserCheck size={96} strokeWidth={1.5} />, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50', 
        title: 'Check-in Successful',
        subtitle: 'Welcome back to CoreX. Your session is now active.'
    }, 
    checkout: { 
        icon: <LogOut size={96} strokeWidth={1.5} />, 
        color: 'text-orange-600', 
        bg: 'bg-orange-50', 
        title: 'Checkout Recorded',
        subtitle: 'Great workout today. See you at your next session.'
    }, 
    error: { 
        icon: <AlertCircle size={96} strokeWidth={1.5} />, 
        color: 'text-red-600', 
        bg: 'bg-red-50', 
        title: 'Access Denied',
        subtitle: 'Identification failed. Please verify your QR code with reception.'
    } 
};

export default function QRKiosk() {
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const scannerRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        let html5QR;
        if (scanning && containerRef.current) {
            import('html5-qrcode').then(({ Html5Qrcode }) => {
                html5QR = new Html5Qrcode('qr-reader');
                scannerRef.current = html5QR;
                html5QR.start(
                    { facingMode: 'environment' },
                    { fps: 15, qrbox: { width: 300, height: 300 } },
                    (decodedText) => handleScan(decodedText, html5QR),
                    () => {}
                ).catch(err => {
                    toast.error('Camera access denied. Please ensure permissions are granted.');
                    setScanning(false);
                });
            });
        }
        return () => { if (html5QR) html5QR.stop().catch(() => {}); };
    }, [scanning]);

    const handleScan = async (token, scanner) => {
        if (loading) return;
        setLoading(true);
        if (scanner) await scanner.stop().catch(() => {});
        setScanning(false);
        try {
            const res = await api.post('/qr/scan', { token });
            setResult({ ...res.data, type: res.data.action === 'checkin' ? 'checkin' : 'checkout' });
        } catch (err) {
            setResult({ type: 'error', message: err.response?.data?.message || 'Unauthorized Identifier', user: null });
        } finally { setLoading(false); }
        
        // Auto-reset after 5 seconds
        setTimeout(() => { 
            setResult(null); 
            setScanning(false); 
        }, 5000);
    };

    const status = result ? STATUS_CONFIG[result.type] : null;

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center font-sans relative overflow-hidden">
            
            {/* ── TOP NAVIGATION / BRANDING ── */}
            <div className="w-full bg-white border-b border-gray-100 py-6 px-12 flex items-center justify-between z-20 shadow-sm">
                <Logo iconSize={28} className="scale-110" />
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kiosk System Online</span>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">CoreX HQ Reception</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Main Entry Node</p>
                    </div>
                </div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div className="flex-1 w-full flex items-center justify-center p-6 relative">
                
                {/* DECORATIVE BACKGROUND */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-100 rounded-full blur-[160px]" />
                </div>

                <AnimatePresence mode="wait">
                    {result && status ? (
                        <motion.div 
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-12 text-center relative z-10 border border-gray-100"
                        >
                            <motion.div 
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className={`${status.color} mb-10 flex justify-center`}
                            >
                                <div className={`${status.bg} p-8 rounded-full shadow-inner`}>
                                    {status.icon}
                                </div>
                            </motion.div>

                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic mb-4">
                                {status.title}
                            </h2>
                            
                            {result.user ? (
                                <div className="mb-8">
                                    <p className="text-6xl font-black text-gray-900 tracking-tighter leading-none mb-4">{result.user.username}</p>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                                        <ShieldCheck size={16} className="text-orange-500" />
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Member ID: {result.user.memberId || 'CORE-X-001'}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-lg text-gray-500 font-medium mb-8 px-10">{result.message || status.subtitle}</p>
                            )}

                            <div className="pt-10 border-t border-gray-50 flex items-center justify-center gap-8">
                                <div className="flex items-center gap-2">
                                    <Timer size={18} className="text-gray-300" />
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Auto-resetting in 5s</p>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="scanner"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-10 md:p-14 text-center relative z-10 border border-gray-100"
                        >
                            {scanning ? (
                                <div className="space-y-10">
                                    <div className="relative inline-block">
                                        <div id="qr-reader" ref={containerRef} className="w-[300px] h-[300px] md:w-[350px] md:h-[350px] mx-auto rounded-[2.5rem] overflow-hidden border-8 border-gray-50 shadow-inner" />
                                        {/* Scanner Line */}
                                        <div className="absolute inset-0 pointer-events-none rounded-[2.5rem] overflow-hidden border-2 border-orange-500/20">
                                            <div className="w-full h-1 bg-orange-500 absolute animate-[scan_2s_linear_infinite] shadow-[0_0_15px_rgba(255,94,0,0.8)]" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase italic mb-2">Scanning Active</h3>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Align your identification QR within the frame</p>
                                    </div>
                                    <button 
                                        onClick={() => setScanning(false)}
                                        className="w-full py-5 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                                    >
                                        Cancel Scanning
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    <div className="w-32 h-32 bg-orange-50 rounded-[2.5rem] flex items-center justify-center text-orange-500 mx-auto shadow-inner relative group transition-transform hover:scale-105">
                                        <Scan size={56} strokeWidth={1.5} />
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center animate-bounce shadow-lg">
                                            <Camera size={14} />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic mb-3 leading-none">Member Check-in</h2>
                                        <p className="text-sm font-medium text-gray-500 max-w-[280px] mx-auto">Please present your digital member ID to the scanner for instant authorization.</p>
                                    </div>
                                    <button
                                        onClick={() => setScanning(true)}
                                        disabled={loading}
                                        className="w-full bg-gray-900 text-white py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-black/10 hover:bg-orange-600 transition-all flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        <Camera size={20} /> Initialize Scanner
                                    </button>
                                    <div className="pt-8 border-t border-gray-50">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                            <Info size={12} className="text-orange-500" /> Need Help? See Reception
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── FOOTER ── */}
            <div className="w-full py-8 text-center bg-white border-t border-gray-50 relative z-10">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">CoreX Fitness Intelligence · Secure Entry Portal · v2.4.0</p>
            </div>

            <style>{`
                @keyframes scan {
                    0% { top: 0%; }
                    100% { top: 100%; }
                }
            `}</style>
        </div>
    );
}
