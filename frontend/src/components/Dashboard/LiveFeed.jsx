import { Camera, Warning } from '@phosphor-icons/react'

export default function LiveFeed() {
    return (
        <div className="glass-panel" style={{
            height: '100%',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 16,
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Simulated Camera Feed Background (Gradient for now) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)',
                zIndex: 0
            }} />

            {/* Simulated Bounding Box */}
            <div style={{
                position: 'absolute',
                top: '30%',
                left: '40%',
                width: '200px',
                height: '200px',
                border: '2px solid var(--color-primary)',
                borderRadius: 8,
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
                zIndex: 1
            }}>
                <div style={{
                    position: 'absolute',
                    top: -25,
                    left: 0,
                    background: 'var(--color-primary)',
                    color: 'black',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                }}>
                    Plastic Bottle (98%)
                </div>
            </div>

            <div style={{ zIndex: 2, textAlign: 'center' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(0,0,0,0.6)',
                    padding: '8px 16px',
                    borderRadius: 20,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="status-live" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>LIVE FEED</span>
                </div>
            </div>

            <div style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                zIndex: 2,
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                fontFamily: 'monospace'
            }}>
                CAM_01 • 1080p • 30FPS
            </div>
        </div>
    )
}
