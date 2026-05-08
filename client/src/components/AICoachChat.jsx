import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

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
        } finally { setLoading(false); }
    };

    return (
        <>
            <button onClick={() => setOpen(o => !o)} style={{
                position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#f97316,#ef4444)',
                border: 'none', cursor: 'pointer', fontSize: '24px',
                boxShadow: '0 8px 32px rgba(249,115,22,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{open ? '✕' : '🤖'}</button>

            {open && (
                <div style={{
                    position: 'fixed', bottom: '92px', right: '24px', zIndex: 999,
                    width: '360px', height: '520px',
                    background: 'rgba(10,10,20,0.98)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px', display: 'flex', flexDirection: 'column',
                    overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
                    fontFamily: "'Inter',sans-serif",
                }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '20px' }}>🤖</span>
                            <div>
                                <div style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>CoreX Coach</div>
                                <div style={{ fontSize: '11px', color: '#22c55e' }}>● Online · Gemini AI</div>
                            </div>
                        </div>
                        <button onClick={() => { setMessages([]); localStorage.removeItem('corex-chat'); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '12px' }}>Clear</button>
                    </div>

                    <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
                        {messages.length === 0 && QUICK_QUESTIONS.map(q => (
                            <button key={q} onClick={() => sendMessage(q)}
                                style={{ display: 'block', width: '100%', textAlign: 'left', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 12px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '12px', marginBottom: '6px', fontFamily: 'inherit' }}>
                                {q}
                            </button>
                        ))}
                        {messages.map((m, i) => (
                            <div key={i} style={{ marginBottom: '10px', display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '85%', padding: '10px 14px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                    background: m.role === 'user' ? 'linear-gradient(135deg,#f97316,#ef4444)' : 'rgba(255,255,255,0.07)',
                                    color: '#fff', fontSize: '13px', lineHeight: '1.5',
                                }}>{m.content}</div>
                            </div>
                        ))}
                        {loading && <div style={{ display: 'flex', gap: '4px', padding: '8px' }}>{[0,1,2].map(i => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f97316', animation: `bounce 1s infinite ${i*0.2}s` }} />)}</div>}
                        <div ref={bottomRef} />
                    </div>

                    <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '8px' }}>
                        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask CoreX Coach..."
                            style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }} />
                        <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                            style={{ background: 'linear-gradient(135deg,#f97316,#ef4444)', border: 'none', borderRadius: '10px', padding: '10px 14px', color: '#fff', cursor: 'pointer', fontSize: '18px' }}>↑</button>
                    </div>
                </div>
            )}
            <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
        </>
    );
}
