import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data?.notifications || res.data || []);
        } catch (_) {} finally { setLoading(false); }
    };

    useEffect(() => {
        if (user) fetchNotifications();
    }, [user]);

    useEffect(() => {
        const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (_) {}
    };

    const typeColors = {
        membership_expiry: '#f59e0b', payment_due: '#ef4444',
        birthday: '#ec4899', ai_risk: '#f97316',
        trainer_message: '#3b82f6', success: '#22c55e',
        warning: '#f59e0b', system: 'rgba(255,255,255,0.5)',
    };

    const typeIcons = {
        membership_expiry: '⏰', payment_due: '💰', birthday: '🎂',
        ai_risk: '⚠️', trainer_message: '💬', success: '✅',
        warning: '⚠️', system: '🔔', info: 'ℹ️',
    };

    if (!user) return null;

    return (
        <div style={{ position: 'relative' }} ref={dropRef}>
            <button
                onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
                style={{
                    position: 'relative', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                    padding: '8px 10px', cursor: 'pointer', color: '#fff',
                    fontSize: '18px', lineHeight: 1,
                    transition: 'all 0.2s',
                }}>
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '-4px', right: '-4px',
                        background: 'linear-gradient(135deg,#f97316,#ef4444)',
                        color: '#fff', fontSize: '10px', fontWeight: '700',
                        borderRadius: '50%', width: '18px', height: '18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid #070710',
                        animation: 'pulse 2s infinite',
                    }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: '360px', background: 'rgba(10,10,20,0.98)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px', overflow: 'hidden',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.7)',
                    zIndex: 1000, fontFamily: "'Inter', sans-serif",
                }}>
                    {/* Header */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>Notifications {unreadCount > 0 && <span style={{ color: '#f97316' }}>({unreadCount})</span>}</span>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div style={{ maxHeight: '380px', overflow: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔔</div>
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>No notifications yet</div>
                            </div>
                        ) : notifications.map(n => (
                            <div key={n._id} style={{
                                padding: '12px 16px',
                                background: n.isRead ? 'transparent' : 'rgba(249,115,22,0.04)',
                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                display: 'flex', gap: '10px', alignItems: 'flex-start',
                            }}>
                                <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>{typeIcons[n.type] || '🔔'}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: '#fff', fontSize: '13px', fontWeight: n.isRead ? '400' : '600', lineHeight: '1.4' }}>
                                        {n.title || 'Notification'}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '2px', lineHeight: '1.4' }}>{n.message}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginTop: '4px' }}>
                                        {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                                    </div>
                                </div>
                                {!n.isRead && (
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: typeColors[n.type] || '#f97316', flexShrink: 0, marginTop: '4px' }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
