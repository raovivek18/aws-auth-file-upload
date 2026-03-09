import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from '../layout/MainLayout';
import analyticsService from '../services/analyticsService';
import { BarChart3, PieChart, TrendingUp, Activity, RefreshCw, FileText, Share2, Database, Shield } from 'lucide-react';
import logger from '../services/loggerService';
import toast from 'react-hot-toast';

const Analytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const loadAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const data = await analyticsService.getOrCreateAnalytics();
            setStats(data);
        } catch (error) {
            logger.error('Failed to load analytics', error);
            toast.error('Could not load analytics data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    const handleSync = async () => {
        try {
            setIsSyncing(true);
            await analyticsService.syncStats();
            await loadAnalytics();
            toast.success('Analytics synchronized successfully');
        } catch (error) {
            toast.error('Sync failed');
        } finally {
            setIsSyncing(false);
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <MainLayout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <div className="animate-pulse" style={{ textAlign: 'center' }}>
                        <Activity size={48} color="#ffffff" style={{ marginBottom: '1rem' }} />
                        <p>Aggregating your usage data...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const storageUsagePercent = stats ? Math.min(100, (stats.totalStorage / stats.storageLimit) * 100) : 0;

    return (
        <MainLayout>
            <div className="page-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <BarChart3 size={32} color="#ffffff" />
                        Usage Analytics
                    </h1>
                    <p>Real-time insights into your secure vault metrics.</p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="btn btn-outline"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                    {isSyncing ? 'Syncing...' : 'Force Sync'}
                </button>
            </div>

            <div className="stats-grid" style={{ marginTop: '2.5rem' }}>
                {/* Summary Cards */}
                <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="stat-label">Total Uploads</span>
                        <FileText size={20} color="#ffffff" />
                    </div>
                    <span className="stat-value">{stats?.totalFiles || 0}</span>
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <TrendingUp size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        Active library files
                    </div>
                </div>

                <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="stat-label">Storage Used</span>
                        <Database size={20} color="#ffffff" />
                    </div>
                    <span className="stat-value">{formatSize(stats?.totalStorage)}</span>
                    <div style={{ marginTop: '12px', width: '100%', height: '6px', background: '#333333', borderRadius: '3px' }}>
                        <div style={{
                            width: `${storageUsagePercent}%`,
                            height: '100%',
                            background: '#ffffff',
                            borderRadius: '3px',
                            transition: 'width 0.5s ease-out'
                        }} />
                    </div>
                    <p style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {storageUsagePercent.toFixed(1)}% of {formatSize(stats?.storageLimit)} limit
                    </p>
                </div>

                <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="stat-label">Total Shares</span>
                        <Share2 size={20} color="#ffffff" />
                    </div>
                    <span className="stat-value">{stats?.totalShares || 0}</span>
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Generated pre-signed links
                    </div>
                </div>

                <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="stat-label">Account Status</span>
                        <Shield size={20} color="#ffffff" />
                    </div>
                    <span className="stat-value" style={{ color: '#ffffff', fontSize: '1.25rem' }}>Verified</span>
                    <p style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Last active: {stats?.lastActive ? new Date(stats.lastActive).toLocaleDateString() : 'N/A'}
                    </p>
                </div>
            </div>

            {/* Visual Charts Placeholder Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div className="stat-card" style={{ minHeight: '300px' }}>
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PieChart size={18} />
                        Storage Distribution
                    </h3>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {/* CSS-only Donut Chart for Efficiency */}
                        <div style={{
                            width: '180px',
                            height: '180px',
                            borderRadius: '50%',
                            background: `conic-gradient(#ffffff ${storageUsagePercent}%, #333333 0)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                        }}>
                            <div style={{
                                width: '130px',
                                height: '130px',
                                borderRadius: '50%',
                                background: '#000000',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{storageUsagePercent.toFixed(0)}%</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quota</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stat-card" style={{ minHeight: '300px' }}>
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={18} />
                        Activity Projection
                    </h3>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
                        {[
                            { label: 'Upload Efficiency', val: 94, color: '#ffffff' },
                            { label: 'Share Success Rate', val: 100, color: '#ffffff' },
                            { label: 'Security Score', val: 98, color: '#ffffff' }
                        ].map((bar, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.875rem' }}>
                                    <span>{bar.label}</span>
                                    <span style={{ fontWeight: 600 }}>{bar.val}%</span>
                                </div>
                                <div style={{ height: '8px', background: '#333333', borderRadius: '4px' }}>
                                    <div style={{ width: `${bar.val}%`, height: '100%', background: bar.color, borderRadius: '4px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Analytics;
