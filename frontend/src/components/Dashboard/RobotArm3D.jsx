import { memo, useState, useEffect, Suspense, lazy } from 'react'

// Lazy load Spline for better performance
const Spline = lazy(() => import('@splinetool/react-spline'))

/**
 * Premium 3D Robot Arm with Spline
 * Includes loading animation and premium styling
 */
const RobotArm3D = memo(() => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [shouldMount, setShouldMount] = useState(false)

    // Delay mounting the heavy 3D model to prevent initial lag
    useEffect(() => {
        const timer = setTimeout(() => {
            setShouldMount(true)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="glass-panel" style={{
            width: '100%',
            height: '500px',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
            {/* Header */}
            <div style={{
                position: 'absolute',
                top: 20,
                left: 20,
                zIndex: 10,
                pointerEvents: 'none'
            }}>
                <h3 style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>6DOF Arm Visualization</h3>
                <p style={{ color: 'var(--color-primary-glow)', fontSize: '0.9rem' }}>● Online • Calibrated</p>
            </div>

            {/* Premium Loading Animation */}
            {(!shouldMount || !isLoaded) && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(0,0,0,0.3))',
                    zIndex: 5
                }}>
                    {/* Animated Robot Arm Loader */}
                    <div style={{ position: 'relative', width: 120, height: 120 }}>
                        {/* Outer ring */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            border: '3px solid rgba(16, 185, 129, 0.1)',
                            borderTopColor: 'var(--color-primary)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        {/* Inner ring */}
                        <div style={{
                            position: 'absolute',
                            inset: 15,
                            border: '3px solid rgba(16, 185, 129, 0.1)',
                            borderBottomColor: 'var(--color-primary-glow)',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite reverse'
                        }} />
                        {/* Center dot */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 20,
                            height: 20,
                            background: 'var(--color-primary)',
                            borderRadius: '50%',
                            boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
                            animation: 'pulse 1.5s ease-in-out infinite'
                        }} />
                    </div>

                    {/* Loading text */}
                    <p style={{
                        marginTop: 24,
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem',
                        letterSpacing: 2
                    }}>
                        {shouldMount ? 'LOADING 3D MODEL' : 'INITIALIZING'}
                    </p>

                    {/* Progress bar */}
                    <div style={{
                        width: 200,
                        height: 4,
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: 2,
                        marginTop: 12,
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-glow))',
                            animation: 'loadingBar 2s ease-in-out infinite'
                        }} />
                    </div>
                </div>
            )}

            {/* Spline 3D Scene */}
            {shouldMount && (
                <Suspense fallback={null}>
                    <Spline
                        scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
                        onLoad={() => setIsLoaded(true)}
                        style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}
                    />
                </Suspense>
            )}

            {/* Status Indicators */}
            <div style={{
                position: 'absolute',
                bottom: 20,
                right: 20,
                zIndex: 10,
                display: 'flex',
                gap: 8
            }}>
                <div className="glass-card" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                    Servo A: 45°
                </div>
                <div className="glass-card" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                    Servo B: 12°
                </div>
                <div className="glass-card" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                    Grip: OPEN
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.7; }
                }
                @keyframes loadingBar {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    )
})

export default RobotArm3D
