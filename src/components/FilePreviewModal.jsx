import React, { useState, useEffect } from 'react';
import { X, Download, Maximize2, FileText, ImageIcon } from 'lucide-react';
import logger from '../services/loggerService';
import './ShareModal.css';

const FilePreviewModal = ({ isOpen, onClose, file, getUrl }) => {
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && file) {
            loadPreview();
        } else {
            setPreviewUrl('');
            setError('');
        }
    }, [isOpen, file]);

    const loadPreview = async () => {
        setLoading(true);
        setError('');
        try {
            // Generate a short-lived URL for preview
            const url = await getUrl(file, 600); // 10 mins
            setPreviewUrl(url);
        } catch (err) {
            logger.error('Preview generation error', { error: err, fileId: file?.id });
            setError('Failed to generate preview. You can still download the file.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !file) return null;

    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
            <div className="modal-content glass-card preview-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '90%' }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isImage ? <ImageIcon size={20} color="#6366f1" /> : <FileText size={20} color="#ef4444" />}
                        <h3 style={{ margin: 0 }}>{file.name}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn btn-outline" onClick={() => window.open(previewUrl, '_blank')} title="Open in new tab">
                            <Maximize2 size={18} />
                        </button>
                        <button className="close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="modal-body" style={{ minHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', borderRadius: '8px', overflow: 'hidden' }}>
                    {loading ? (
                        <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #6366f1' }}></div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <p style={{ color: '#ef4444' }}>{error}</p>
                        </div>
                    ) : isImage ? (
                        <img src={previewUrl} alt={file.name} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '4px' }} />
                    ) : isPDF ? (
                        <iframe src={`${previewUrl}#toolbar=0`} title={file.name} style={{ width: '100%', height: '70vh', border: 'none' }} />
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>
                            <FileText size={64} color="#94a3b8" />
                            <p style={{ marginTop: '1rem', color: '#64748b' }}>Preview not available for this file type.</p>
                            <button className="btn btn-primary" onClick={() => window.open(previewUrl)}>
                                <Download size={18} /> Download File
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilePreviewModal;
