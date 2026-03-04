import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import './ShareModal.css';

const ShareModal = ({ isOpen, onClose, file, onGenerate }) => {
    const [shareUrl, setShareUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    // 5 mins for private, 24 hours for public (simulation)
    const PRIVATE_EXPIRY = 300;
    const PUBLIC_EXPIRY = 86400;

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
        if (!file?.key) return;

        setIsGenerating(true);
        try {
            const expiry = file.sharingStatus === 'PUBLIC' ? PUBLIC_EXPIRY : PRIVATE_EXPIRY;
            const url = await onGenerate(file, expiry);
            setShareUrl(url);
            setTimeLeft(expiry);
            setCopied(false);
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Failed to generate link');
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
        if (seconds > 3600) {
            const hours = Math.floor(seconds / 3600);
            return `${hours}h remaining`;
        }
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen || !file) return null;

    const isPublic = file.sharingStatus === 'PUBLIC';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{isPublic ? '🌐 Public Sharing' : '🔒 Private Sharing'}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="file-preview">
                        <span className="file-icon">{isPublic ? '🌍' : '📄'}</span>
                        <div className="file-details">
                            <span className="file-name">{file.name}</span>
                            <span className={`file-status ${file.sharingStatus?.toLowerCase()}`}>
                                {isPublic ? 'Anyone with link can view' : 'Only you can access (Private)'}
                            </span>
                        </div>
                    </div>

                    {!shareUrl ? (
                        <div className="generate-state">
                            <p>
                                {isPublic
                                    ? 'Generate a long-lived link for this public file.'
                                    : 'Generate a secure, time-limited link for this private file.'}
                            </p>
                            <button
                                className={`btn-primary ${isPublic ? 'public' : 'private'}`}
                                onClick={handleGenerate}
                                disabled={isGenerating}
                            >
                                {isGenerating ? 'Generating...' : `Generate ${isPublic ? '24-Hour' : '5-Minute'} Link`}
                            </button>
                        </div>
                    ) : (
                        <div className="link-state">
                            <div className="timer-badge">
                                {isPublic ? 'Link is active' : 'Expiring in'}: <span className="countdown">{formatTime(timeLeft)}</span>
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
                                {isPublic
                                    ? 'This link uses a long-lived S3 signature. Sharing this link allows anyone to view the file.'
                                    : 'This link uses a temporary AWS Signature V4. The file remains strictly private.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
