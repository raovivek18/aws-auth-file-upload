import { uploadData, list, remove, getUrl } from 'aws-amplify/storage';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

/**
 * Service for handling file operations with AWS Amplify Storage (v6+)
 */
const fileService = {
    /**
     * Uploads a file to a user-specific folder
     * @param {File} file - The file object to upload
     * @param {string} userId - The unique ID of the user
     * @returns {Promise<Object>} - The upload result
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

            const result = await uploadOperation.result;
            return { ...result, key };
        } catch (error) {
            console.error('Error uploading file:', error);
            throw new Error(error.message || 'Failed to upload file. Please try again.');
        }
    },

    /**
     * Lists files for a specific user
     * @param {string} userId - The unique ID of the user
     * @returns {Promise<Array>} - List of files
     */
    listFiles: async (userId) => {
        try {
            const result = await list({
                prefix: `${userId}/`,
            });

            // Sort files by lastModified (newest first) if available
            return result.items.sort((a, b) => {
                if (!a.lastModified || !b.lastModified) return 0;
                return new Date(b.lastModified) - new Date(a.lastModified);
            });
        } catch (error) {
            console.error('Error listing files:', error);
            throw new Error(error.message || 'Failed to fetch file list.');
        }
    },

    /**
     * Deletes a file from storage
     * @param {string} key - The full key of the file
     */
    deleteFile: async (key) => {
        try {
            await remove({ key });
        } catch (error) {
            console.error('Error deleting file:', error);
            throw new Error(error.message || 'Failed to delete file.');
        }
    },

    /**
     * Generates a temporary pre-signed URL for sharing/viewing
     * @param {string} key - The full key of the file
     * @returns {Promise<string>} - The pre-signed URL
     */
    generateShareLink: async (key) => {
        try {
            const getUrlResult = await getUrl({
                key,
                options: {
                    expiresIn: 3600, // Link valid for 1 hour
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
