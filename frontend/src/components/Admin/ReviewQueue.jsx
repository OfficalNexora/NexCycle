
import React, { useState, useEffect } from 'react';
import { Eye, Check, X } from '@phosphor-icons/react';
import { API_BASE } from '../../services/authService';

export default function ReviewQueue() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Reviews
    useEffect(() => {
        fetch(`${API_BASE}/admin/reviews`)
            .then(res => res.json())
            .then(data => {
                // Filter for pending only
                setItems(data.filter(i => i.status === 'pending_review'));
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    const handleReview = async (item, newLabel) => {
        try {
            await fetch(`${API_BASE}/admin/reviews/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ corrected_label: newLabel })
            });
            // Remove from list
            setItems(items.filter(i => i.id !== item.id));
        } catch (err) {
            alert('Error updating review');
        }
    };

    if (loading) return <div style={{ padding: 40, color: 'white' }}>Loading Queue...</div>;

    return (
        <div style={{ padding: 30, color: 'white' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Eye size={32} color="#facc15" />
                Classification Review Queue
            </h2>

            {items.length === 0 && (
                <div style={{ textAlign: 'center', padding: 50, color: 'var(--text-dim)' }}>
                    All caught up! No items to review.
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {items.map(item => (
                    <div key={item.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {/* Image Placeholder - In real app use http://localhost:8000/${item.image_path} if path is relative */}
                        <div style={{ height: 180, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {/* Note: In database.py we see filtered paths, assume backend serves /media */}
                            <img
                                src={`${API_BASE}/${item.image_path || 'placeholder.jpg'}`}
                                alt="Trash"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Image' }}
                            />
                        </div>

                        <div style={{ padding: 15 }}>
                            <div style={{ marginBottom: 10 }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>AI Prediction:</span>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                    {item.detected_label} <span style={{ fontSize: '0.8rem' }}>({Math.round(item.confidence * 100)}%)</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <button
                                    onClick={() => handleReview(item, item.detected_label)}
                                    style={{ background: 'rgba(0,255,0,0.2)', border: 'none', color: '#4ade80', padding: 10, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                                >
                                    <Check weight="bold" /> Confirm
                                </button>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <button
                                        onClick={() => handleReview(item, 'plastic')}
                                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: 8, borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}
                                    >
                                        Set Plastic
                                    </button>
                                    <button
                                        onClick={() => handleReview(item, 'paper')}
                                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: 8, borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}
                                    >
                                        Set Paper
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
