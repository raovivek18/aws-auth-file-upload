import { uploadData, list, remove, getUrl } from 'aws-amplify/storage';
import metadataService from './metadataService';

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
        const key = `${userId}/${Date.now()}-${cleanFileName}`;

        try {
            // 1. Upload to S3
            const uploadOperation = uploadData({
                key,
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

            return { key, metadata };
        } catch (error) {
            console.error('Error during file upload process:', error);
            throw new Error(error.message || 'Failed to upload file or save metadata.');
        }
    },

    /**
     * Lists files from the Metadata service (DynamoDB) instead of S3 listing
     * This is faster, more scalable, and provides rich metadata like sharing status.
     * @returns {Promise<Array>} - List of file metadata
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
            // Fallback to S3 list if needed, but here we strictly use metadata
            throw new Error(error.message || 'Failed to fetch file list.');
        }
    },

    /**
     * Deletes a file from storage and its corresponding metadata
     * @param {string} key - The S3 object key
     * @param {string} metadataId - The DynamoDB record ID
     */
    deleteFile: async (key, metadataId) => {
        try {
            // 1. Delete from S3
            await remove({ key });

            // 2. Delete metadata from DynamoDB
            if (metadataId) {
                await metadataService.deleteMetadata(metadataId);
            }
        } catch (error) {
            console.error('Error deleting file or metadata:', error);
            throw new Error(error.message || 'Failed to delete file.');
        }
    },

    /**
     * Toggles file privacy between PUBLIC and PRIVATE
     * @param {Object} file - The file metadata object
     * @returns {Promise<Object>} - Updated metadata
     */
    toggleFilePrivacy: async (file) => {
        try {
            const newStatus = file.sharingStatus === 'PRIVATE' ? 'PUBLIC' : 'PRIVATE';
            // If making public, we might want to set a default "long" expiration or clear it
            const expiration = newStatus === 'PUBLIC' ? null : null;

            return await metadataService.updateSharing(file.id, newStatus, expiration);
        } catch (error) {
            console.error('Error toggling privacy:', error);
            throw new Error('Failed to update sharing settings.');
        }
    },

    /**
     * Generates a temporary pre-signed URL for sharing/viewing
     * @param {string} key - The full key of the file
     * @param {number} expiresIn - Expiration time in seconds
     * @returns {Promise<string>} - The pre-signed URL
     */
    generateShareLink: async (key, expiresIn = 3600) => {
        try {
            const getUrlResult = await getUrl({
                key,
                options: {
                    expiresIn,
                    validateObjectExistence: true
                }
            });
            return getUrlResult.url.toString();
        } catch (error) {
            console.error('Error generating share link:', error);
            throw new Error(error.message || 'Failed to generate share link.');
        }
    }
};

export default fileService;


