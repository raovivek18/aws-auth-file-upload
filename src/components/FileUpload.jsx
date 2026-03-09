import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import fileService from '../services/fileService';
import ShareModal from './ShareModal';
import {
    Search, Upload, RefreshCw, Trash2, Shield, Globe,
    Copy, Image as ImageIcon, Edit3, Eye,
    Video, FileCode, File, Clock, AlertTriangle, FileText, ChevronUp, ChevronDown, Plus
} from 'lucide-react';
import FilePreviewModal from './FilePreviewModal';
import logger from '../services/loggerService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import '../Dashboard.css';

const FileRow = React.memo(({ file, onTogglePrivacy, onShare, onDelete, onRename, onPreview, getFileIcon, formatBytes }) => {
    return (
        <tr key={file.id} className="animate-fade-in">
            <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {getFileIcon(file.type)}
                    <span style={{ fontWeight: 600 }}>{file.name}</span>
                </div>
            </td>
            <td>
                <span className={`badge ${file.sharingStatus === 'PUBLIC' ? 'badge-public' : 'badge-slate'}`}>
                    {file.sharingStatus === 'PUBLIC' ? <Globe size={12} /> : <Shield size={12} />}
                    <span style={{ marginLeft: '4px' }}>{file.sharingStatus}</span>
                </span>
            </td>
            <td style={{ color: '#a3a3a3' }}>{formatBytes(file.size)}</td>
            <td style={{ color: '#a3a3a3' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} />
                    {format(new Date(file.uploadTimestamp), 'MMM d, h:mm a')}
                </div>
            </td>
            <td>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button className="btn btn-outline" style={{ padding: '6px' }} onClick={() => onPreview(file)} title="Preview">
                        <Eye size={16} color="#ffffff" />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '6px' }} onClick={() => onRename(file)} title="Rename">
                        <Edit3 size={16} color="#ffffff" />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '6px' }} onClick={() => onTogglePrivacy(file)} title={file.sharingStatus === 'PRIVATE' ? 'Enable Public Access' : 'Disable Public Access'}>
                        {file.sharingStatus === 'PRIVATE' ? <Shield size={16} /> : <Globe size={16} color="#ffffff" />}
                    </button>
                    <button className="btn btn-outline" style={{ padding: '6px' }} onClick={() => onShare(file)} title="Share">
                        <Copy size={16} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '6px', color: '#ffffff', borderColor: '#333333' }} onClick={() => onDelete(file)} title="Delete Forever">
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
});

const SkeletonRow = () => (
    <tr>
        {Array(5).fill(0).map((_, i) => (
            <td key={i}>
                <div className="skeleton" style={{ height: '24px', width: i === 0 ? '70%' : '40%', borderRadius: '4px' }}></div>
            </td>
        ))}
    </tr>
);

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

    const fetchFiles = useCallback(async (isInitial = true) => {
        const identifier = user?.userId || user?.username || user?.attributes?.sub;
        if (!identifier || isFetchingRef.current) {
            if (!identifier && user) {
                logger.warn('User object found but no identifier detected', { user });
            }
            return;
        }

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
            const errorMessage = err.message || (err.errors ? err.errors[0]?.message : 'Unknown cloud error');
            logger.error('Failed to load vault library', { error: err, userId: identifier });
            toast.error(`Vault loading failed: ${errorMessage}`);
        } finally {
            setLoadingFiles(false);
            setLoadingMore(false);
            isFetchingRef.current = false;
        }
    }, [user?.userId, nextToken]);

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
            fetchFiles(true);
        }
    }, [user?.userId, user?.username, user?.attributes?.sub]);

    /**
     * Enhanced upload with retry logic
     */
    const delay = (ms) => new Promise(r => setTimeout(r, ms));

    const performUploadWithRetry = async (selectedFile, identifier, onProgress, maxRetries = 2) => {
        let attempt = 0;
        while (attempt <= maxRetries) {
            try {
                return await fileService.uploadFile(selectedFile, identifier, onProgress);
            } catch (err) {
                attempt++;
                if (attempt > maxRetries) throw err;
                logger.warn(`Upload attempt ${attempt} failed, retrying...`, { fileName: selectedFile.name });
                await delay(1000 * attempt);
            }
        }
    };

    const handleUpload = async (e) => {
        const identifier = user?.userId || user?.username || user?.attributes?.sub;
        const selectedFile = e.target.files[0];
        if (!selectedFile || !identifier) {
            if (selectedFile && !identifier) logger.error('Upload blocked: No user identifier');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        const uploadToastId = toast.loading(`Uploading ${selectedFile.name}...`);

        try {
            await performUploadWithRetry(selectedFile, identifier, (progress) => {
                setUploadProgress(progress);
            });
            toast.success('Upload complete', { id: uploadToastId });
            fetchFiles(true);
        } catch (err) {
            logger.error('Upload failed after retries', { error: err, fileName: selectedFile.name });
            toast.error(`Upload failed: ${err.message}. Please check your connection.`, { id: uploadToastId });
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
        const identifier = user?.userId || user?.username || user?.attributes?.sub;
        const file = showDeleteConfirm.file;
        if (!file || !identifier) return;

        const delId = toast.loading(`Deleting ${file.name}...`);
        try {
            await fileService.deleteFile(file, identifier);
            toast.success('File removed', { id: delId });
            setFiles(prev => prev.filter(f => f.id !== file.id));
        } catch (err) {
            toast.error('Deletion failed', { id: delId });
        } finally {
            setShowDeleteConfirm({ show: false, file: null });
        }
    };

    const handleTogglePrivacy = useCallback(async (file) => {
        const identifier = user?.userId || user?.username || user?.attributes?.sub;
        if (!identifier) {
            toast.error('Session expired. Please log in again.');
            return;
        }
        const toggleId = toast.loading('Syncing permissions...');
        try {
            const updated = await fileService.toggleFilePrivacy(file, identifier);
            toast.success(`Visibility updated`, { id: toggleId });
            setFiles(prev => prev.map(f => f.id === updated.id ? updated : f));
        } catch (err) {
            toast.error('Failed to update visibility', { id: toggleId });
        }
    }, [user?.userId, user?.username, user?.attributes?.sub]);

    const handleGenerateLink = useCallback(async (file, expiresIn) => {
        const identifier = user?.userId || user?.username || user?.attributes?.sub;
        if (!identifier) return;
        return await fileService.generateShareLink(file, identifier, expiresIn);
    }, [user?.userId, user?.username, user?.attributes?.sub]);

    const handleRename = async () => {
        const identifier = user?.userId || user?.username || user?.attributes?.sub;
        if (!renameModal.file || !renameModal.newName.trim() || !identifier) return;

        const renameId = toast.loading(`Renaming...`);
        try {
            const updated = await fileService.renameFile(renameModal.file, renameModal.newName, identifier);
            setFiles(prev => prev.map(f => f.id === updated.id ? { ...f, name: updated.name } : f));
            toast.success('Rename successful', { id: renameId });
            setRenameModal({ isOpen: false, file: null, newName: '' });
        } catch (err) {
            toast.error('Rename failed', { id: renameId });
        }
    };

    const getFileIcon = useCallback((type) => {
        if (type.includes('image')) return <ImageIcon size={20} color="#ffffff" />;
        if (type.includes('video')) return <Video size={20} color="#ffffff" />;
        if (type.includes('pdf')) return <FileText size={20} color="#ffffff" />;
        if (type.includes('javascript') || type.includes('json') || type.includes('html')) return <FileCode size={20} color="#ffffff" />;
        return <File size={20} color="#a3a3a3" />;
    }, []);

    const formatBytes = useCallback((bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }, []);

    const filteredFiles = useMemo(() => {
        let processed = [...files];
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            processed = processed.filter(f => f.name.toLowerCase().includes(query));
        }
        processed.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];
            if (sortConfig.key === 'uploadTimestamp') {
                valA = new Date(valA); valB = new Date(valB);
            }
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return processed;
    }, [files, searchQuery, sortConfig]);

    const requestSort = (key) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };

    return (
        <div className="file-system-container">
            <div className="table-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div className="search-input-wrapper">
                    <Search className="search-icon" size={18} color="#a3a3a3" style={{ position: 'absolute', left: '12px' }} />
                    <input
                        type="text"
                        placeholder="Search workspace..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="action-buttons" style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-outline" onClick={() => fetchFiles(true)} disabled={loadingFiles}>
                        <RefreshCw size={18} className={loadingFiles ? 'animate-spin' : ''} />
                    </button>
                    <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                        <Upload size={18} />
                        <span className="hide-mobile">{isUploading ? 'Uploading...' : 'Upload New'}</span>
                        <input type="file" onChange={handleUpload} hidden disabled={isUploading} />
                    </label>
                </div>
            </div>

            {isUploading && (
                <div style={{ padding: '0 1.5rem 1.5rem' }}>
                    <div style={{ height: '6px', background: '#333333', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
                        <div style={{ height: '100%', background: '#ffffff', width: `${uploadProgress}%`, transition: 'width 0.3s ease' }}></div>
                        <div style={{ position: 'absolute', right: 0, top: '-20px', fontSize: '0.75rem', fontWeight: 600, color: '#ffffff' }}>{uploadProgress}%</div>
                    </div>
                </div>
            )}

            <div className="table-wrapper">
                <table className="glass-table">
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Document Name
                                    {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="fade-in" /> : <ChevronDown size={14} className="fade-in" />)}
                                </div>
                            </th>
                            <th onClick={() => requestSort('sharingStatus')} style={{ cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Security Status
                                    {sortConfig.key === 'sharingStatus' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="fade-in" /> : <ChevronDown size={14} className="fade-in" />)}
                                </div>
                            </th>
                            <th onClick={() => requestSort('size')} style={{ cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Encryption Size
                                    {sortConfig.key === 'size' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="fade-in" /> : <ChevronDown size={14} className="fade-in" />)}
                                </div>
                            </th>
                            <th onClick={() => requestSort('uploadTimestamp')} style={{ cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Modified
                                    {sortConfig.key === 'uploadTimestamp' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="fade-in" /> : <ChevronDown size={14} className="fade-in" />)}
                                </div>
                            </th>
                            <th style={{ textAlign: 'right' }}>Vault Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loadingFiles ? (
                            Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                        ) : filteredFiles.length === 0 ? (
                            <tr>
                                <td colSpan="5">
                                    <div style={{ padding: '5rem 0', textAlign: 'center' }}>
                                        <div style={{ display: 'inline-flex', padding: '1.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '24px', marginBottom: '1.5rem', border: '1px solid #333333' }}>
                                            <FileText size={48} color="#ffffff" opacity="0.5" />
                                        </div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                            {searchQuery ? 'No match found' : 'Secure Vault Empty'}
                                        </h3>
                                        <p style={{ color: '#a3a3a3', maxWidth: '300px', margin: '0 auto 1.5rem' }}>
                                            {searchQuery ? `We couldn't find items matching "${searchQuery}"` : 'Your encrypted library is empty. Start by uploading a secure file.'}
                                        </p>
                                        {!searchQuery && (
                                            <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                                                <Plus size={18} />
                                                Click to Upload
                                                <input type="file" onChange={handleUpload} hidden />
                                            </label>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredFiles.map((file) => (
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
                            ))
                        )}
                    </tbody>
                </table>

                {nextToken && !loadingFiles && (
                    <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <button className="btn btn-outline" onClick={() => fetchFiles(false)} disabled={loadingMore}>
                            {loadingMore ? 'Decrypting more...' : 'Load more items'}
                        </button>
                    </div>
                )}
            </div>

            {/* Modals integrated as before but with polished UI */}
            {renameModal.isOpen && (
                <div className="modal-overlay" onClick={() => setRenameModal({ isOpen: false, file: null, newName: '' })}>
                    <div className="stat-card animate-fade-in" style={{ width: '400px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: '#333333', padding: '10px', borderRadius: '10px' }}>
                                <Edit3 size={24} color="#ffffff" />
                            </div>
                            <h3 style={{ margin: 0 }}>Rename Metadata</h3>
                        </div>
                        <input
                            type="text"
                            className="search-input"
                            style={{ width: '100%', marginBottom: '2rem' }}
                            value={renameModal.newName}
                            onChange={(e) => setRenameModal(prev => ({ ...prev, newName: e.target.value }))}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={() => setRenameModal({ isOpen: false, file: null, newName: '' })}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleRename}>Update Name</button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirm.show && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm({ show: false, file: null })}>
                    <div className="stat-card animate-fade-in" style={{ width: '400px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: '#ffffff' }}>
                            <AlertTriangle size={32} />
                            <h3 style={{ margin: 0 }}>Secure Deletion</h3>
                        </div>
                        <p style={{ color: '#a3a3a3', fontSize: '0.875rem', marginBottom: '2rem' }}>
                            This will permanently remove <strong>{showDeleteConfirm.file?.name}</strong> from your secure vault. This action cannot be reversed.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={() => setShowDeleteConfirm({ show: false, file: null })}>Keep File</button>
                            <button className="btn btn-primary" style={{ background: '#ffffff', color: 'black' }} onClick={handleDelete}>Delete Forever</button>
                        </div>
                    </div>
                </div>
            )}

            <ShareModal isOpen={shareModal.isOpen} file={shareModal.file} onClose={() => setShareModal({ isOpen: false, file: null })} onGenerate={handleGenerateLink} />
            <FilePreviewModal isOpen={previewModal.isOpen} file={previewModal.file} onClose={() => setPreviewModal({ isOpen: false, file: null })} getUrl={handleGenerateLink} />

            <style>{`
                .hide-mobile { display: inline; }
                @media (max-width: 600px) { .hide-mobile { display: none; } }
            `}</style>
        </div>
    );
};

export default FileUpload;
