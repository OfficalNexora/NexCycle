import { useState } from 'react'
import { Check, X, Question, Recycle, Article } from '@phosphor-icons/react'

export default function UnsureImageGrid() {
    const [items, setItems] = useState([
        { id: 1, img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=300&q=80', aiGuess: 'Plastic', confidence: 45 },
        { id: 2, img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=300&q=80', aiGuess: 'Paper', confidence: 38 },
        { id: 3, img: 'https://images.unsplash.com/photo-1605600659453-293cc457ffba?auto=format&fit=crop&w=300&q=80', aiGuess: 'Glass', confidence: 52 },
    ])

    const [hoveredItem, setHoveredItem] = useState(null)
    const [processingId, setProcessingId] = useState(null)

    const categories = [
        { id: 'plastic', label: 'Plastic', icon: <Recycle size={18} weight="bold" />, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' },
        { id: 'paper', label: 'Paper', icon: <Article size={18} weight="bold" />, color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
    ]

    const handleClassify = async (itemId, category) => {
        setProcessingId(itemId)
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 500))
        setItems(prev => prev.filter(item => item.id !== itemId))
        setProcessingId(null)
    }

    const handleReject = async (itemId) => {
        setProcessingId(itemId)
        await new Promise(resolve => setTimeout(resolve, 300))
        setItems(prev => prev.filter(item => item.id !== itemId))
        setProcessingId(null)
    }

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 32,
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02))',
                borderRadius: 16,
                border: '1px solid rgba(16, 185, 129, 0.1)'
            }}>
                <div>
                    <h2 style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Question size={28} weight="fill" style={{ color: 'var(--status-warning)' }} />
                        Review Queue
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        AI couldn't confidently classify these items. Please assign the correct category.
                    </p>
                </div>
                <div style={{
                    padding: '12px 24px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: 12,
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--status-warning)' }}>{items.length}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Pending</div>
                </div>
            </div>

            {/* Empty State */}
            {items.length === 0 ? (
                <div className="glass-panel" style={{
                    padding: 80,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), transparent)'
                }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}>
                        <Check size={40} weight="bold" color="var(--color-primary)" />
                    </div>
                    <h3 style={{ marginBottom: 8, fontSize: '1.5rem' }}>All Caught Up!</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>No items require manual review at this time.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                    {items.map(item => (
                        <div
                            key={item.id}
                            className="glass-card"
                            style={{
                                padding: 0,
                                overflow: 'hidden',
                                opacity: processingId === item.id ? 0.5 : 1,
                                transform: processingId === item.id ? 'scale(0.98)' : (hoveredItem === item.id ? 'translateY(-4px)' : 'translateY(0)'),
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: hoveredItem === item.id ? '0 20px 40px rgba(0,0,0,0.3)' : undefined
                            }}
                            onMouseEnter={() => setHoveredItem(item.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            {/* Image Section */}
                            <div style={{ height: 220, overflow: 'hidden', position: 'relative' }}>
                                <img
                                    src={item.img}
                                    alt="Unsure item"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transition: 'transform 0.5s ease',
                                        transform: hoveredItem === item.id ? 'scale(1.05)' : 'scale(1)'
                                    }}
                                />

                                {/* Gradient Overlay */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: 100,
                                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                                    pointerEvents: 'none'
                                }} />

                                {/* AI Guess Badge */}
                                <div style={{
                                    position: 'absolute',
                                    top: 12,
                                    left: 12,
                                    background: 'rgba(0,0,0,0.8)',
                                    padding: '8px 14px',
                                    borderRadius: 10,
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    backdropFilter: 'blur(8px)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <Question size={16} weight="fill" color="var(--status-warning)" />
                                    <span style={{ color: 'var(--text-muted)' }}>AI thinks:</span>
                                    <span style={{ fontWeight: 600 }}>{item.aiGuess}</span>
                                </div>

                                {/* Confidence Indicator */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 12,
                                    left: 12,
                                    right: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10
                                }}>
                                    <div style={{
                                        flex: 1,
                                        height: 4,
                                        background: 'rgba(255,255,255,0.2)',
                                        borderRadius: 2,
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${item.confidence}%`,
                                            height: '100%',
                                            background: item.confidence < 40 ? 'var(--status-error)' : 'var(--status-warning)',
                                            borderRadius: 2,
                                            transition: 'width 0.5s ease'
                                        }} />
                                    </div>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        color: item.confidence < 40 ? 'var(--status-error)' : 'var(--status-warning)',
                                        minWidth: 40
                                    }}>
                                        {item.confidence}%
                                    </span>
                                </div>

                                {/* Reject Button */}
                                <button
                                    onClick={() => handleReject(item.id)}
                                    className="btn-close"
                                    aria-label="Discard"
                                    style={{
                                        position: 'absolute',
                                        top: 12,
                                        right: 12,
                                        opacity: hoveredItem === item.id ? 1 : 0.7,
                                        transition: 'opacity 0.2s ease'
                                    }}
                                    disabled={processingId === item.id}
                                >
                                    <X size={16} weight="bold" />
                                </button>
                            </div>

                            {/* Category Selection */}
                            <div style={{ padding: 20 }}>
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--text-dim)',
                                    marginBottom: 16,
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                    fontWeight: 600
                                }}>
                                    Select Category
                                </p>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleClassify(item.id, cat.id)}
                                            disabled={processingId === item.id}
                                            style={{
                                                padding: '10px 16px',
                                                background: cat.gradient,
                                                border: 'none',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                borderRadius: 10,
                                                cursor: processingId === item.id ? 'not-allowed' : 'pointer',
                                                fontWeight: 600,
                                                fontSize: '0.85rem',
                                                transition: 'all 0.2s ease',
                                                boxShadow: `0 4px 12px ${cat.color}40`,
                                                transform: 'translateY(0)'
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.transform = 'translateY(-2px)'
                                                e.currentTarget.style.boxShadow = `0 8px 20px ${cat.color}50`
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.transform = 'translateY(0)'
                                                e.currentTarget.style.boxShadow = `0 4px 12px ${cat.color}40`
                                            }}
                                        >
                                            {cat.icon}
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
