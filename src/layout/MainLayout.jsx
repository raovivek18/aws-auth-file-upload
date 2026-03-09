import React from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Search as SearchIcon } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const MainLayout = ({ children }) => {
    const { user } = useAuth();

    return (
        <div className="dashboard-layout">
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    style: {
                        background: '#1a1a1a',
                        color: '#ffffff',
                        border: '1px solid #333333',
                    },
                }}
            />
            <Sidebar />

            <main className="main-content">
                <header className="top-bar">
                    <div className="search-input-wrapper">
                        <SearchIcon className="search-icon" size={18} color="#a3a3a3" style={{ position: 'absolute', left: '16px' }} />
                        <input type="text" placeholder="Search for files, activity..." className="search-input" style={{ paddingLeft: '2.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }} />
                    </div>

                    <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <button className="icon-btn" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid #333', cursor: 'pointer', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                            <Bell size={18} color="#a3a3a3" />
                        </button>
                        <div className="user-badge" style={{ padding: '6px 14px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '14px', border: '1px solid #333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="avatar shadow-sm" style={{ width: '32px', height: '32px', background: '#1a1a1a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 'bold' }}>
                                {(user?.attributes?.email || user?.username || 'U')[0].toUpperCase()}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>{user?.attributes?.email?.split('@')[0] || user?.username}</span>
                                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Security Tier 1</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="animate-fade-in">{children}</div>
            </main>
        </div>
    );
};

export default MainLayout;
