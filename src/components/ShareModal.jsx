import React, { useState, useEffect } from 'react';
import './ShareModal.css';

const ShareModal = ({ isOpen, onClose, fileKey, onGenerate }) => {
    const [shareUrl, setShareUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const EXPIRATION_TIME = 300; // 5 minutes in seconds

    useEffect(() => {
        let timer;
        if (shareUrl && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && shareUrl) {
            setShareUrl(''); // Clear expired link
        }
        return () => clearInterval(timer);
    }, [shareUrl, timeLeft]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const url = await onGenerate(fileKey, EXPIRATION_TIME);
            setShareUrl(url);
            setTimeLeft(EXPIRATION_TIME);
            setCopied(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    const fileName = fileKey.split('/').pop();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Secure Sharing</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="file-preview">
                        <span className="file-icon">📄</span>
                        <div className="file-details">
                            <span className="file-name">{fileName}</span>
                            <span className="file-status">Private S3 Access</span>
                        </div>
                    </div>

                    {!shareUrl ? (
                        <div className="generate-state">
                            <p>Generate a time-limited pre-signed URL to share this file securely.</p>
                            <button
                                className="btn-primary"
                                onClick={handleGenerate}
                                disabled={isGenerating}
                            >
                                {isGenerating ? 'Generating...' : 'Generate 5-Minute Link'}
                            </button>
                        </div>
                    ) : (
                        <div className="link-state">
                            <div className="timer-badge">
                                Expiring in: <span className="countdown">{formatTime(timeLeft)}</span>
                            </div>
                            <div className="copy-input-group">
                                <input
                                    type="text"
                                    value={shareUrl}
                                    readOnly
                                    className="share-input"
                                />
                                <button className="copy-btn" onClick={copyToClipboard}>
                                    {copied ? '✓ Copied' : 'Copy'}
                                </button>
                            </div>
                            <p className="security-note">
                                This link grants temporary access using AWS Signature V4.
                                The file remains private in your S3 bucket.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
