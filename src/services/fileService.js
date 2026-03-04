import { uploadData, remove, getUrl } from 'aws-amplify/storage';
import metadataService from './metadataService';
import activityService from './activityService';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // Increased to 100MB for testing, Amplify handles larger via multipart

/**
 * Service for handling file operations with AWS Amplify Storage (v6+)
 * and Metadata tracking via DynamoDB
 */
const fileService = {
    /**
     * Uploads a file to S3 and saves its metadata to DynamoDB
     * @param {File} file - The file object to upload
     * @param {string} userId - The unique ID of the user
     * @param {Function} onProgress - Optional callback for upload progress
     * @returns {Promise<Object>} - The result containing S3 key and metadata
     */
    uploadFile: async (file, userId, onProgress) => {
        if (!file) {
            throw new Error('Please select a file to upload.');
        }

        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds the limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
        }

        // 0. Check for duplicates
        const exists = await metadataService.checkFileExists(file.name, userId);
        if (exists) {
            throw new Error(`A file named "${file.name}" already exists in your vault.`);
        }

        // Clean filename but keep it recognizable
        const cleanFileName = file.name.replace(/\s+/g, '_');
        const key = `${userId}/${Date.now()}-${cleanFileName}`;

        try {
            // 1. Upload to S3 with progress tracking
            const uploadOperation = uploadData({
                key,
                data: file,
                options: {
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

            // 2. Save metadata to DynamoDB
            const metadata = await metadataService.saveMetadata({
                name: file.name,
                size: file.size,
                type: file.type,
                key: key,
                owner: userId,
                sharingStatus: 'PRIVATE'
            });

            // 3. Log Activity
            await activityService.logActivity('File uploaded', metadata.id, file.name);

            return { key, metadata };
        } catch (error) {
            console.error('Error during file upload process:', error);
            const errorMsg = error.message || 'Failed to upload file.';
            throw new Error(errorMsg);
        }
    },

    /**
     * Lists files from the Metadata service (DynamoDB) with pagination
     */
    listFiles: async (limit = 10, nextToken = null) => {
        try {
            const { items, nextToken: newNextToken } = await metadataService.getUserFiles(limit, nextToken);

            // Sort by upload timestamp (newest first)
            const sortedItems = items.sort((a, b) =>
                new Date(b.uploadTimestamp) - new Date(a.uploadTimestamp)
            );

            return { items: sortedItems, nextToken: newNextToken };
        } catch (error) {
            console.error('Error listing files from metadata:', error);
            throw new Error(error.message || 'Failed to fetch file list.');
        }
    },

    /**
     * Deletes a file from storage and its corresponding metadata
     */
    deleteFile: async (file) => {
        try {
            // 1. Delete from S3
            await remove({ key: file.key });

            // 2. Delete metadata from DynamoDB
            if (file.id) {
                await metadataService.deleteMetadata(file.id);
            }

            // 3. Log Activity
            await activityService.logActivity('File deleted', file.id, file.name);
        } catch (error) {
            console.error('Error deleting file or metadata:', error);
            throw new Error(error.message || 'Failed to delete file.');
        }
    },

    /**
     * Toggles file privacy between PUBLIC and PRIVATE
     */
    toggleFilePrivacy: async (file) => {
        try {
            const newStatus = file.sharingStatus === 'PRIVATE' ? 'PUBLIC' : 'PRIVATE';
            const expiration = null;

            const updatedMetadata = await metadataService.updateSharing(file.id, newStatus, expiration);

            // Log activity
            const action = newStatus === 'PUBLIC' ? 'Public access enabled' : 'Public access disabled';
            await activityService.logActivity(action, file.id, file.name);

            return updatedMetadata;
        } catch (error) {
            console.error('Error toggling privacy:', error);
            throw new Error('Failed to update sharing settings.');
        }
    },

    /**
     * Generates a temporary pre-signed URL for sharing/viewing
     */
    generateShareLink: async (file, expiresIn = 3600) => {
        try {
            const getUrlResult = await getUrl({
                key: file.key,
                options: {
                    expiresIn,
                    validateObjectExistence: true
                }
            });

            // Log activity
            await activityService.logActivity('Share link generated', file.id, file.name);

            return getUrlResult.url.toString();
        } catch (error) {
            console.error('Error generating share link:', error);
            throw new Error(error.message || 'Failed to generate share link.');
        }
    }
};

export default fileService;
