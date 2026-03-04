import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import fileService from '../services/fileService';
import ShareModal from './ShareModal';
import {
    Search, Upload, RefreshCw, Trash2, Shield, Globe,
    Copy, Image as ImageIcon,
    Video, FileCode, File, Clock, AlertTriangle, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import '../Dashboard.css';

const FileRow = React.memo(({ file, onTogglePrivacy, onShare, onDelete, getFileIcon, formatBytes }) => {
    return (
        <tr key={file.id}>
            <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {getFileIcon(file.type)}
                    <span style={{ fontWeight: 600 }}>{file.name}</span>
                </div>
            </td>
            <td>
                <span className={`badge ${file.sharingStatus === 'PUBLIC' ? 'badge-public' : 'badge-private'}`}>
                    {file.sharingStatus === 'PUBLIC' ? <Globe size={12} /> : <Shield size={12} />}
                    {file.sharingStatus}
                </span>
            </td>
            <td style={{ color: '#64748b' }}>{formatBytes(file.size)}</td>
            <td style={{ color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} />
                    {format(new Date(file.uploadTimestamp), 'MMM d, h:mm a')}
                </div>
            </td>
            <td>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                        className="btn btn-outline"
                        style={{ padding: '6px' }}
                        onClick={() => onTogglePrivacy(file)}
                        title={file.sharingStatus === 'PRIVATE' ? 'Enable Public Access' : 'Disable Public Access'}
                    >
                        {file.sharingStatus === 'PRIVATE' ? <Shield size={16} /> : <Globe size={16} color="#059669" />}
                    </button>
                    <button
                        className="btn btn-outline"
                        style={{ padding: '6px' }}
                        onClick={() => onShare(file)}
                        title="Generate Share Link"
                    >
                        <Copy size={16} />
                    </button>
                    <button
                        className="btn btn-outline"
                        style={{ padding: '6px', color: '#dc2626', borderColor: '#fee2e2' }}
                        onClick={() => onDelete(file)}
                        title="Delete Forever"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
});

const FileUpload = ({ onStatusChange }) => {
    const { user } = useAuth();
    const [files, setFiles] = useState([]);
    const [nextToken, setNextToken] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loadingFiles, setLoadingFiles] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [shareModal, setShareModal] = useState({ isOpen: false, file: null });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState({ show: false, file: null });

    // Fetch files (initial load)
    const fetchFiles = useCallback(async (isInitial = true) => {
        if (!user?.userId) return;

        if (isInitial) {
            setLoadingFiles(true);
            setNextToken(null);
        } else {
            setLoadingMore(true);
        }

        try {
            const result = await fileService.listFiles(10, isInitial ? null : nextToken);

            setFiles(prev => isInitial ? result.items : [...prev, ...result.items]);
            setNextToken(result.nextToken);

            // Update stats
            if (onStatusChange) {
                const currentFiles = isInitial ? result.items : [...files, ...result.items];
                const totalSize = currentFiles.reduce((acc, f) => acc + f.size, 0);
                const sharedFiles = currentFiles.filter(f => f.sharingStatus === 'PUBLIC').length;
                onStatusChange({
                    totalFiles: currentFiles.length,
                    totalSize,
                    sharedFiles
                });
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load your vault library');
        } finally {
            setLoadingFiles(false);
            setLoadingMore(false);
        }
    }, [user?.userId, onStatusChange, nextToken, files]);

    useEffect(() => {
        fetchFiles(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.userId]);

    const handleUpload = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setIsUploading(true);
        setUploadProgress(0);
        const uploadId = toast.loading(`Preparing ${selectedFile.name}...`);

        try {
            await fileService.uploadFile(selectedFile, user.userId, (progress) => {
                setUploadProgress(progress);
            });
            toast.success(`${selectedFile.name} added to vault`, { id: uploadId });
            fetchFiles(true); // Refresh list
        } catch (err) {
            toast.error(err.message || 'Upload failed', { id: uploadId });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            e.target.value = '';
        }
    };

    const confirmDelete = useCallback((file) => {
        setShowDeleteConfirm({ show: true, file });
    }, []);

    const handleDelete = async () => {
        const file = showDeleteConfirm.file;
        if (!file) return;

        const delId = toast.loading(`Deleting ${file.name}...`);
        try {
            await fileService.deleteFile(file);
            toast.success('File deleted completely', { id: delId });
            fetchFiles(true);
        } catch (err) {
            toast.error(err.message || 'Deletion failed', { id: delId });
        } finally {
            setShowDeleteConfirm({ show: false, file: null });
        }
    };

    const handleTogglePrivacy = useCallback(async (file) => {
        const toggleId = toast.loading('Updating sharing settings...');
        try {
            const updated = await fileService.toggleFilePrivacy(file);
            const status = updated.sharingStatus === 'PUBLIC' ? 'Public' : 'Private';
            toast.success(`Access changed to ${status}`, { id: toggleId });
            setFiles(prev => prev.map(f => f.id === updated.id ? updated : f));
        } catch (err) {
            toast.error('Failed to change access', { id: toggleId });
        }
    }, []);

    const handleGenerateLink = async (file, expiresIn) => {
        return await fileService.generateShareLink(file, expiresIn);
    };

    const getFileIcon = useCallback((type) => {
        if (type.includes('image')) return <ImageIcon size={20} color="#3b82f6" />;
        if (type.includes('video')) return <Video size={20} color="#8b5cf6" />;
        if (type.includes('pdf')) return <FileText size={20} color="#ef4444" />;
        if (type.includes('javascript') || type.includes('json') || type.includes('html')) return <FileCode size={20} color="#f59e0b" />;
        return <File size={20} color="#64748b" />;
    }, []);

    const formatBytes = useCallback((bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }, []);

    const filteredFiles = useMemo(() => {
        if (!searchQuery) return files;
        return files.filter(f =>
            f.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [files, searchQuery]);

    return (
        <div className="file-system-container">
            <div className="table-header">
                <div className="search-input-wrapper">
                    <Search className="search-icon" size={18} color="#64748b" style={{ position: 'absolute', left: '12px' }} />
                    <input
                        type="text"
                        placeholder="Filter your library..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="action-buttons" style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-outline" onClick={() => fetchFiles(true)} disabled={loadingFiles}>
                        <RefreshCw size={18} className={loadingFiles ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <label className="btn btn-primary" style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                        <Upload size={18} />
                        {isUploading ? `Uploading ${uploadProgress}%` : 'Upload File'}
                        <input type="file" onChange={handleUpload} hidden disabled={isUploading} />
                        {isUploading && (
                            <div style={{ position: 'absolute', bottom: 0, left: 0, height: '4px', background: 'rgba(255,255,255,0.4)', width: `${uploadProgress}%`, transition: 'width 0.3s ease' }} />
                        )}
                    </label>
                </div>
            </div>

            {/* Global Progress Bar */}
            {isUploading && (
                <div style={{ padding: '0 1rem 1rem' }}>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', width: `${uploadProgress}%`, transition: 'width 0.2s ease-out' }}></div>
                    </div>
                </div>
            )}

            <div className="table-wrapper">
                {loadingFiles ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <div className="loading-spinner" style={{ border: '3px solid #f3f3f3', borderTop: '3px solid #6366f1', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                        <p style={{ color: '#64748b', fontWeight: 500 }}>Decrypting your vault library...</p>
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <Shield size={48} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ marginBottom: '0.5rem' }}>{searchQuery ? 'No results found' : 'Your vault is empty'}</h3>
                        <p style={{ color: '#64748b' }}>
                            {searchQuery ? `We couldn't find any file matching "${searchQuery}"` : 'Upload your first secure document to start tracking metadata.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Size</th>
                                    <th>Uploaded At</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFiles.map((file) => (
                                    <FileRow
                                        key={file.id}
                                        file={file}
                                        onTogglePrivacy={handleTogglePrivacy}
                                        onShare={(f) => setShareModal({ isOpen: true, file: f })}
                                        onDelete={confirmDelete}
                                        getFileIcon={getFileIcon}
                                        formatBytes={formatBytes}
                                    />
                                ))}
                            </tbody>
                        </table>

                        {nextToken && (
                            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => fetchFiles(false)}
                                    disabled={loadingMore}
                                    style={{ margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    {loadingMore ? (
                                        <div className="loading-spinner" style={{ width: '16px', height: '16px', border: '2px solid #e2e8f0', borderTop: '2px solid #6366f1' }}></div>
                                    ) : 'Load More Files'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Custom Delete Confirmation Modal */}
            {showDeleteConfirm.show && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div className="stat-card" style={{ width: '400px', padding: '2rem', animation: 'fadeIn 0.2s ease-out' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: '#dc2626' }}>
                            <AlertTriangle size={32} />
                            <h3 style={{ margin: 0 }}>Confirm Deletion</h3>
                        </div>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                            Are you sure you want to delete <strong>{showDeleteConfirm.file?.name}</strong>? This action cannot be undone and the file will be removed from S3 permanently.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={() => setShowDeleteConfirm({ show: false, file: null })}>Cancel</button>
                            <button className="btn btn-primary" style={{ background: '#dc2626' }} onClick={handleDelete}>Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}

            <ShareModal
                isOpen={shareModal.isOpen}
                file={shareModal.file}
                onClose={() => setShareModal({ isOpen: false, file: null })}
                onGenerate={handleGenerateLink}
            />

            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
};

export default FileUpload;
