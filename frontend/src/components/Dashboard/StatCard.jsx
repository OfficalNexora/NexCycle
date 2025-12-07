import { ArrowUpRight, ArrowDownRight } from '@phosphor-icons/react'

export default function StatCard({ title, value, trend, label, trendUp, onClick }) {
  return (
    <div
      className="glass-card"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.borderColor = 'var(--color-primary)'
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'
        }
      }}
    >
      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{value}</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        {trend && (
          <div style={{
            color: trendUp ? 'var(--status-success)' : 'var(--status-error)',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            {trendUp ? <ArrowUpRight weight="bold" /> : <ArrowDownRight weight="bold" />}
            {trend}
          </div>
        )}
        {label && <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{label}</div>}
      </div>
    </div>
  )
}
