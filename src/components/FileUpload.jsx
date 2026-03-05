import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import fileService from '../services/fileService';
import ShareModal from './ShareModal';
import {
    Search, Upload, RefreshCw, Trash2, Shield, Globe,
    Copy, Image as ImageIcon, Edit3, Eye,
    Video, FileCode, File, Clock, AlertTriangle, FileText, ChevronUp, ChevronDown
} from 'lucide-react';
import FilePreviewModal from './FilePreviewModal';
import logger from '../services/loggerService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import '../Dashboard.css';

const FileRow = React.memo(({ file, onTogglePrivacy, onShare, onDelete, onRename, onPreview, getFileIcon, formatBytes }) => {
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
                        onClick={() => onPreview(file)}
                        title="Preview"
                    >
                        <Eye size={16} color="#6366f1" />
                    </button>
                    <button
                        className="btn btn-outline"
                        style={{ padding: '6px' }}
                        onClick={() => onRename(file)}
                        title="Rename"
                    >
                        <Edit3 size={16} color="#0d9488" />
                    </button>
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
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [shareModal, setShareModal] = useState({ isOpen: false, file: null });
    const [renameModal, setRenameModal] = useState({ isOpen: false, file: null, newName: '' });
    const [previewModal, setPreviewModal] = useState({ isOpen: false, file: null });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState({ show: false, file: null });
    const [sortConfig, setSortConfig] = useState({ key: 'uploadTimestamp', direction: 'desc' });

    // Use a ref to track if a fetch is currently in progress to avoid double-triggers
    const isFetchingRef = React.useRef(false);

    // Fetch files (initial load)
    const fetchFiles = useCallback(async (isInitial = true) => {
        const identifier = user?.userId;
        if (!identifier || isFetchingRef.current) return;

        if (isInitial) {
            setLoadingFiles(true);
        } else {
            setLoadingMore(true);
        }

        isFetchingRef.current = true;

        try {
            const currentToken = isInitial ? null : nextToken;
            const result = await fileService.listFiles(identifier, 10, currentToken);

            setFiles(prev => isInitial ? result.items : [...prev, ...result.items]);
            setNextToken(result.nextToken);
        } catch (err) {
            const errorMessage = err.errors?.[0]?.message || err.message || 'Identity verification failed';
            logger.error('Failed to load vault library', {
                error: err,
                userId: user?.userId,
                username: user?.username,
                details: errorMessage
            });
            toast.error(`Vault loading failed: ${errorMessage}`);
        } finally {
            setLoadingFiles(false);
            setLoadingMore(false);
            isFetchingRef.current = false;
        }
    }, [user?.userId, user?.username, nextToken]);

    // Handle Stats Updates separately to avoid circular dependency in fetchFiles
    useEffect(() => {
        if (onStatusChange && !loadingFiles) {
            const totalSize = files.reduce((acc, f) => acc + f.size, 0);
            const sharedFiles = files.filter(f => f.sharingStatus === 'PUBLIC').length;
            onStatusChange({
                totalFiles: files.length,
                totalSize,
                sharedFiles
            });
        }
    }, [files, onStatusChange, loadingFiles]);

    useEffect(() => {
        if (user?.userId) {
            const timer = setTimeout(() => {
                fetchFiles(true);
            }, 100);
            return () => {
                clearTimeout(timer);
            };
        }
    }, [user?.userId, fetchFiles]);

    const handleUpload = async (e) => {
        const identifier = user?.userId;
        const selectedFile = e.target.files[0];
        if (!selectedFile || !identifier) return;

        setIsUploading(true);
        setUploadProgress(0);
        const uploadId = toast.loading(`Preparing ${selectedFile.name}...`);

        try {
            await fileService.uploadFile(selectedFile, identifier, (progress) => {
                setUploadProgress(progress);
            });
            toast.success(`${selectedFile.name} uploaded successfully. Click Refresh to update your list.`, { id: uploadId });
            fetchFiles(true); // Automatically refresh
        } catch (err) {
            const errMsg = err.message || 'File upload rejected by security policy';
            logger.error('Upload failed', { error: err, fileName: selectedFile.name, userId: identifier });
            toast.error(errMsg, { id: uploadId });
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
        const identifier = user?.userId;
        const file = showDeleteConfirm.file;
        if (!file || !identifier) return;

        const delId = toast.loading(`Deleting ${file.name}...`);
        try {
            await fileService.deleteFile(file, identifier);
            toast.success('File deleted', { id: delId });
            setFiles(prev => prev.filter(f => f.id !== file.id)); // Optimistic UI update
        } catch (err) {
            toast.error(err.message || 'Deletion failed', { id: delId });
        } finally {
            setShowDeleteConfirm({ show: false, file: null });
        }
    };

    const handleTogglePrivacy = useCallback(async (file) => {
        const identifier = user?.userId;
        if (!identifier) return;
        const toggleId = toast.loading('Updating sharing settings...');
        try {
            const updated = await fileService.toggleFilePrivacy(file, identifier);
            const status = updated.sharingStatus === 'PUBLIC' ? 'Public' : 'Private';
            toast.success(`Access changed to ${status}`, { id: toggleId });
            setFiles(prev => prev.map(f => f.id === updated.id ? updated : f));
        } catch (err) {
            toast.error(err.message || 'Failed to change access', { id: toggleId });
        }
    }, [user?.userId]);

    const handleGenerateLink = async (file, expiresIn) => {
        const identifier = user?.userId;
        if (!identifier) return;
        return await fileService.generateShareLink(file, identifier, expiresIn);
    };

    const handleRename = async () => {
        const identifier = user?.userId;
        if (!renameModal.file || !renameModal.newName.trim() || !identifier) return;

        const renameId = toast.loading(`Renaming to ${renameModal.newName}...`);
        try {
            const updated = await fileService.renameFile(renameModal.file, renameModal.newName, identifier);
            setFiles(prev => prev.map(f => f.id === updated.id ? { ...f, name: updated.name } : f));
            toast.success('File renamed successfully', { id: renameId });
            setRenameModal({ isOpen: false, file: null, newName: '' });
        } catch (err) {
            toast.error(err.message || 'Rename failed', { id: renameId });
        }
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
        let processed = [...files];

        if (searchQuery) {
            processed = processed.filter(f =>
                f.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        processed.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

            if (sortConfig.key === 'uploadTimestamp') {
                valA = new Date(valA);
                valB = new Date(valB);
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return processed;
    }, [files, searchQuery, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortIndicator = ({ column }) => {
        if (sortConfig.key !== column) return <ChevronDown size={14} style={{ opacity: 0.3 }} />;
        return sortConfig.direction === 'asc' ? <ChevronUp size={14} color="#6366f1" /> : <ChevronDown size={14} color="#6366f1" />;
    };

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
                                    <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            Name <SortIndicator column="name" />
                                        </div>
                                    </th>
                                    <th onClick={() => requestSort('sharingStatus')} style={{ cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            Status <SortIndicator column="sharingStatus" />
                                        </div>
                                    </th>
                                    <th onClick={() => requestSort('size')} style={{ cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            Size <SortIndicator column="size" />
                                        </div>
                                    </th>
                                    <th onClick={() => requestSort('uploadTimestamp')} style={{ cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            Uploaded At <SortIndicator column="uploadTimestamp" />
                                        </div>
                                    </th>
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
                                        onRename={(f) => setRenameModal({ isOpen: true, file: f, newName: f.name })}
                                        onPreview={(f) => setPreviewModal({ isOpen: true, file: f })}
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

            {renameModal.isOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div className="stat-card" style={{ width: '400px', padding: '2rem', animation: 'fadeIn 0.2s ease-out' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <Edit3 size={24} color="#0d9488" />
                            <h3 style={{ margin: 0 }}>Rename File</h3>
                        </div>
                        <div className="input-field" style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>File Name</label>
                            <input
                                type="text"
                                className="search-input"
                                style={{ position: 'relative', width: '100%', paddingLeft: '1rem' }}
                                value={renameModal.newName}
                                onChange={(e) => setRenameModal(prev => ({ ...prev, newName: e.target.value }))}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={() => setRenameModal({ isOpen: false, file: null, newName: '' })}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleRename}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

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

            <FilePreviewModal
                isOpen={previewModal.isOpen}
                file={previewModal.file}
                onClose={() => setPreviewModal({ isOpen: false, file: null })}
                getUrl={handleGenerateLink}
            />

            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
                .preview-modal { max-width: 900px !important; }
                th:hover { background: #f8fafc; }
            `}</style>
        </div>
    );
};

export default FileUpload;
