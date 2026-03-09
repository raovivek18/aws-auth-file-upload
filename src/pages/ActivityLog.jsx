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
        if (action.includes('uploaded')) return <ArrowUpRight size={18} color="#ffffff" />;
        if (action.includes('deleted')) return <Trash2 size={18} color="#ffffff" />;
        if (action.includes('generated')) return <Globe size={18} color="#ffffff" />;
        if (action.includes('enabled')) return <Globe size={18} color="#ffffff" />;
        if (action.includes('disabled')) return <Lock size={18} color="#ffffff" />;
        return <ArrowRightCircle size={18} color="#a3a3a3" />;
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
                    <Search className="search-icon" size={18} color="#a3a3a3" style={{ position: 'absolute', left: '12px' }} />
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

            <div className="table-wrapper" style={{ background: '#000000', borderRadius: '1rem', border: '1px solid #333333', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <div className="loading-spinner" style={{ border: '3px solid #333', borderTop: '3px solid #ffffff', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                        <p style={{ color: '#a3a3a3' }}>Retrieving secure audit trails...</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <Database size={48} color="#333333" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ marginBottom: '0.5rem' }}>No activity logs found</h3>
                        <p style={{ color: '#a3a3a3' }}>Actions in the vault will be logged here automatically.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#000000' }}>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a3a3a3', textTransform: 'uppercase', background: '#000000', borderBottom: '1px solid #333333' }}>Event</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a3a3a3', textTransform: 'uppercase', background: '#000000', borderBottom: '1px solid #333333' }}>Action Detail</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a3a3a3', textTransform: 'uppercase', background: '#000000', borderBottom: '1px solid #333333' }}>File Context</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a3a3a3', textTransform: 'uppercase', background: '#000000', borderBottom: '1px solid #333333' }}>Timestamp</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a3a3a3', textTransform: 'uppercase', background: '#000000', borderBottom: '1px solid #333333' }}>Origin</th>
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
                                        <span className="badge" style={{ background: '#333333', color: '#ffffff', border: '1px solid #444' }}>
                                            {log.actionType.split(' ')[0]}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', color: '#a3a3a3' }}>
                                        {log.fileName || log.fileId || '-'}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', color: '#a3a3a3' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={14} />
                                            {format(new Date(log.timestamp), 'MMM d, h:mm:ss a')}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a3a3a3' }}>
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

            <div className="stat-card" style={{ marginTop: '2.5rem', background: '#000000', border: '1px dashed #333333' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck color="#ffffff" />
                    Why Audit Logging Matters
                </h3>
                <p style={{ color: '#a3a3a3', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    These logs provide an immutable high-integrity audit trail for your secure files.
                    They allow you to identify unauthorized access, troubleshoot deleted content, and maintain compliance standards like GDPR and SOC2.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                    <div style={{ background: '#000000', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #333333' }}>
                        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem', color: '#a3a3a3' }}>Accountability</h4>
                        <p style={{ fontSize: '0.85rem' }}>Track every action back to its source.</p>
                    </div>
                    <div style={{ background: '#000000', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #333333' }}>
                        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem', color: '#a3a3a3' }}>Security Monitoring</h4>
                        <p style={{ fontSize: '0.85rem' }}>Detect suspicious behavior in real-time.</p>
                    </div>
                    <div style={{ background: '#000000', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #333333' }}>
                        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem', color: '#a3a3a3' }}>Compliance</h4>
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
