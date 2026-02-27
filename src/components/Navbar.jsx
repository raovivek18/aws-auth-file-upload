import React from 'react';

const Navbar = ({ user, signOut }) => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">AmplifyAuth</div>
            <div className="user-badge">
                <div className="avatar">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="user-info">
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{user?.username}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.userId?.substring(0, 8)}...</div>
                </div>
                <button className="btn-primary" onClick={signOut} style={{ marginLeft: '12px', padding: '6px 12px', fontSize: '13px' }}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
