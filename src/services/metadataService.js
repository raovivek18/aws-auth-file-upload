import { generateClient } from 'aws-amplify/api';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';

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
                        owner: fileData.owner,
                        sharingStatus: fileData.sharingStatus || 'PRIVATE',
                        shareExpiration: fileData.shareExpiration,
                        uploadTimestamp: new Date().toISOString()
                    }
                },
                authMode: 'userPool'
            });
            return result.data.createFileMetadata;
        } catch (error) {
            console.error('Error saving metadata:', error);
            throw error;
        }
    },

    /**
     * Get file metadata for a user with pagination support
     */
    getUserFiles: async (limit = 10, nextToken = null) => {
        try {
            const result = await client.graphql({
                query: queries.listFileMetadata,
                variables: {
                    limit,
                    nextToken
                },
                authMode: 'userPool'
            });
            return {
                items: result.data.listFileMetadata.items,
                nextToken: result.data.listFileMetadata.nextToken
            };
        } catch (error) {
            console.error('Error fetching metadata:', error);
            throw error;
        }
    },

    /**
     * Check if a file with the same name already exists for the user
     */
    checkFileExists: async (name, owner) => {
        try {
            const result = await client.graphql({
                query: queries.listFileMetadata,
                variables: {
                    filter: {
                        name: { eq: name },
                        owner: { eq: owner }
                    }
                },
                authMode: 'userPool'
            });
            return result.data.listFileMetadata.items.length > 0;
        } catch (error) {
            console.error('Error checking file existence:', error);
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
            return result.data.updateFileMetadata;
        } catch (error) {
            console.error('Error updating sharing status:', error);
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
            return result.data.updateFileMetadata;
        } catch (error) {
            console.error('Error renaming metadata:', error);
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
            console.error('Error deleting metadata:', error);
            throw error;
        }
    }
};

export default metadataService;
