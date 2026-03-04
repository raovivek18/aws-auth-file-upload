import { uploadData, remove, getUrl } from 'aws-amplify/storage';
import { fetchAuthSession } from 'aws-amplify/auth';
import metadataService from './metadataService';
import activityService from './activityService';
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
            // This ensures files are stored under /private/{identityId}/ and enforced by IAM
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
                key: s3Key, // Store the local key, accessLevel handles the prefix
                owner: userId,
                sharingStatus: 'PRIVATE'
            });

            // 6. Log Activity
            await activityService.logActivity('File uploaded', metadata.id, file.name);

            return { key: s3Key, metadata };
        } catch (error) {
            console.error('Error during file upload process:', error);
            throw new Error(error.message || 'Failed to upload file.');
        }
    },

    /**
     * Lists files from the Metadata service (DynamoDB)
     */
    listFiles: async (userId, limit = 10, nextToken = null) => {
        try {
            const { items, nextToken: newNextToken } = await metadataService.getUserFiles(userId, limit, nextToken);
            // No need to sort here if using the index with sortDirection: 'DESC'
            return { items, nextToken: newNextToken };
        } catch (error) {
            logger.error('Error listing files:', error);
            throw new Error('Failed to fetch file list.');
        }
    },

    /**
     * Deletes a file from storage and its corresponding metadata
     */
    deleteFile: async (file, currentUserId) => {
        // Security Check: Ensure only owner can delete
        if (file.owner !== currentUserId) {
            throw new Error('Authorization failed: You do not own this file.');
        }

        try {
            // 1. Delete from S3 using 'private' access level
            await remove({
                key: file.key,
                options: { accessLevel: 'private' }
            });

            // 2. Delete metadata from DynamoDB
            if (file.id) {
                await metadataService.deleteMetadata(file.id);
            }

            // 3. Log Activity
            await activityService.logActivity('File deleted', file.id, file.name);
        } catch (error) {
            console.error('Error deleting file:', error);
            throw new Error(error.message || 'Failed to delete file.');
        }
    },

    /**
     * Toggles file privacy between PUBLIC and PRIVATE
     */
    toggleFilePrivacy: async (file, currentUserId) => {
        // Security Check: Ensure only owner can change settings
        if (file.owner !== currentUserId) {
            throw new Error('Authorization failed: You do not own this file.');
        }

        try {
            const newStatus = file.sharingStatus === 'PRIVATE' ? 'PUBLIC' : 'PRIVATE';
            const updatedMetadata = await metadataService.updateSharing(file.id, newStatus, null);

            const action = newStatus === 'PUBLIC' ? 'Public access enabled' : 'Public access disabled';
            await activityService.logActivity(action, file.id, file.name);

            return updatedMetadata;
        } catch (error) {
            console.error('Error toggling privacy:', error);
            throw new Error('Failed to update sharing settings.');
        }
    },

    generateShareLink: async (file, currentUserId, expiresIn = 3600) => {
        try {
            // Debugging owner match
            if (file.owner !== currentUserId) {
                logger.warn('Unauthorized link generation attempt', {
                    fileId: file.id,
                    fileOwner: file.owner,
                    accessor: currentUserId
                });
                throw new Error('Authorization failed: Only owners can generate share links.');
            }

            const getUrlResult = await getUrl({
                key: file.key,
                options: {
                    accessLevel: 'private',
                    expiresIn,
                    // If validateObjectExistence is true, it verifies the file exists in S3.
                    // This can sometimes fail if the identity ID has changed.
                    validateObjectExistence: true
                }
            });

            if (!getUrlResult?.url) {
                throw new Error('Storage service returned an empty URL.');
            }

            await activityService.logActivity('Share link generated', file.id, file.name);
            return getUrlResult.url.toString();
        } catch (error) {
            logger.error('Error generating share link:', {
                error,
                fileId: file.id,
                accessLevel: 'private'
            });
            throw new Error(error.message || 'Failed to generate share link.');
        }
    },

    /**
     * Renames a file's metadata display name
     */
    renameFile: async (file, newName, currentUserId) => {
        // Security Check: Ensure only owner can rename
        if (file.owner !== currentUserId) {
            throw new Error('Authorization failed: You do not own this file.');
        }

        if (!newName || newName.trim() === '') {
            throw new Error('File name cannot be empty.');
        }

        try {
            const updatedMetadata = await metadataService.renameMetadata(file.id, newName.trim());

            // Log activity
            await activityService.logActivity('File renamed', file.id, `From: ${file.name} To: ${newName}`);

            return updatedMetadata;
        } catch (error) {
            console.error('Error renaming file:', error);
            throw new Error('Failed to rename file.');
        }
    }
};

export default fileService;
