import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios';

const QUICK_ACTIONS = [
    { icon: '📊', label: 'Analytics Dashboard', href: '/analytics', category: 'Navigate' },
    { icon: '👥', label: 'Admin Dashboard', href: '/admin', category: 'Navigate' },
    { icon: '🏋️', label: 'Trainer Dashboard', href: '/trainer', category: 'Navigate' },
    { icon: '📷', label: 'QR Kiosk Mode', href: '/kiosk', category: 'Navigate' },
    { icon: '🤖', label: 'AI Fitness Assessment', href: '/ai/assessment', category: 'Navigate' },
    { icon: '🥗', label: 'AI Diet Planner', href: '/ai/diet', category: 'Navigate' },
    { icon: '💪', label: 'Health Tracker', href: '/health', category: 'Navigate' },
    { icon: '📅', label: 'Scheduling Calendar', href: '/schedule', category: 'Navigate' },
    { icon: '🎯', label: 'Lead Manager', href: '/leads', category: 'Navigate' },
    { icon: '👤', label: 'My Profile', href: '/profile', category: 'Navigate' },
];

export default function CommandPalette({ onClose }) {
    const [query, setQuery] = useState('');
    const [members, setMembers] = useState([]);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef(null);
    const debounceRef = useRef(null);

    const filteredActions = QUICK_ACTIONS.filter(a =>
        a.label.toLowerCase().includes(query.toLowerCase())
    );

    const searchMembers = useCallback(async (q) => {
        if (!q || q.length < 2) { setMembers([]); return; }
        setIsSearching(true);
        try {
            const res = await api.get(`/users?search=${encodeURIComponent(q)}&role=member&limit=5`);
            setMembers(res.data?.users || res.data || []);
        } catch (_) {
            setMembers([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => searchMembers(query), 300);
        setSelectedIdx(0);
    }, [query, searchMembers]);

    const allItems = [
        ...members.map(m => ({
            icon: '👤', label: m.username,
            sub: `${m.memberId || ''} · ${m.email}`,
            href: `/admin`, category: 'Member',
            badge: m.status,
        })),
        ...filteredActions,
    ];

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') { onClose(); return; }
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, allItems.length - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
        if (e.key === 'Enter' && allItems[selectedIdx]) {
            window.location.href = allItems[selectedIdx].href;
        }
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                paddingTop: '120px',
            }}>
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: '600px', maxWidth: '95vw',
                    background: 'rgba(15,15,25,0.98)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 50px 100px rgba(0,0,0,0.8)',
                    fontFamily: "'Inter', sans-serif",
                }}>

                {/* Search Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <span style={{ fontSize: '18px', opacity: 0.5 }}>{isSearching ? '⟳' : '🔍'}</span>
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search members, navigate pages..."
                        style={{
                            flex: 1, background: 'none', border: 'none', outline: 'none',
                            color: '#fff', fontSize: '16px', fontFamily: 'inherit',
                        }} />
                    <kbd onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)',
                        padding: '3px 8px', borderRadius: '4px', fontSize: '12px',
                        cursor: 'pointer', fontFamily: 'monospace',
                    }}>ESC</kbd>
                </div>

                {/* Results */}
                <div style={{ maxHeight: '400px', overflow: 'auto', padding: '8px' }}>
                    {allItems.length === 0 && query ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
                            No results for "{query}"
                        </div>
                    ) : allItems.map((item, idx) => (
                        <a
                            key={idx}
                            href={item.href}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '10px 14px', borderRadius: '10px',
                                background: idx === selectedIdx ? 'rgba(249,115,22,0.12)' : 'transparent',
                                border: `1px solid ${idx === selectedIdx ? 'rgba(249,115,22,0.2)' : 'transparent'}`,
                                textDecoration: 'none', color: '#fff', cursor: 'pointer',
                                transition: 'all 0.1s',
                                marginBottom: '2px',
                            }}
                            onMouseEnter={() => setSelectedIdx(idx)}>
                            <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{item.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</div>
                                {item.sub && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>{item.sub}</div>}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                {item.badge && (
                                    <span style={{
                                        padding: '1px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: '600',
                                        background: item.badge === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                                        color: item.badge === 'active' ? '#22c55e' : '#ef4444',
                                    }}>{item.badge}</span>
                                )}
                                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '4px' }}>{item.category}</span>
                            </div>
                        </a>
                    ))}

                    {!query && (
                        <div style={{ padding: '8px 14px 4px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                            Quick Navigation
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                    <span>↑↓ navigate</span><span>↵ select</span><span>ESC close</span>
                </div>
            </div>
        </div>
    );
}
