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
                    <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', padding: '10px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}>
                        <Zap size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.875rem' }}>System Overview</h1>
                        <p style={{ margin: 0, color: '#64748b' }}>Monitor your secure vault activity and manage storage.</p>
                    </div>
                </div>
            </div>

            <div className="stats-grid" style={{ marginTop: '2.5rem' }}>
                <div className="stat-card">
                    <div className="stat-label-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="stat-label">Total Files</span>
                        <div style={{ background: '#eef2ff', padding: '8px', borderRadius: '8px' }}>
                            <HardDrive size={18} color="#6366f1" />
                        </div>
                    </div>
                    <span className="stat-value">{stats.totalFiles}</span>
                    <span className="stat-trend" style={{ fontSize: '0.75rem', color: '#059669', display: 'block', marginTop: '0.5rem' }}>Vault library capacity: Unlimited</span>
                </div>

                <div className="stat-card">
                    <div className="stat-label-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="stat-label">Used Storage</span>
                        <div style={{ background: '#ecfdf5', padding: '8px', borderRadius: '8px' }}>
                            <CloudUpload size={18} color="#10b981" />
                        </div>
                    </div>
                    <span className="stat-value">{(stats.totalSize / 1024 / 1024).toFixed(2)} MB</span>
                    <span className="stat-trend" style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '0.5rem' }}>Cloud optimized encryption</span>
                </div>

                <div className="stat-card">
                    <div className="stat-label-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="stat-label">Publicly Accessible</span>
                        <div style={{ background: '#fffbeb', padding: '8px', borderRadius: '8px' }}>
                            <LinkIcon size={18} color="#f59e0b" />
                        </div>
                    </div>
                    <span className="stat-value">{stats.sharedFiles}</span>
                    <span className="stat-trend" style={{ fontSize: '0.75rem', color: '#dc2626', display: 'block', marginTop: '0.5rem' }}>Requires continuous monitoring</span>
                </div>

                <div className="stat-card">
                    <div className="stat-label-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="stat-label">Vault Security</span>
                        <div style={{ background: '#f5f3ff', padding: '8px', borderRadius: '8px' }}>
                            <ShieldAlert size={18} color="#8b5cf6" />
                        </div>
                    </div>
                    <span className="stat-value" style={{ color: '#8b5cf6' }}>{stats.secureLevel}</span>
                    <span className="stat-trend" style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '0.5rem' }}>Encrypted with AES-256</span>
                </div>
            </div>

            <div className="data-table-container" style={{ marginTop: '3.5rem', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Vault Library</h2>
                        <p style={{ color: '#64748b', margin: 0 }}>Manage your encrypted documents and sharing permissions.</p>
                    </div>
                </div>
                <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                    <FileUpload onStatusChange={updateStats} />
                </div>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
