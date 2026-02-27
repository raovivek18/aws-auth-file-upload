import React from 'react';
import Navbar from '../components/Navbar';

const Dashboard = ({ user, signOut }) => {
    return (
        <div className="page-wrapper">
            <Navbar user={user} signOut={signOut} />
            <div className="dashboard-container">
                <div className="glass-card" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
                    {/* Decorative elements */}
                    <div style={{
                        position: 'absolute',
                        top: '-50px',
                        right: '-50px',
                        width: '200px',
                        height: '200px',
                        background: 'var(--primary-color)',
                        filter: 'blur(100px)',
                        opacity: '0.2',
                        zIndex: 0
                    }}></div>

                    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                        <h1 style={{ marginBottom: '1.5rem', fontSize: '3rem', fontWeight: '800' }}>
                            Welcome back, <span style={{ color: 'var(--accent-blue)' }}>{user?.username}</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                            Your cloud ecosystem is ready. Manage your deployments, monitor security, and explore your analytics from this central hub.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            <div className="glass-card" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🛡️</div>
                                <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Security Status</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    Multi-factor authentication is active. Your last login was from a recognized device.
                                </p>
                            </div>

                            <div className="glass-card" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>👤</div>
                                <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Profile Details</h3>
                                <div style={{ textAlign: 'left', fontSize: '0.9rem' }}>
                                    <div style={{ marginBottom: '0.5rem' }}><strong>Username:</strong> {user?.username}</div>
                                    <div style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> {user?.signInDetails?.loginId || 'N/A'}</div>
                                    <div><strong>User ID:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{user?.userId}</span></div>
                                </div>
                            </div>
                        </div>

                        <button
                            className="btn-primary"
                            onClick={signOut}
                            style={{ marginTop: '4rem', padding: '12px 32px', fontSize: '18px' }}
                        >
                            Sign Out Securely
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
