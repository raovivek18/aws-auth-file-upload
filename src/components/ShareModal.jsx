import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import logger from '../services/loggerService';
import shareService from '../services/shareService';
import { Mail, Shield, UserX, UserCheck } from 'lucide-react';
import './ShareModal.css';

const ShareModal = ({ isOpen, onClose, file, onGenerate }) => {
    const [shareUrl, setShareUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const [existingShares, setExistingShares] = useState([]);
    const [isLoadingShares, setIsLoadingShares] = useState(false);

    // 5 mins for private, 1 hour for public (max limit for AWS Cognito STS temporary credentials)
    const PRIVATE_EXPIRY = 300;
    const PUBLIC_EXPIRY = 3600;

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

    useEffect(() => {
        if (isOpen && file?.id) {
            fetchExistingShares();
        }
    }, [isOpen, file?.id]);

    const fetchExistingShares = async () => {
        try {
            setIsLoadingShares(true);
            const shares = await shareService.getFileShares(file.id);
            setExistingShares(shares);
        } catch (error) {
            logger.error('Failed to fetch shares', error);
        } finally {
            setIsLoadingShares(false);
        }
    };

    const handleEmailShare = async (e) => {
        e.preventDefault();
        if (!recipientEmail || !recipientEmail.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }

        setIsSharing(true);
        try {
            await shareService.shareFile(file, recipientEmail.trim().toLowerCase());
            toast.success(`Access granted to ${recipientEmail}`);
            setRecipientEmail('');
            fetchExistingShares();
        } catch (err) {
            toast.error(err.message || 'Sharing failed');
        } finally {
            setIsSharing(false);
        }
    };

    const handleRevoke = async (shareId, email) => {
        try {
            await shareService.revokeAccess(shareId);
            toast.success(`Access revoked for ${email}`);
            fetchExistingShares();
        } catch (err) {
            toast.error('Revoke failed');
        }
    };

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
            logger.error(err, {
                action: 'share_link_generation_failure',
                fileId: file.id,
                fileName: file.name
            });
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
                                {isGenerating ? 'Generating...' : `Generate ${isPublic ? '1-Hour' : '5-Minute'} Link`}
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

                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                        <h4 style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Mail size={16} /> Direct Access
                        </h4>
                        <form onSubmit={handleEmailShare}>
                            <div className="copy-input-group">
                                <input
                                    type="email"
                                    placeholder="Enter colleague's email..."
                                    value={recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                    className="share-input"
                                    style={{ background: '#f8fafc' }}
                                />
                                <button type="submit" className="copy-btn" disabled={isSharing} style={{ background: '#6366f1', color: 'white' }}>
                                    {isSharing ? 'Sharing...' : 'Share Access'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shield size={16} /> Access Management
                        </h4>
                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {isLoadingShares ? (
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Checking permissions...</p>
                            ) : existingShares.length === 0 ? (
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No direct shares active for this file.</p>
                            ) : (
                                existingShares.map(share => (
                                    <div key={share.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <UserCheck size={14} color="#10b981" />
                                            <span style={{ fontSize: '0.8125rem' }}>{share.sharedWith}</span>
                                        </div>
                                        <button
                                            onClick={() => handleRevoke(share.id, share.sharedWith)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', padding: '4px', cursor: 'pointer', borderRadius: '4px' }}
                                            title="Revoke Access"
                                        >
                                            <UserX size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
