import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import fileService from '../services/fileService';
import './FileUpload.css';

const FileUpload = () => {
    const { user } = useAuth();
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loadingFiles, setLoadingFiles] = useState(true);

    // Fetch files on mount
    const fetchFiles = useCallback(async () => {
        if (!user?.userId) return;
        setLoadingFiles(true);
        try {
            const items = await fileService.listFiles(user.userId);
            setFiles(items);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch file list');
        } finally {
            setLoadingFiles(false);
        }
    }, [user?.userId]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const handleUpload = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setIsUploading(true);
        setError(null);
        setSuccess(null);

        try {
            await fileService.uploadFile(selectedFile, user.userId);
            setSuccess(`Successfully uploaded ${selectedFile.name}`);
            fetchFiles(); // Refresh list
        } catch (err) {
            setError(err.message);
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDelete = async (key) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;

        try {
            await fileService.deleteFile(key);
            setSuccess('File deleted successfully');
            fetchFiles();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleShare = async (key) => {
        try {
            const url = await fileService.generateShareLink(key);
            window.open(url, '_blank');
        } catch (err) {
            setError(err.message);
        }
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <div className="file-system-container">
            <div className="upload-section card">
                <h3>Upload New File</h3>
                <p className="subtitle">Securely store your documents in your private folder.</p>

                <div className={`dropzone ${isUploading ? 'uploading' : ''}`}>
                    <input
                        type="file"
                        id="fileInput"
                        onChange={handleUpload}
                        disabled={isUploading}
                        hidden
                    />
                    <label htmlFor="fileInput" className="upload-label">
                        {isUploading ? (
                            <div className="spinner-container">
                                <div className="spinner"></div>
                                <p>Uploading your file...</p>
                            </div>
                        ) : (
                            <>
                                <i className="upload-icon">↑</i>
                                <p>Click to browse or drop a file here</p>
                                <span className="format-info">Max size: 10MB</span>
                            </>
                        )}
                    </label>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
            </div>

            <div className="files-section card">
                <div className="section-header">
                    <h3>Your Files</h3>
                    <button className="btn-refresh" onClick={fetchFiles} disabled={loadingFiles}>
                        {loadingFiles ? 'Refreshing...' : '↻'}
                    </button>
                </div>

                {loadingFiles ? (
                    <div className="loading-state">
                        <div className="pulse-loader"></div>
                        <p>Loading your vault...</p>
                    </div>
                ) : files.length === 0 ? (
                    <div className="empty-state">
                        <p>No files uploaded yet. Start by uploading something above!</p>
                    </div>
                ) : (
                    <div className="file-grid">
                        {files.map((file) => (
                            <div key={file.key} className="file-item">
                                <div className="file-info">
                                    <span className="file-name">{file.key.split('/').pop()}</span>
                                    <span className="file-meta">
                                        {formatBytes(file.size)} • {file.lastModified ? new Date(file.lastModified).toLocaleDateString() : 'Unknown date'}
                                    </span>
                                </div>
                                <div className="file-actions">
                                    <button
                                        className="btn-action view"
                                        onClick={() => handleShare(file.key)}
                                        title="View/Download"
                                    >
                                        👁
                                    </button>
                                    <button
                                        className="btn-action delete"
                                        onClick={() => handleDelete(file.key)}
                                        title="Delete"
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;
