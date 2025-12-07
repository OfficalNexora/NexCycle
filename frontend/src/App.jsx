import { useState, useEffect, memo, useMemo, lazy, Suspense, useCallback } from 'react'
import { House, ChartBar, Gear, Camera, Robot, WarningCircle, ChatCircleDots, SignOut, LockKey, Stack, ChartLineUp, Wrench, UserCircle } from '@phosphor-icons/react'
import StatCard from './components/Dashboard/StatCard'
import { getSession, logout as authLogout } from './services/authService'
import AdminDashboard from './components/Admin/AdminDashboard';
import ReviewQueue from './components/Admin/ReviewQueue';

// Lazy load heavy components for better initial load performance
const RobotArm3D = lazy(() => import('./components/Dashboard/RobotArm3D'))
const LiveFeed = lazy(() => import('./components/Dashboard/LiveFeed'))
const GalleryModal = lazy(() => import('./components/Modals/GalleryModal'))
const MapModal = lazy(() => import('./components/Modals/MapModal'))
const InfoModal = lazy(() => import('./components/Modals/InfoModal'))
const ChatPanel = lazy(() => import('./components/Dashboard/ChatPanel'))
const AuthModal = lazy(() => import('./components/Admin/Login'))
const UnsureImageGrid = lazy(() => import('./components/Admin/UnsureImageGrid'))

// Loading fallback component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    color: 'var(--text-muted)'
  }}>
    <div style={{
      width: 24,
      height: 24,
      border: '2px solid var(--color-primary)',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
  </div>
)

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [activeModal, setActiveModal] = useState(null) // 'gallery', 'map', 'info'
  const [showChat, setShowChat] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [user, setUser] = useState(null) // { username, role }

  // Check for existing session on mount
  useEffect(() => {
    const session = getSession()
    if (session) {
      setUser({ username: session.username, role: session.role })
      // Auto-redirect admins to Admin View on restore
      if (session.role === 'admin') {
        setActiveTab('admin')
      }
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    setShowLogin(false)
    if (userData.role === 'admin') {
      setActiveTab('admin')
    }
  }

  const handleLogout = () => {
    authLogout()
    setUser(null)
    setActiveTab('dashboard')
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="app-container">
      {/* Navigation Bar - Clean, centered */}
      <nav className="glass-panel" style={{
        position: 'fixed',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        padding: '10px 20px',
        display: 'flex',
        gap: 16,
        alignItems: 'center'
      }}>
        {/* Logo */}
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, background: 'var(--color-primary)', borderRadius: '50%', boxShadow: '0 0 8px var(--color-primary)' }} />
          NexCycle
        </div>

        {/* Navigation Tabs Only */}
        <div style={{ display: 'flex', gap: 6 }}>
          <NavButton icon={<House size={18} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavButton icon={<Camera size={18} />} label="Live Feed" active={activeTab === 'live'} onClick={() => setActiveTab('live')} />
          {user && isAdmin && (
            <NavButton icon={<Robot size={18} />} label="Admin" active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} />
          )}
          {!user && (
            <NavButton icon={<LockKey size={18} />} label="Login" active={false} onClick={() => setShowLogin(true)} />
          )}
        </div>
      </nav>

      {/* Separate User Bar - Top Right */}
      {user && (
        <div className="glass-panel" style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 100,
          padding: '8px 12px',
          display: 'flex',
          gap: 8,
          alignItems: 'center'
        }}>
          <UserCircle size={18} weight="fill" style={{ color: isAdmin ? 'var(--color-primary)' : 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{user.username}</span>
          <button
            onClick={handleLogout}
            className="btn btn-ghost"
            style={{ padding: '6px 8px', borderRadius: 6, marginLeft: 4 }}
            title="Logout"
          >
            <SignOut size={16} />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <Suspense fallback={<LoadingSpinner />}>
        <main className="container" style={{ paddingTop: 120, paddingBottom: 40 }}>
          {activeTab === 'dashboard' && <DashboardView onOpenModal={setActiveModal} />}
          {activeTab === 'live' && <LiveFeedView />}
          {activeTab === 'admin' && isAdmin && <AdminView />}
        </main>
      </Suspense>

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="btn-primary"
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 60,
          height: 60,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 900,
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)'
        }}
      >
        <ChatCircleDots size={32} weight="fill" />
      </button>



      {/* Overlays - Wrapped in Suspense */}
      <Suspense fallback={null}>
        {showChat && <ChatPanel onClose={() => setShowChat(false)} />}
        {showLogin && <AuthModal onLogin={handleLogin} onCancel={() => setShowLogin(false)} />}

        {/* Modals */}
        {activeModal === 'gallery' && <GalleryModal onClose={() => setActiveModal(null)} />}
        {activeModal === 'map' && <MapModal onClose={() => setActiveModal(null)} />}
        {activeModal === 'info' && <InfoModal onClose={() => setActiveModal(null)} />}
      </Suspense>
    </div>
  )
}

const NavButton = memo(({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`btn ${active ? 'btn-primary' : 'btn-ghost'}`}
    style={{ padding: '8px 16px', borderRadius: 8 }}
  >
    {icon}
    <span>{label}</span>
  </button>
))

const DashboardView = memo(({ onOpenModal }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
      <div>
        <h1>System Overview</h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time trash sorting analytics</p>
      </div>
      <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="status-live" />
        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>SYSTEM ONLINE</span>
      </div>
    </header>

    {/* Hero Section: 3D Arm + Live Stats */}
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
      <Suspense fallback={<div className="glass-card" style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingSpinner /></div>}>
        <RobotArm3D />
      </Suspense>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Suspense fallback={<div className="glass-card" style={{ height: 200 }}><LoadingSpinner /></div>}>
          <LiveFeed />
        </Suspense>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid-dashboard">
      <StatCard
        title="Success Rate"
        value="98.5%"
        trend="+2.1%"
        trendUp={true}
        label="Last 24h"
        onClick={() => onOpenModal('info')}
      />
      <StatCard
        title="Items Sorted"
        value="1,248"
        label="Today"
        trend="+12%"
        trendUp={true}
        onClick={() => onOpenModal('gallery')}
      />
      <StatCard
        title="Active Devices"
        value="12"
        label="Online"
        onClick={() => onOpenModal('map')}
      />
      <StatCard
        title="Plastic Saved"
        value="45kg"
        label="This Week"
        trend="+5kg"
        trendUp={true}
      />
    </div>
  </div>
))

const LiveFeedView = memo(() => (
  <div style={{ height: '80vh' }}>
    <LiveFeed />
  </div>
))

const AdminView = () => {
  const [adminTab, setAdminTab] = useState('review')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Admin Header with Tabs */}
      <div className="glass-panel" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0 }}>Admin Console</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage system operations</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setAdminTab('review')}
              className={`btn ${adminTab === 'review' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px 16px', borderRadius: 8 }}
            >
              <Stack size={18} style={{ marginRight: 6 }} /> Review
            </button>
            <button
              onClick={() => setAdminTab('users')}
              className={`btn ${adminTab === 'users' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px 16px', borderRadius: 8 }}
            >
              <UserCircle size={18} style={{ marginRight: 6 }} /> Users
            </button>
            <button
              onClick={() => setAdminTab('calibration')}
              className={`btn ${adminTab === 'calibration' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px 16px', borderRadius: 8 }}
            >
              <Wrench size={18} style={{ marginRight: 6 }} /> Calibration
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {adminTab === 'review' && <ReviewQueue />}
      {adminTab === 'users' && <AdminDashboard />}

      {adminTab === 'calibration' && (
        <div className="glass-card">
          <h3><Wrench size={24} style={{ marginBottom: -4, marginRight: 8 }} /> Robot Calibration</h3>
          {/* ... existing calibration UI ... */}
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
            Hardware controls enabled.
          </div>
        </div>
      )}
    </div>
  )
}

export default App
