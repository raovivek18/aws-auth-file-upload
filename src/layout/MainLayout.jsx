import React from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Search as SearchIcon } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const MainLayout = ({ children }) => {
    const { user } = useAuth();

    return (
        <div className="dashboard-layout">
            <Toaster position="top-right" reverseOrder={false} />
            <Sidebar />

            <main className="main-content">
                <header className="top-bar">
                    <div className="search-input-wrapper">
                        <SearchIcon className="search-icon" size={18} color="#64748b" style={{ position: 'absolute', left: '12px' }} />
                        <input type="text" placeholder="Search for files, activity..." className="search-input" />
                    </div>

                    <div className="user-profile">
                        <button className="icon-btn" style={{ marginRight: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <Bell size={20} color="#64748b" />
                        </button>
                        <div className="user-avatar" style={{ padding: '8px', background: '#e2e8f0', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <User size={20} color="#475569" />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{user?.username}</span>
                        </div>
                    </div>
                </header>

                <div className="animate-fade-in">{children}</div>
            </main>
        </div>
    );
};

export default MainLayout;
