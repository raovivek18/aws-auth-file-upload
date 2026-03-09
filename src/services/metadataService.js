import { generateClient } from 'aws-amplify/api';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';
import logger from './loggerService';

const client = generateClient();

const metadataService = {
    /**
     * Save file metadata to DynamoDB
     */
    saveMetadata: async (fileData) => {
        try {
            const result = await client.graphql({
                query: mutations.createFileMetadata,
                variables: {
                    input: {
                        name: fileData.name,
                        size: fileData.size,
                        type: fileData.type,
                        key: fileData.key,
                        userId: fileData.userId, // This should be the sub (userId)
                        sharingStatus: fileData.sharingStatus || 'PRIVATE',
                        shareExpiration: fileData.shareExpiration,
                        uploadTimestamp: new Date().toISOString()
                    }
                },
                authMode: 'userPool'
            });
            return result.data?.createFileMetadata;
        } catch (error) {
            logger.error('Metadata save failed', { error, fileData });
            throw error;
        }
    },

    /**
     * Get file metadata for a user with pagination support
     */
    getUserFiles: async (userId, limit = 10, nextToken = null) => {
        try {
            const result = await client.graphql({
                query: queries.listFileMetadataByUser,
                variables: {
                    userId,
                    limit,
                    nextToken,
                    sortDirection: 'DESC'
                },
                authMode: 'userPool'
            });

            return {
                items: result.data?.listFileMetadataByUser?.items || [],
                nextToken: result.data?.listFileMetadataByUser?.nextToken
            };
        } catch (error) {
            logger.error('Query metadata failed', {
                error,
                userId,
                errors: error.errors,
                message: error.message
            });
            throw error;
        }
    },

    /**
     * Check if a file with the same name already exists for the user
     */
    checkFileExists: async (name, userId) => {
        try {
            const result = await client.graphql({
                query: queries.listFileMetadataByUser,
                variables: {
                    userId,
                    filter: {
                        name: { eq: name }
                    }
                },
                authMode: 'userPool'
            });
            return (result.data?.listFileMetadataByUser?.items?.length || 0) > 0;
        } catch (error) {
            logger.error('Check file exists query failed', { error, name, userId });
            return false;
        }
    },

    /**
     * Update sharing status
     */
    updateSharing: async (id, status, expiration = null) => {
        try {
            const result = await client.graphql({
                query: mutations.updateFileMetadata,
                variables: {
                    input: {
                        id,
                        sharingStatus: status,
                        shareExpiration: expiration
                    }
                },
                authMode: 'userPool'
            });
            return result.data?.updateFileMetadata;
        } catch (error) {
            logger.error('Update sharing failed', { error, id, status });
            throw error;
        }
    },

    /**
     * Update file name (Renaming)
     */
    renameMetadata: async (id, newName) => {
        try {
            const result = await client.graphql({
                query: mutations.updateFileMetadata,
                variables: {
                    input: {
                        id,
                        name: newName
                    }
                },
                authMode: 'userPool'
            });
            return result.data?.updateFileMetadata;
        } catch (error) {
            logger.error('Rename metadata failed', { error, id, newName });
            throw error;
        }
    },

    /**
     * Delete metadata
     */
    deleteMetadata: async (id) => {
        try {
            await client.graphql({
                query: mutations.deleteFileMetadata,
                variables: {
                    input: { id }
                },
                authMode: 'userPool'
            });
        } catch (error) {
            logger.error('Delete metadata failed', { error, id });
            throw error;
        }
    }
};

export default metadataService;
