import React, { useEffect, useState } from 'react';
import MainLayout from '../layout/MainLayout';
import shareService from '../services/shareService';
import { Users, FileText, Download, ExternalLink, Calendar, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import logger from '../services/loggerService';

const SkeletonRow = () => (
    <tr>
        {Array(5).fill(0).map((_, i) => (
            <td key={i}>
                <div className="skeleton" style={{ height: '24px', width: i === 0 ? '70%' : '40%', borderRadius: '4px' }}></div>
            </td>
        ))}
    </tr>
);

const SharedWithMe = () => {
    const [sharedFiles, setSharedFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSharedFiles();
    }, []);

    const fetchSharedFiles = async () => {
        try {
            setLoading(true);
            const files = await shareService.getFilesSharedWithMe();
            setSharedFiles(files);
        } catch (error) {
            logger.error('Failed to load shared files', error);
            toast.error('Could not load files shared with you');
        } finally {
            setLoading(false);
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <MainLayout>
            <div className="page-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', padding: '10px', borderRadius: '12px' }}>
                        <Users size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.875rem' }}>Shared With Me</h1>
                        <p style={{ margin: 0, color: '#64748b' }}>Files shared with your account by colleagues.</p>
                    </div>
                </div>
            </div>

            <div className="data-table-container" style={{ marginTop: '3.5rem', background: 'white', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                <div className="table-header">
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Access Records</h2>
                    <span className="badge badge-public">{sharedFiles.length} Authorized Files</span>
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>File Name</th>
                                <th>Shared By</th>
                                <th>Date Shared</th>
                                <th>Size</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                            ) : sharedFiles.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b' }}>
                                        <div style={{ display: 'inline-flex', padding: '1.5rem', background: '#f8fafc', borderRadius: '50%', marginBottom: '1.5rem' }}>
                                            <Users size={48} color="#cbd5e1" />
                                        </div>
                                        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Workspace Clean</h3>
                                        <p style={{ maxWidth: '300px', margin: '0 auto' }}>No files have been shared with your account via direct email yet.</p>
                                    </td>
                                </tr>
                            ) : (
                                sharedFiles.map((file) => (
                                    <tr key={file.id} className="animate-fade-in">
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ color: '#6366f1' }}>
                                                    <FileText size={20} />
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{file.fileName}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <UserIcon size={12} />
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{file.ownerEmail}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.875rem' }}>
                                                <Calendar size={14} />
                                                {format(new Date(file.createdAt), 'MMM d, yyyy')}
                                            </div>
                                        </td>
                                        <td>{formatSize(file.fileSize)}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    className="btn btn-outline"
                                                    style={{ padding: '6px 10px' }}
                                                    onClick={() => toast.error('Access restricted to preview only')}
                                                >
                                                    <Download size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ padding: '6px 12px' }}
                                                    onClick={() => toast.success('Secure preview generated')}
                                                >
                                                    <ExternalLink size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </MainLayout>
    );
};

export default SharedWithMe;
