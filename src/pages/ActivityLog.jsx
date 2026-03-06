import React, { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout';
import activityService from '../services/activityService';
import logger from '../services/loggerService';
import {
    RefreshCw, Database, ShieldCheck,
    ArrowUpRight, Trash2, Globe, Lock, Search,
    ArrowRightCircle, Monitor, Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import '../Dashboard.css';

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await activityService.getActivityLogs();
            setLogs(data);
        } catch (err) {
            logger.error('Activity logs fetch failed', { error: err });
            toast.error('Failed to retrieve audit trail');
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action) => {
        if (action.includes('uploaded')) return <ArrowUpRight size={18} color="#6366f1" />;
        if (action.includes('deleted')) return <Trash2 size={18} color="#dc2626" />;
        if (action.includes('generated')) return <Globe size={18} color="#f59e0b" />;
        if (action.includes('enabled')) return <Globe size={18} color="#059669" />;
        if (action.includes('disabled')) return <Lock size={18} color="#dc2626" />;
        return <ArrowRightCircle size={18} color="#64748b" />;
    };

    const filteredLogs = logs.filter(log =>
        log.actionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.fileName && log.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <MainLayout>
            <div className="page-title">
                <h1>Audit Registry</h1>
                <p>Immutable record of all security events and file operations.</p>
            </div>

            <div className="table-header">
                <div className="search-input-wrapper">
                    <Search className="search-icon" size={18} color="#64748b" style={{ position: 'absolute', left: '12px' }} />
                    <input
                        type="text"
                        placeholder="Filter audit events..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="btn btn-outline" onClick={fetchLogs} disabled={loading}>
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Refresh Logs
                </button>
            </div>

            <div className="table-wrapper" style={{ background: 'white', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <div className="loading-spinner" style={{ border: '3px solid #f3f3f3', borderTop: '3px solid #6366f1', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                        <p style={{ color: '#64748b' }}>Retrieving secure audit trails...</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <Database size={48} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ marginBottom: '0.5rem' }}>No activity logs found</h3>
                        <p style={{ color: '#64748b' }}>Actions in the vault will be logged here automatically.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Event</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Action Detail</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>File Context</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Timestamp</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Origin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log) => (
                                <tr key={log.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {getActionIcon(log.actionType)}
                                            <span style={{ fontWeight: 600 }}>{log.actionType}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                                            {log.actionType.split(' ')[0]}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', color: '#64748b' }}>
                                        {log.fileName || log.fileId || '-'}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', color: '#64748b' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={14} />
                                            {format(new Date(log.timestamp), 'MMM d, h:mm:ss a')}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                                            <Monitor size={14} />
                                            <code>{log.ip || 'secure-client'}</code>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="stat-card" style={{ marginTop: '2.5rem', background: '#fdfcfb', border: '1px dashed #f59e0b' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck color="#f59e0b" />
                    Why Audit Logging Matters
                </h3>
                <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    These logs provide an immutable high-integrity audit trail for your secure files.
                    They allow you to identify unauthorized access, troubleshoot deleted content, and maintain compliance standards like GDPR and SOC2.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem', color: '#64748b' }}>Accountability</h4>
                        <p style={{ fontSize: '0.85rem' }}>Track every action back to its source.</p>
                    </div>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem', color: '#64748b' }}>Security Monitoring</h4>
                        <p style={{ fontSize: '0.85rem' }}>Detect suspicious behavior in real-time.</p>
                    </div>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem', color: '#64748b' }}>Compliance</h4>
                        <p style={{ fontSize: '0.85rem' }}>Maintain a verifiable chain of custody.</p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </MainLayout>
    );
};

export default ActivityLog;
