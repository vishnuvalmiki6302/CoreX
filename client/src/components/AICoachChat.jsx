import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Bot, Sparkles, Send, X, RotateCcw } from 'lucide-react';

const QUICK_QUESTIONS = [
    'Best exercises for lower back pain?',
    'How much protein do I need daily?',
    'Foods to eat post-workout?',
    'Beginner workout for 3 days/week?',
];

export default function AICoachChat() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState(() => {
        try { return JSON.parse(localStorage.getItem('corex-chat') || '[]'); } catch { return []; }
    });
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('corex-chat', JSON.stringify(messages.slice(-20)));
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, open]);

    if (!user) return null;

    const sendMessage = async (text) => {
        const msg = text || input.trim();
        if (!msg || loading) return;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: msg }]);
        setLoading(true);
        try {
            const res = await api.post('/ai/chat', { message: msg });
            setMessages(prev => [...prev, { role: 'ai', content: res.data.response }]);
        } catch {
            setMessages(prev => [...prev, { role: 'ai', content: '⚠️ Error: Check GEMINI_API_KEY in server .env' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button with pulsing background glow waves */}
            <div className="fixed bottom-6 right-6 z-[1000] flex items-center justify-center">
                {/* Pulsing Backlight */}
                {!open && (
                    <>
                        <div className="absolute inset-0 w-16 h-16 rounded-full bg-orange-500/20 blur-md animate-pulse duration-1000" />
                        <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-orange-500/40 animate-ping opacity-75" style={{ animationDuration: '3s' }} />
                        <div className="absolute inset-0 w-16 h-16 rounded-full border border-orange-500/20 animate-ping opacity-50" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }} />
                    </>
                )}

                {/* Primary Button */}
                <button
                    onClick={() => setOpen(o => !o)}
                    className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                        open
                            ? 'bg-gray-900 text-white hover:bg-gray-800'
                            : 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-orange-500/30'
                    }`}
                >
                    {open ? (
                        <X size={20} className="transition-transform duration-300 rotate-0 hover:rotate-90" />
                    ) : (
                        <div className="relative flex items-center justify-center">
                            <Bot size={24} className="animate-bounce" style={{ animationDuration: '2.5s' }} />
                            <Sparkles size={10} className="absolute -top-1.5 -right-1.5 text-amber-200 animate-pulse" />
                        </div>
                    )}

                    {/* Blinking Indicator Dot */}
                    {!open && (
                        <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white shadow-sm"></span>
                        </span>
                    )}
                </button>
            </div>

            {/* Chat Box Panel - Styled beautifully in Gray/White/Orange Light Theme */}
            {open && (
                <div className="fixed bottom-24 right-6 z-[999] w-[380px] h-[580px] bg-white/95 border border-gray-200 rounded-3xl flex flex-col overflow-hidden shadow-2xl shadow-gray-300/80 backdrop-blur-md animate-fade-in duration-300">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 relative">
                                <Bot size={20} />
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
                            </div>
                            <div>
                                <div className="text-gray-900 font-extrabold text-sm tracking-tight uppercase flex items-center gap-1.5">
                                    CoreX AI <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 font-bold normal-case">Coach</span>
                                </div>
                                <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => { setMessages([]); localStorage.removeItem('corex-chat'); }}
                            className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                            title="Reset Chat"
                        >
                            <RotateCcw size={14} />
                        </button>
                    </div>

                    {/* Messages & Quick Questions */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
                        {messages.length === 0 && (
                            <div className="space-y-3 py-4">
                                <div className="text-center mb-6">
                                    <div className="inline-flex p-3 rounded-full bg-orange-50 text-orange-500 mb-2">
                                        <Sparkles size={20} />
                                    </div>
                                    <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider">Tactical Assistance</h4>
                                    <p className="text-[11px] text-gray-400 mt-1 max-w-[240px] mx-auto leading-relaxed">Ask any nutrition, workout pacing, or supplement queries.</p>
                                </div>
                                {QUICK_QUESTIONS.map(q => (
                                    <button
                                        key={q}
                                        onClick={() => sendMessage(q)}
                                        className="w-full text-left bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-600 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50/30 transition-all shadow-sm"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}

                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] px-4 py-3.5 rounded-2xl text-xs leading-relaxed font-semibold shadow-sm ${
                                    m.role === 'user'
                                        ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white rounded-br-none shadow-orange-500/10'
                                        : 'bg-gray-100 border border-gray-200/50 text-gray-800 rounded-bl-none'
                                }`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-1.5 p-3 bg-gray-50 border border-gray-100 rounded-2xl w-20 items-center justify-center">
                                {[0, 1, 2].map(i => (
                                    <div
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce"
                                        style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
                                    />
                                ))}
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Footer Input */}
                    <div className="p-4 border-t border-gray-100 bg-white flex gap-2.5">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a query..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-xs font-bold text-gray-800 outline-none focus:bg-white focus:border-orange-500 transition-all placeholder-gray-400"
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white w-11 h-11 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex-shrink-0"
                        >
                            <Send size={15} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
