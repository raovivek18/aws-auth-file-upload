import { uploadData, remove, getUrl } from 'aws-amplify/storage';
import metadataService from './metadataService';
import activityService from './activityService';
import analyticsService from './analyticsService';
import logger from './loggerService';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB limit for security
const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', // Images
    'application/pdf', // PDFs
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/plain' // .txt
];

/**
 * Service for handling file operations with AWS Amplify Storage (v6+)
 * and Metadata tracking via DynamoDB
 */
const fileService = {
    /**
     * Uploads a file to S3 and saves its metadata to DynamoDB
     */
    uploadFile: async (file, userId, onProgress) => {
        if (!file) {
            throw new Error('Please select a file to upload.');
        }

        // 1. Security Validation: File Type
        if (!ALLOWED_TYPES.includes(file.type)) {
            throw new Error('Invalid file type. Only images, PDFs, and documents are allowed.');
        }

        // 2. Security Validation: File Size
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds the 20MB security limit.`);
        }

        // 3. Check for duplicates
        const exists = await metadataService.checkFileExists(file.name, userId);
        if (exists) {
            throw new Error(`A file named "${file.name}" already exists in your vault.`);
        }

        // Clean filename and create a unique S3 key within the user's private space
        const cleanFileName = file.name.replace(/\s+/g, '_');
        const s3Key = `${Date.now()}-${cleanFileName}`;

        try {
            // 4. Upload to S3 with 'private' access level
            const uploadOperation = uploadData({
                key: s3Key,
                data: file,
                options: {
                    accessLevel: 'private',
                    contentType: file.type,
                    onProgress: (progress) => {
                        if (onProgress && progress.totalBytes) {
                            const percent = Math.round((progress.transferredBytes / progress.totalBytes) * 100);
                            onProgress(percent);
                        }
                    },
                }
            });

            await uploadOperation.result;

            // 5. Save metadata to DynamoDB
            const metadata = await metadataService.saveMetadata({
                name: file.name,
                size: file.size,
                type: file.type,
                key: s3Key,
                userId: userId, // Ensure we use the passed userId for metadata
                sharingStatus: 'PRIVATE'
            });

            // 6. Log Activity
            await activityService.logActivity('File uploaded', metadata.id, file.name);

            // 7. Record Analytics
            await analyticsService.recordUpload(file.size);

            return { key: s3Key, metadata };
        } catch (error) {
            logger.error(error, {
                action: 'file_upload_failure',
                fileName: file.name,
                userId
            });
            throw new Error(error.message || 'Failed to upload file.');
        }
    },

    /**
     * Lists files from the Metadata service (DynamoDB)
     */
    listFiles: async (userId, limit = 10, nextToken = null) => {
        try {
            const { items, nextToken: newNextToken } = await metadataService.getUserFiles(userId, limit, nextToken);
            return { items, nextToken: newNextToken };
        } catch (error) {
            logger.error('Error listing files:', error);
            throw error; // Rethrow to let the caller handle it
        }
    },

    /**
     * Deletes a file from storage and its corresponding metadata
     */
    deleteFile: async (file, currentUserId) => {
        if (file.userId !== currentUserId) {
            throw new Error('Authorization failed: You do not own this file.');
        }

        try {
            await remove({
                key: file.key,
                options: { accessLevel: 'private' }
            });

            if (file.id) {
                await metadataService.deleteMetadata(file.id);
            }

            await activityService.logActivity('File deleted', file.id, file.name);

            // 3. Record Analytics
            await analyticsService.recordDeletion(file.size);
        } catch (error) {
            logger.error(error, {
                action: 'file_delete_failure',
                fileId: file.id,
                currentUserId
            });
            throw new Error(error.message || 'Failed to delete file.');
        }
    },

    /**
     * Toggles file privacy
     */
    toggleFilePrivacy: async (file, currentUserId) => {
        if (file.userId !== currentUserId) {
            throw new Error('Authorization failed: You do not own this file.');
        }

        try {
            const newStatus = file.sharingStatus === 'PRIVATE' ? 'PUBLIC' : 'PRIVATE';
            const updatedMetadata = await metadataService.updateSharing(file.id, newStatus, null);

            const action = newStatus === 'PUBLIC' ? 'Public access enabled' : 'Public access disabled';
            await activityService.logActivity(action, file.id, file.name);

            return updatedMetadata;
        } catch (error) {
            logger.error(error, {
                action: 'toggle_privacy_failure',
                fileId: file.id,
                currentUserId
            });
            throw new Error('Failed to update sharing settings.');
        }
    },

    generateShareLink: async (file, currentUserId, expiresIn = 3600) => {
        try {
            if (file.userId !== currentUserId) {
                throw new Error('Authorization failed: Only owners can generate share links.');
            }

            const getUrlResult = await getUrl({
                key: file.key,
                options: {
                    accessLevel: 'private',
                    expiresIn,
                    validateObjectExistence: true
                }
            });

            if (!getUrlResult?.url) {
                throw new Error('Storage service returned an empty URL.');
            }

            await activityService.logActivity('Share link generated', file.id, file.name);

            // Record Analytics
            await analyticsService.recordShare();
            return getUrlResult.url.toString();
        } catch (error) {
            logger.error('Error generating share link:', {
                error,
                fileId: file.id
            });
            throw error;
        }
    },

    /**
     * Renames a file's metadata
     */
    renameFile: async (file, newName, currentUserId) => {
        if (file.userId !== currentUserId) {
            throw new Error('Authorization failed: You do not own this file.');
        }

        if (!newName || newName.trim() === '') {
            throw new Error('File name cannot be empty.');
        }

        try {
            const updatedMetadata = await metadataService.renameMetadata(file.id, newName.trim());
            await activityService.logActivity('File renamed', file.id, `From: ${file.name} To: ${newName}`);
            return updatedMetadata;
        } catch (error) {
            logger.error(error, {
                action: 'file_rename_failure',
                fileId: file.id,
                newName,
                currentUserId
            });
            throw new Error('Failed to rename file.');
        }
    }
};

export default fileService;
