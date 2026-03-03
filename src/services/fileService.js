import { uploadData, remove, getUrl } from 'aws-amplify/storage';
import metadataService from './metadataService';
import activityService from './activityService';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

/**
 * Service for handling file operations with AWS Amplify Storage (v6+)
 * and Metadata tracking via DynamoDB
 */
const fileService = {
    /**
     * Uploads a file to S3 and saves its metadata to DynamoDB
     * @param {File} file - The file object to upload
     * @param {string} userId - The unique ID of the user
     * @returns {Promise<Object>} - The result containing S3 key and metadata
     */
    uploadFile: async (file, userId) => {
        if (!file) {
            throw new Error('Please select a file to upload.');
        }

        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds the 10MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
        }

        // Clean filename and add timestamp to avoid collisions
        const cleanFileName = file.name.replace(/\s+/g, '_').toLowerCase();
        // In Amplify v6, we use specific access levels if needed, or stick to public/ prefix for shared logic
        const key = `${userId}/${Date.now()}-${cleanFileName}`;

        try {
            // 1. Upload to S3 (Defaults to public access level if not specified)
            const uploadOperation = uploadData({
                key, // key: 'public/' + key is implied if level is public
                data: file,
                options: {
                    contentType: file.type,
                    onProgress: ({ transferredBytes, totalBytes }) => {
                        if (totalBytes) {
                            console.log(`Upload progress: ${Math.round((transferredBytes / totalBytes) * 100)}%`);
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
            // Re-throw with more detail if possible
            const errorMsg = error.message || 'Failed to upload file or save metadata.';
            throw new Error(errorMsg);
        }
    },

    /**
     * Lists files from the Metadata service (DynamoDB)
     */
    listFiles: async () => {
        try {
            const items = await metadataService.getUserFiles();

            // Sort by upload timestamp (newest first)
            return items.sort((a, b) =>
                new Date(b.uploadTimestamp) - new Date(a.uploadTimestamp)
            );
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
