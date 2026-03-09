import React, { useState } from "react";
import MainLayout from "../layout/MainLayout";
import FileUpload from "../components/FileUpload";
import { HardDrive, CloudUpload, Link as LinkIcon, ShieldAlert, Zap } from 'lucide-react';
import '../Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalFiles: 0,
        totalSize: 0,
        sharedFiles: 0,
        secureLevel: 'High'
    });

    const updateStats = React.useCallback((newStats) => {
        setStats(prev => ({ ...prev, ...newStats }));
    }, []);

    return (
        <MainLayout>
            <div className="page-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: '#ffffff', padding: '10px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(255, 255, 255, 0.1)' }}>
                        <Zap size={24} color="black" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.875rem' }}>System Overview</h1>
                        <p style={{ margin: 0, color: '#a3a3a3' }}>Monitor your secure vault activity and manage storage.</p>
                    </div>
                </div>
            </div>

            <div className="stats-grid" style={{ marginTop: '2.5rem' }}>
                <div className="stat-card glass-card">
                    <div className="stat-label-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="stat-label">Total Files</span>
                        <div className="stat-icon-wrapper" style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <HardDrive size={20} color="#ffffff" />
                        </div>
                    </div>
                    <span className="stat-value">{stats.totalFiles}</span>
                    <div className="stat-progress-bg" style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '1rem' }}>
                        <div style={{ height: '100%', width: '100%', background: 'var(--primary)', borderRadius: '2px' }}></div>
                    </div>
                    <span className="stat-trend" style={{ fontSize: '0.75rem', color: '#a3a3a3', display: 'block', marginTop: '0.5rem' }}>Cloud storage active</span>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-label-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="stat-label">Used Storage</span>
                        <div className="stat-icon-wrapper" style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <CloudUpload size={20} color="#ffffff" />
                        </div>
                    </div>
                    <span className="stat-value">{(stats.totalSize / 1024 / 1024).toFixed(2)} MB</span>
                    <div className="stat-progress-bg" style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '1rem' }}>
                        <div style={{ height: '100%', width: '45%', background: '#ffffff', borderRadius: '2px' }}></div>
                    </div>
                    <span className="stat-trend" style={{ fontSize: '0.75rem', color: '#a3a3a3', display: 'block', marginTop: '0.5rem' }}>Optimized encryption</span>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-label-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="stat-label">Public Links</span>
                        <div className="stat-icon-wrapper" style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <LinkIcon size={20} color="#ffffff" />
                        </div>
                    </div>
                    <span className="stat-value">{stats.sharedFiles}</span>
                    <div className="stat-progress-bg" style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '1rem' }}>
                        <div style={{ height: '100%', width: `${Math.min((stats.sharedFiles / (stats.totalFiles || 1)) * 100, 100)}%`, background: '#ffffff', borderRadius: '2px' }}></div>
                    </div>
                    <span className="stat-trend" style={{ fontSize: '0.75rem', color: '#a3a3a3', display: 'block', marginTop: '0.5rem' }}>Monitoring active</span>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-label-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="stat-label">Security Score</span>
                        <div className="stat-icon-wrapper" style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '10px', borderRadius: '10px' }}>
                            <Zap size={20} color="#ffffff" />
                        </div>
                    </div>
                    <span className="stat-value" style={{ color: '#ffffff' }}>{stats.secureLevel}</span>
                    <div className="stat-progress-bg" style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '1rem' }}>
                        <div style={{ height: '100%', width: '98%', background: '#ffffff', borderRadius: '2px' }}></div>
                    </div>
                    <span className="stat-trend" style={{ fontSize: '0.75rem', color: '#a3a3a3', display: 'block', marginTop: '0.5rem' }}>AES-256 standard</span>
                </div>
            </div>

            <div className="data-table-container" style={{ marginTop: '3.5rem', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Vault Library</h2>
                        <p style={{ color: '#a3a3a3', margin: 0 }}>Manage your encrypted documents and sharing permissions.</p>
                    </div>
                </div>
                <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <FileUpload onStatusChange={updateStats} />
                </div>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
