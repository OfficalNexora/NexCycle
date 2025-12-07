import DetailModal from './DetailModal'

export default function GalleryModal({ onClose }) {
    // Mock data for gallery
    const items = [
        { id: 1, type: 'Plastic Bottle', conf: '99%', time: '10:42 AM', img: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=300&q=80' },
        { id: 2, type: 'Soda Can', conf: '98%', time: '10:41 AM', img: 'https://images.unsplash.com/photo-1585503418537-88331351ad99?auto=format&fit=crop&w=300&q=80' },
        { id: 3, type: 'Paper Cup', conf: '95%', time: '10:39 AM', img: 'https://images.unsplash.com/photo-1576666273413-2997fa4f4892?auto=format&fit=crop&w=300&q=80' },
        { id: 4, type: 'Glass Jar', conf: '97%', time: '10:35 AM', img: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=300&q=80' },
        { id: 5, type: 'Cardboard', conf: '92%', time: '10:30 AM', img: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=300&q=80' },
        { id: 6, type: 'Plastic Bag', conf: '89%', time: '10:28 AM', img: 'https://images.unsplash.com/photo-1591055209255-3d063953c760?auto=format&fit=crop&w=300&q=80' },
    ]

    return (
        <DetailModal title="Sorted Items Gallery" onClose={onClose}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {items.map(item => (
                    <div key={item.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', border: 'none' }}>
                        <div style={{ height: 150, overflow: 'hidden' }}>
                            <img src={item.img} alt={item.type} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} />
                        </div>
                        <div style={{ padding: 12 }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.type}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                <span>{item.time}</span>
                                <span style={{ color: 'var(--color-primary)' }}>{item.conf}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </DetailModal>
    )
}
