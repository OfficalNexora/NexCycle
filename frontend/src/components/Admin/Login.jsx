import { useState, useEffect } from 'react'
import { Lock, User, Key, UserPlus, SignIn, X, GoogleLogo, Envelope, ArrowRight, CircleNotch } from '@phosphor-icons/react'
import { useGoogleLogin } from '@react-oauth/google'
import { login, register, createSession } from '../../services/authService'

export default function AuthModal({ onLogin, onCancel }) {
    const [mode, setMode] = useState('login') // 'login' | 'register'
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isClosing, setIsClosing] = useState(false)

    // Clear errors when switching modes
    useEffect(() => {
        setError('')
        setSuccess('')
        setUsername('')
        setPassword('')
        setConfirmPassword('')
    }, [mode])

    const googleLogin = useGoogleLogin({
        scope: 'email profile openid',
        onSuccess: async (tokenResponse) => {
            try {
                // Fetch user info from Google (optional, for profile pic)
                const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                }).then(res => res.json());

                const response = await fetch(`/auth/google?token=${tokenResponse.access_token}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    const data = await response.json();

                    // CRITICAL: Persist Session!
                    createSession(data);

                    handleClose(() => {
                        onLogin({
                            username: (data.user.name && data.user.name !== 'Unknown') ? data.user.name : data.user.email,
                            name: data.user.name,
                            email: data.user.email,
                            role: data.user.role,
                            picture: userInfo.picture
                        });
                    });
                } else {
                    const errData = await response.json().catch(() => ({ detail: response.statusText }));
                    console.error('Frontend Google Auth Error:', errData);
                    setError(errData.detail || 'Google authentication failed');
                }
            } catch (err) {
                console.error(err);
                setError('Google authentication error');
            }
        },
        onError: () => setError('Google Login Failed'),
    });

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        const result = await login(username, password)
        setIsLoading(false)

        if (result.success) {
            handleClose(() => onLogin(result.user))
        } else {
            setError(result.error)
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setIsLoading(true)
        const result = await register(username, password)
        setIsLoading(false)

        if (result.success) {
            setSuccess('Account created! Sign in to continue.')
            setTimeout(() => {
                setMode('login')
                setUsername(username)
                setPassword('')
            }, 1500)
        } else {
            setError(result.error)
        }
    }

    const handleClose = (callback) => {
        setIsClosing(true)
        setTimeout(() => {
            if (callback) callback()
            else onCancel()
        }, 300)
    }

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') handleClose()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [])

    // Lock Body Scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])

    return (
        <div className={`auth-overlay ${isClosing ? 'closing' : ''}`} onClick={() => handleClose()}>
            <div
                className={`auth-container ${isClosing ? 'closing' : ''}`}
                onClick={e => e.stopPropagation()}
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
                }}
            >
                {/* Close Button - Using Global Premium Style */}
                <button
                    onClick={() => handleClose()}
                    className="btn-close"
                    style={{ position: 'absolute', top: 24, right: 24, zIndex: 310 }}
                    title="Close"
                >
                    <X size={20} weight="bold" />
                </button>

                {/* Left Side: Visuals */}
                <div className="auth-visual">
                    <div className="visual-interact" />
                    <div className="visual-content">
                        <div className="logo-container">
                            <div className="logo-icon">
                                <div className="logo-inner" />
                            </div>
                            <h3>NexCycle</h3>
                        </div>

                        <div key={mode} className="text-animate">
                            <h2>
                                {mode === 'login'
                                    ? 'Welcome Back!'
                                    : 'Join the Future'}
                            </h2>
                            <p>
                                {mode === 'login'
                                    ? 'Monitor your recycling systems in real-time with AI-powered insights.'
                                    : 'Create an account to start managing your smart recycling infrastructure.'}
                            </p>
                        </div>

                        {/* Dynamic decorative elements */}
                        <div className="floating-shape shape-1" />
                        <div className="floating-shape shape-2" />
                        <div className="floating-shape shape-3" />
                    </div>
                </div>

                {/* Right Side: Form Wrapper */}
                <div className="auth-form-wrapper">
                    <div className="auth-form-bg" />
                    <div className="auth-form-content">
                        <div className="form-header">
                            <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
                            <div className="mode-toggle">
                                <span className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</span>
                                <span className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</span>
                                <div className={`toggle-slider ${mode}`} />
                            </div>
                        </div>

                        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="auth-form">
                            <div className="input-group">
                                <label>Username or Email</label>
                                <div className="input-wrapper">
                                    <User size={20} weight="duotone" className="input-icon" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        required
                                        autoFocus
                                    />
                                    <div className="input-glow" />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <Lock size={20} weight="duotone" className="input-icon" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    /* Removed problematic minLength that might block simple testing */
                                    />
                                    <div className="input-glow" />
                                </div>
                            </div>

                            {mode === 'register' && (
                                <div className="input-group animate-in">
                                    <label>Confirm Password</label>
                                    <div className="input-wrapper">
                                        <Key size={20} weight="duotone" className="input-icon" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                        />
                                        <div className="input-glow" />
                                    </div>
                                </div>
                            )}

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`btn-submit ${isLoading ? 'loading' : ''}`}
                                >
                                    {isLoading ? (
                                        <>
                                            <CircleNotch size={20} className="spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                                            <ArrowRight size={18} weight="bold" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="divider">
                            <span>or continue with</span>
                        </div>

                        <button type="button" onClick={() => googleLogin()} className="btn-google-premium">
                            <GoogleLogo size={20} weight="bold" />
                            <span>Google</span>
                        </button>

                        {/* Feedback Messages */}
                        {error && (
                            <div className="message error animate-in">
                                <div className="dot" /> {error}
                            </div>
                        )}
                        {success && (
                            <div className="message success animate-in">
                                <div className="dot" /> {success}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                /* Overlay & Animation */
                .auth-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 2000;
                    background: rgba(2, 6, 23, 0.8);
                    backdrop-filter: blur(16px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .auth-overlay.closing {
                    animation: fadeOut 0.3s ease-in forwards;
                }

                .auth-container {
                    width: 900px;
                    max-width: 90vw;
                    /* Smooth height transition */
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    min-height: min(540px, 90vh); /* Base height, but never overflow viewport */
                    background: radial-gradient(circle at top left, #022c22, #020617 60%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    box-shadow: 
                        0 25px 50px -12px rgba(0, 0, 0, 0.5),
                        0 0 0 1px rgba(255, 255, 255, 0.05);
                    display: flex;
                    overflow: hidden;
                    max-height: 90vh; /* Always cap height */
                    overflow: hidden;
                    position: relative;
                    /* Ensure will-change optimization includes height */
                    will-change: transform, height, min-height;
                    --mouse-x: 50%;
                    --mouse-y: 50%;
                }
                
                /* Large screen constraint - Removed selective max-height, applied globally above */
                @media (min-height: 800px) {
                    .auth-container {
                         /* Kept for potential future specific tweaks, but max-height is now global */
                    }
                }

                /* Intense Dynamic Border Glow */
                .auth-container::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 24px;
                    padding: 2px;
                    background: radial-gradient(
                        800px circle at var(--mouse-x) var(--mouse-y),
                        rgba(16, 185, 129, 0.8),
                        transparent 40%
                    );
                    /* Fix for corners: Use mask composite with content-box to cut out center */
                    -webkit-mask: 
                        linear-gradient(#fff 0 0) content-box, 
                        linear-gradient(#fff 0 0);
                    mask: 
                        linear-gradient(#fff 0 0) content-box, 
                        linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                    z-index: 300;
                }

                .auth-container.closing {
                    animation: scaleDown 0.3s ease-in forwards;
                }

                /* Left Side: Visuals */
                .auth-visual {
                    flex: 1;
                    /* Transparent background to blend with container */
                    background: transparent;
                    position: relative;
                    padding: 40px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    overflow: hidden;
                }
                
                /* Subtle gradient overlay for the left side only */
                .auth-visual::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to right, rgba(16, 185, 129, 0.1), transparent);
                    z-index: 0;
                }

                /* High Intensity Interactive Spotlight */
                .visual-interact {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(
                        600px circle at var(--mouse-x) var(--mouse-y),
                        rgba(52, 211, 153, 0.25), /* Stronger glow */
                        transparent 40%
                    );
                    z-index: 1;
                    pointer-events: none;
                }

                .visual-content {
                    position: relative;
                    z-index: 10;
                    color: white;
                }
                


                .logo-container {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 32px;
                    color: white; /* Pure white for contrast */
                }
                .logo-icon {
                    width: 40px;
                    height: 40px;
                    border: 2px solid #34d399; /* Bright green */
                    border-radius: 50%;
                    padding: 6px;
                    box-shadow: 0 0 20px rgba(16, 185, 129, 0.6); /* Glowing logo */
                    background: rgba(0,0,0,0.3);
                }
                .logo-inner {
                    width: 100%;
                    height: 100%;
                    background: #34d399;
                    border-radius: 50%;
                }
                
                .logo-container h3 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    text-shadow: 0 0 10px rgba(0,0,0,0.5); /* Shadow for readability */
                    letter-spacing: 0.5px;
                }

                .auth-visual h2 {
                    font-size: 2.8rem;
                    line-height: 1.1;
                    margin-bottom: 20px;
                    font-weight: 800;
                    color: white;
                    text-shadow: 0 4px 20px rgba(0,0,0,0.5); /* Strong shadow */
                }

                .auth-visual p {
                    color: #e2e8f0; /* Lighter text */
                    font-size: 1.15rem;
                    line-height: 1.6;
                    max-width: 360px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    font-weight: 500;
                }

                .floating-shape {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    z-index: 0;
                    opacity: 0.6; /* More visible */
                }
                .shape-1 {
                    width: 400px;
                    height: 400px;
                    background: radial-gradient(circle, var(--color-primary), transparent 70%);
                    top: -100px;
                    left: -100px;
                    animation: float 12s ease-in-out infinite;
                }
                .shape-2 {
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(circle, #3b82f6, transparent 70%);
                    bottom: -50px;
                    right: -50px; /* Moved in slightly */
                    animation: float 16s ease-in-out infinite reverse;
                }
                .shape-3 {
                    width: 200px;
                    height: 200px;
                    background: radial-gradient(circle, #f59e0b, transparent 70%);
                    top: 40%;
                    left: 60%;
                    animation: pulse 8s ease-in-out infinite;
                    opacity: 0.4;
                }



                /* Safe Vertical Centering Hack */
                .auth-form-section::before,
                .auth-form-section::after {
                    content: '';
                    flex: 1; /* Pushes content to center if space allows */
                    min-height: 20px; /* Minimum spacing */
                }

                /* Safe Vertical Centering Hack */
                .auth-form-section::before,
                .auth-form-section::after {
                    content: '';
                    flex: 1; /* Pushes content to center if space allows */
                    min-height: 20px; /* Minimum spacing */
                }

                /* .btn-close-floating removed - replaced by global .btn-close */

                .form-header {
                    margin-bottom: 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .form-header h2 {
                    font-size: 2rem;
                    color: white;
                    text-shadow: 0 0 20px rgba(255,255,255,0.2);
                }

                /* Mode Toggle Fixes */
                .mode-toggle {
                    display: inline-flex;
                    background: rgba(0, 0, 0, 0.4);
                    padding: 4px;
                    border-radius: 12px;
                    position: relative;
                    width: fit-content;
                    border: 1px solid rgba(255,255,255,0.1);
                    /* Ensure container is big enough for slider */
                    min-width: 200px; 
                }
                .mode-toggle span {
                    padding: 10px 0;
                    width: 50%;
                    text-align: center;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #ffffff !important; /* Force Pure White */
                    cursor: pointer;
                    z-index: 2;
                    transition: color 0.3s;
                    display: inline-block;
                    opacity: 1 !important; /* Force Full Opacity */
                }
                .mode-toggle span.active,
                .mode-toggle span:hover {
                    text-shadow: 0 0 10px rgba(255,255,255,0.5); /* Add glow instead of opacity change */
                }
                .toggle-slider {
                    position: absolute;
                    top: 4px;
                    bottom: 4px;
                    left: 4px; /* Start from left padding */
                    width: calc(50% - 4px); /* Exact half width minus spacing */
                    background: var(--color-primary);
                    border-radius: 8px;
                    z-index: 1;
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
                }
                /* Semantic translation using percentages */
                .toggle-slider.login { transform: translateX(0); }
                .toggle-slider.register { transform: translateX(100%); }

                /* Text Transitions - Pure Fade */
                .visual-content {
                    position: relative;
                    z-index: 10;
                    color: white;
                }
                .text-animate {
                    animation: simpleFade 0.5s ease-in-out forwards;
                }
                @keyframes simpleFade {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }

                /* Right Side: Form Wrapper & Layering */
                .auth-form-wrapper {
                     flex: 1.2;
                     position: relative;
                     /* Create layering context */
                     display: flex;
                     flex-direction: column;
                }
                
                .auth-form-bg {
                     position: absolute;
                     inset: 0;
                     background: linear-gradient(to left, rgba(2, 6, 23, 0.8), rgba(2, 6, 23, 0.4));
                     backdrop-filter: blur(10px);
                     z-index: 50; /* Low z-index: sits below glow (300) */
                }

                .auth-form-content {
                    position: relative;
                    flex: 1;
                    padding: 32px 48px;
                    overflow-y: scroll; /* Force track visibility always */
                    display: flex;
                    flex-direction: column;
                    z-index: 302; /* High z-index: sits ABOVE glow (300) so scrollbar is usable */
                    min-height: 0;
                    
                    /* Scrollbar - Inherit Global Glass Styles (Clean & Transparent) */
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
                }

                /* Removed local ::webkit-scrollbar overrides to allow global index.css styles to apply */


                /* Safe Vertical Centering Hack */
                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .input-group label {
                    display: block;
                    font-size: 0.9rem;
                    color: #cbd5e1;
                    margin-bottom: 8px;
                    font-weight: 500;
                    margin-left: 4px;
                }
                .input-wrapper {
                    position: relative;
                    transition: all 0.2s;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 14px;
                    /* Fix for border overflow */
                    overflow: visible; 
                }
                
                .input-wrapper input {
                    width: 100%;
                    box-sizing: border-box; /* Critical fix for overflow */
                    padding: 16px 16px 16px 52px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 14px;
                    color: white;
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.25s ease;
                    position: relative;
                    z-index: 2;
                }
                
                /* Enhanced Input Hover State - Neon Green */
                .input-wrapper:hover input:not(:focus) {
                    background: rgba(16, 185, 129, 0.05); /* Subtle green tint */
                    border-color: var(--color-primary); /* Neon Green Border */
                    box-shadow: 0 0 10px rgba(16, 185, 129, 0.2); /* Neon Glow */
                }
                .input-wrapper:hover .input-icon {
                    color: var(--color-primary); /* Icon turns green too */
                }
                
                /* Input Glow on Hover/Focus */
                .input-glow {
                    position: absolute;
                    inset: -2px; /* Slight outer glow */
                    border-radius: 16px;
                    background: radial-gradient(
                        120px circle at var(--mouse-x) var(--mouse-y),
                        rgba(16, 185, 129, 0.6), /* Intense look */
                        transparent 100%
                    );
                    opacity: 0;
                    transition: opacity 0.3s;
                    pointer-events: none;
                    z-index: 1;
                    filter: blur(8px);
                }
                .input-wrapper:hover .input-glow {
                    opacity: 1;
                }

                .input-wrapper input:focus {
                    background: rgba(0, 0, 0, 0.5);
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2), 0 0 20px rgba(16, 185, 129, 0.1);
                }
                .input-icon {
                    position: absolute;
                    left: 18px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #64748b;
                    transition: all 0.2s;
                    z-index: 3;
                }
                .input-wrapper input:focus + .input-icon + .input-glow,
                .input-wrapper input:focus ~ .input-icon {
                    color: var(--color-primary-glow);
                    filter: drop-shadow(0 0 5px rgba(16, 185, 129, 0.5));
                }

                /* Buttons */
                .btn-submit {
                    width: 100%;
                    padding: 16px;
                    background: linear-gradient(135deg, #10B981, #047857);
                    color: white;
                    border: none;
                    border-radius: 14px;
                    font-weight: 700;
                    font-size: 1.05rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 12px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255,255,255,0.2);
                    position: relative;
                    overflow: hidden;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .btn-submit::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 200%;
                    height: 100%;
                    background: linear-gradient(115deg, transparent, transparent, rgba(255,255,255,0.4), transparent, transparent);
                    transition: 0.7s;
                }
                .btn-submit:hover::after {
                    left: 100%;
                }
                .btn-submit:hover {
                    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4); /* Match Dashboard */
                    transform: translateY(-1px); /* Match Dashboard */
                    filter: brightness(1.1); /* Match Dashboard */
                    /* Keep gradient but aligned with primary theme */
                    background: linear-gradient(135deg, #10B981, #047857); 
                }

                .divider {
                    display: flex;
                    align-items: center;
                    margin: 28px 0;
                    color: #64748b;
                    font-size: 0.9rem;
                    font-weight: 500;
                }
                .divider::before, .divider::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                }
                .divider span { padding: 0 16px; }

                .btn-google-premium {
                    width: 100%;
                    padding: 14px;
                    background: white;
                    color: #0f172a;
                    border: none;
                    border-radius: 14px;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .btn-google-premium:hover {
                    background: #f8fafc;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(255, 255, 255, 0.25);
                }

                /* Messages */
                .message {
                    margin-top: 16px;
                    padding: 14px;
                    border-radius: 12px;
                    font-size: 0.95rem;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 500;
                }
                .message.error {
                    background: rgba(220, 38, 38, 0.1);
                    color: #fca5a5;
                    border: 1px solid rgba(220, 38, 38, 0.2);
                    box-shadow: 0 4px 15px rgba(220, 38, 38, 0.1);
                }
                .message.success {
                    background: rgba(16, 185, 129, 0.1);
                    color: #6ee7b7;
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.1);
                }
                .dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: currentColor;
                    box-shadow: 0 0 10px currentColor;
                }

                /* Optimized Animations */
                .auth-container {
                    /* ... existing props ... */
                    will-change: transform; /* Performance optimization */
                }

                /* Button Interactions */
                .btn-submit:active {
                    transform: scale(0.98) translateY(0);
                    box-shadow: 0 2px 10px rgba(16, 185, 129, 0.3);
                    filter: brightness(0.9);
                }
                
                .btn-google-premium:active {
                    transform: scale(0.98);
                    background: #f1f5f9;
                }

                /* Advanced Loading State */
                .btn-submit.loading {
                    cursor: wait;
                    background: linear-gradient(135deg, #059669, #047857);
                    color: rgba(255, 255, 255, 0.8);
                }
                
                /* Pulse animation for loading spinner */
                .spin { 
                    animation: spin 1s linear infinite, glowPulse 1.5s ease-in-out infinite; 
                }
                
                @keyframes glowPulse {
                    0%, 100% { filter: drop-shadow(0 0 2px rgba(255,255,255,0.5)); }
                    50% { filter: drop-shadow(0 0 8px rgba(255,255,255,0.9)); }
                }

                /* Existing Animations */
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
                @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes scaleDown { from { transform: scale(1); opacity: 1; } to { transform: scale(0.95); opacity: 0; } }
                @keyframes float { 
                    0% { transform: translate(0, 0); } 
                    50% { transform: translate(30px, 30px); } 
                    100% { transform: translate(0, 0); } 
                }
                @keyframes pulse {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
                    50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.1; }
                }
                .animate-in {
                    animation: slideIn 0.3s ease-out forwards;
                }
                @keyframes slideIn {
                    from { transform: translateY(10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes spin { 
                    from { transform: rotate(0deg); } 
                    to { transform: rotate(360deg); } 
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .auth-container {
                        flex-direction: column;
                        height: auto;
                        width: 100%;
                        max-height: 100vh;
                        border-radius: 0;
                    }
                    .auth-visual {
                        padding: 32px;
                        flex: 0 0 auto;
                        min-height: 200px;
                        /* Mobile gradient to separate */
                        background: linear-gradient(to bottom, #047857, #020617);
                    }
                    .auth-visual h2 { font-size: 2rem; }
                    .floating-shape { display: none; }
                    .auth-form-section { padding: 32px 24px; background: transparent; }
                }
            `}</style>
        </div>
    )
}
