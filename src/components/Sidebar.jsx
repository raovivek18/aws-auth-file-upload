import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, Shield, LogOut, Share2, BarChart3 } from 'lucide-react';
import { signOut } from 'aws-amplify/auth';
import logger from '../services/loggerService';
import '../Dashboard.css';

const Sidebar = () => {
    const handleSignOut = async () => {
        try {
            await signOut();
            window.location.reload();
        } catch (error) {
            logger.error('Logout failed', { error });
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <Shield className="logo-icon" size={28} />
                <span>SecureVault</span>
            </div>

            <nav className="sidebar-nav">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/activity"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <History size={20} />
                    <span>Activity Log</span>
                </NavLink>

                <NavLink
                    to="/analytics"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <BarChart3 size={20} />
                    <span>Analytics</span>
                </NavLink>

                <NavLink
                    to="/shared"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <Share2 size={20} />
                    <span>Shared</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <button
                    className="nav-item sign-out-btn"
                    onClick={handleSignOut}
                    style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', padding: '0.875rem 1rem' }}
                >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
