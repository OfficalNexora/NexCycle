
import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, ShieldWarning } from '@phosphor-icons/react';

export default function AdminDashboard({ user }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Users
    useEffect(() => {
        fetch('http://localhost:8000/admin/users')
            .then(res => res.json())
            .then(data => {
                setUsers(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    const toggleRole = async (targetUser) => {
        const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
        if (!confirm(`Change ${targetUser.email} role to ${newRole}?`)) return;

        try {
            await fetch(`http://localhost:8000/admin/users/${targetUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            // Update local state
            setUsers(users.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
        } catch (err) {
            alert('Failed to update role');
        }
    };

    if (loading) return <div style={{ padding: 40, color: 'white' }}>Loading Users...</div>;

    return (
        <div style={{ padding: 30, color: 'white' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <ShieldCheck size={32} color="var(--color-primary)" />
                User Management
            </h2>

            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(0,0,0,0.3)', textAlign: 'left' }}>
                            <th style={{ padding: 15 }}>ID</th>
                            <th style={{ padding: 15 }}>Name</th>
                            <th style={{ padding: 15 }}>Email</th>
                            <th style={{ padding: 15 }}>Role</th>
                            <th style={{ padding: 15 }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: 15, opacity: 0.7 }}>#{u.id}</td>
                                <td style={{ padding: 15, fontWeight: 'bold' }}>{u.full_name || 'N/A'}</td>
                                <td style={{ padding: 15 }}>{u.email}</td>
                                <td style={{ padding: 15 }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: 20,
                                        fontSize: '0.8rem',
                                        background: u.role === 'admin' ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                                        color: u.role === 'admin' ? 'black' : 'white'
                                    }}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: 15 }}>
                                    <button
                                        onClick={() => toggleRole(u)}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            color: 'white',
                                            padding: '6px 12px',
                                            borderRadius: 8,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
