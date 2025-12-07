import { memo, useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet'
import { X, MapPin, WifiHigh, WifiSlash, Trash, GlobeHemisphereWest, Scan } from '@phosphor-icons/react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for map resizing in modal
function MapResize() {
    const map = useMap()
    useEffect(() => {
        setTimeout(() => map.invalidateSize(), 100)
    }, [map])
    return null
}

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Sample device data
const devices = [
    { id: 1, name: 'Central Station', lat: 14.5995, lng: 120.9842, status: 'online', items: 248, signal: 98 },
    { id: 2, name: 'Mall of Asia', lat: 14.5351, lng: 120.9820, status: 'online', items: 156, signal: 92 },
    { id: 3, name: 'BGC Highstreet', lat: 14.5546, lng: 121.0509, status: 'online', items: 312, signal: 95 },
    { id: 4, name: 'Makati CBD', lat: 14.5547, lng: 121.0244, status: 'offline', items: 89, signal: 0 },
    { id: 5, name: 'Ortigas Center', lat: 14.5873, lng: 121.0615, status: 'online', items: 178, signal: 88 },
    { id: 6, name: 'Quezon City Hall', lat: 14.6488, lng: 121.0509, status: 'online', items: 203, signal: 85 },
]

// Premium Marker Icon
const createPremiumIcon = (status) => {
    const color = status === 'online' ? '#10B981' : '#EF4444'
    const glowColor = status === 'online' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'

    return L.divIcon({
        className: 'premium-marker-container',
        html: `
            <div class="premium-marker-wrapper">
                <div class="marker-pulse" style="background: ${glowColor}"></div>
                <div class="marker-core" style="background: ${color}; box-shadow: 0 0 15px ${glowColor}">
                    ${status === 'online' ?
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="6"/></svg>' :
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>'
            }
                </div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
    })
}

const MapModal = memo(({ onClose }) => {
    const center = [14.5995, 120.9842]

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(15px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 24
        }}>
            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: 1100,
                height: '85vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                boxShadow: '0 0 50px rgba(0,0,0,0.5)'
            }}>
                {/* Premium Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40,
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: 12,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(16, 185, 129, 0.2)'
                        }}>
                            <GlobeHemisphereWest size={24} weight="fill" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', textShadow: '0 0 10px rgba(16,185,129,0.3)' }}>Global Device Network</h2>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className="status-live"></span>
                                LIVE TRACKING ACTIVE
                            </div>
                        </div>
                    </div>

                    <button onClick={onClose} className="btn-close">
                        <X size={20} />
                    </button>
                </div>

                {/* Map Area */}
                <div style={{ flex: 1, position: 'relative' }}>
                    <MapContainer
                        center={center}
                        zoom={11}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                        className="premium-map"
                    >
                        <MapResize />
                        <ZoomControl position="bottomright" />

                        {/* Premium Dark Theme Tiles */}
                        <TileLayer
                            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />

                        {/* Device Markers */}
                        {devices.map(device => (
                            <Marker
                                key={device.id}
                                position={[device.lat, device.lng]}
                                icon={createPremiumIcon(device.status)}
                            >
                                <Popup className="premium-popup" closeButton={false}>
                                    <div className="glass-card" style={{
                                        padding: 16,
                                        minWidth: 200,
                                        background: 'rgba(10, 10, 10, 0.9)',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: 1,
                                                color: 'var(--text-muted)'
                                            }}>Device #{device.id}</span>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                color: device.status === 'online' ? '#10B981' : '#EF4444',
                                                fontWeight: 'bold',
                                                display: 'flex', alignItems: 'center', gap: 4
                                            }}>
                                                {device.status === 'online' ? <WifiHigh size={14} /> : <WifiSlash size={14} />}
                                                {device.status.toUpperCase()}
                                            </span>
                                        </div>

                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: 4 }}>{device.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                                            Last sync: Just now
                                        </div>

                                        <div style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: 8,
                                            padding: 8,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Sorted Items</span>
                                            <span style={{ fontWeight: 'bold' }}>{device.items}</span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    {/* Tech Overlays */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        zIndex: 500,
                        background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.6) 100%)',
                        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)'
                    }}></div>

                    {/* Grid Lines */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        zIndex: 400,
                        backgroundImage: `
                            linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px'
                    }}></div>

                    {/* Scan Line Animation */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        zIndex: 400,
                        background: 'linear-gradient(to bottom, transparent, rgba(16, 185, 129, 0.05), transparent)',
                        height: '20%',
                        animation: 'scanline 4s linear infinite'
                    }}></div>
                </div>

                {/* Footer Stats */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 32,
                    background: 'rgba(5, 5, 5, 0.5)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--color-primary)' }}>
                            {devices.filter(d => d.status === 'online').length}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
                            SYSTEMS<br />ONLINE
                        </div>
                    </div>

                    <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.1)' }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontSize: '2rem', fontWeight: 300, color: '#fff' }}>
                            {devices.reduce((a, b) => a + b.items, 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
                            TOTAL<br />PROCESSED
                        </div>
                    </div>

                    <div style={{ flex: 1 }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--color-primary)' }}>
                        <Scan size={16} />
                        SCANNING NETWORK...
                    </div>
                </div>
            </div>

            {/* Injected Styles */}
            <style>{`
                @keyframes scanline {
                    0% { transform: translateY(-500%); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(500%); opacity: 0; }
                }

                .premium-map .leaflet-control-zoom {
                    border: none !important;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
                }
                .premium-map .leaflet-control-zoom a {
                    background: rgba(20, 20, 20, 0.9) !important;
                    color: var(--color-primary) !important;
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    backdrop-filter: blur(5px);
                }
                .premium-map .leaflet-control-zoom a:hover {
                    background: var(--color-primary) !important;
                    color: black !important;
                }
                
                .premium-marker-wrapper {
                    position: relative;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .marker-core {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2;
                    border: 2px solid rgba(255,255,255,0.8);
                }
                .marker-pulse {
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    animation: markerPulse 2s infinite;
                    opacity: 0;
                }
                @keyframes markerPulse {
                    0% { transform: scale(0.5); opacity: 0.8; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                
                .leaflet-popup-content-wrapper {
                    background: transparent !important;
                    box-shadow: none !important;
                }
                .leaflet-popup-tip {
                    display: none !important;
                }
            `}</style>
        </div>
    )
})

export default MapModal
