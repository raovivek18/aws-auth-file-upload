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
                }
            });
            return result.data.createFileMetadata;
        } catch (error) {
            console.error('Error saving metadata:', error);
            throw error;
        }
    },

    /**
     * Get all file metadata for a user
     */
    getUserFiles: async () => {
        try {
            const result = await client.graphql({
                query: queries.listFileMetadatas
            });
            return result.data.listFileMetadatas.items;
        } catch (error) {
            console.error('Error fetching metadata:', error);
            throw error;
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
                }
            });
            return result.data.updateFileMetadata;
        } catch (error) {
            console.error('Error updating sharing status:', error);
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
                }
            });
        } catch (error) {
            console.error('Error deleting metadata:', error);
            throw error;
        }
    }
};

export default metadataService;
