import DetailModal from './DetailModal'
import { CheckCircle, Warning, XCircle } from '@phosphor-icons/react'

export default function InfoModal({ onClose }) {
    return (
        <DetailModal title="Success Rate Analysis" onClose={onClose}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 32 }}>
                    <div style={{ position: 'relative', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="100" height="100" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-primary)" strokeWidth="10" strokeDasharray="283" strokeDashoffset="5" transform="rotate(-90 50 50)" />
                        </svg>
                        <span style={{ position: 'absolute', fontSize: '1.5rem', fontWeight: 'bold' }}>98.5%</span>
                    </div>
                    <div>
                        <h3>High Accuracy Mode</h3>
                        <p style={{ color: 'var(--text-muted)' }}>The system is currently operating at peak efficiency. The AI model is confident in 98.5% of classifications.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="glass-card">
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <CheckCircle size={20} color="var(--status-success)" />
                            Successful Sorts
                        </h4>
                        <ul style={{ paddingLeft: 20, color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <li>Correct AI Prediction</li>
                            <li>Successful Robot Grip</li>
                            <li>Verified Bin Drop</li>
                        </ul>
                    </div>

                    <div className="glass-card">
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <Warning size={20} color="var(--status-warning)" />
                            Common Issues
                        </h4>
                        <ul style={{ paddingLeft: 20, color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <li>Obstructed Camera View</li>
                            <li>Unrecognizable Object</li>
                            <li>Robot Arm Slip</li>
                        </ul>
                    </div>
                </div>
            </div>
        </DetailModal>
    )
}
