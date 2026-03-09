import { generateClient } from 'aws-amplify/api';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { getUrl } from 'aws-amplify/storage';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';
import logger from './loggerService';
import activityService from './activityService';

const client = generateClient();

const shareService = {
    /**
     * Share a file with an email address
     */
    shareFile: async (file, recipientEmail) => {
        try {
            const { userId } = await getCurrentUser();
            const attributes = await fetchUserAttributes();
            const ownerEmail = attributes.email;

            if (recipientEmail === ownerEmail) {
                throw new Error('You cannot share a file with yourself.');
            }

            // 1. Check if already shared
            const existing = await client.graphql({
                query: queries.listSharedFiles,
                variables: {
                    filter: {
                        fileId: { eq: file.id },
                        sharedWith: { eq: recipientEmail }
                    }
                },
                authMode: 'userPool'
            });

            if (existing.data?.listSharedFiles?.items?.length > 0) {
                throw new Error('This file is already shared with this user.');
            }

            // 2. Create SharedFile record
            const result = await client.graphql({
                query: mutations.createSharedFile,
                variables: {
                    input: {
                        fileId: file.id,
                        sharedWith: recipientEmail,
                        userId: userId,
                        ownerEmail: ownerEmail,
                        fileName: file.name,
                        fileKey: file.key,
                        fileSize: file.size,
                        fileType: file.type
                    }
                },
                authMode: 'userPool'
            });

            await activityService.logActivity('File shared', file.id, `Shared with ${recipientEmail}`);
            return result.data?.createSharedFile;
        } catch (error) {
            logger.error('Failed to share file', error);
            throw error;
        }
    },

    /**
     * List files shared with the current user
     */
    getFilesSharedWithMe: async () => {
        try {
            const attributes = await fetchUserAttributes();
            const email = attributes.email;

            const result = await client.graphql({
                query: queries.listSharedWithMe,
                variables: {
                    sharedWith: email,
                    sortDirection: 'DESC'
                },
                authMode: 'userPool'
            });

            return result.data?.listSharedWithMe?.items || [];
        } catch (error) {
            logger.error('Failed to fetch shared files', error);
            throw error;
        }
    },

    /**
     * List who a specific file is shared with
     */
    getFileShares: async (fileId) => {
        try {
            const result = await client.graphql({
                query: queries.listSharedFiles,
                variables: {
                    filter: { fileId: { eq: fileId } }
                },
                authMode: 'userPool'
            });
            return result.data?.listSharedFiles?.items || [];
        } catch (error) {
            logger.error('Failed to fetch file shares', error);
            throw error;
        }
    },

    /**
     * Revoke access
     */
    revokeAccess: async (shareId) => {
        try {
            await client.graphql({
                query: mutations.deleteSharedFile,
                variables: { input: { id: shareId } },
                authMode: 'userPool'
            });
            await activityService.logActivity('Share revoked', null, `ID: ${shareId}`);
        } catch (error) {
            logger.error('Failed to revoke access', error);
            throw error;
        }
    },

    /**
     * Generate a temporary access URL for a shared file
     * Note: This works because S3 doesn't know about our SharedFile table.
     * The sharer (owner) identity is required to generate the URL from their private path.
     * OR we use a Lambda or sophisticated IAM.
     * In Amplify Gen 1, fetching another user's private file is tricky without custom logic.
     * 
     * Strategy: The SharedFile record stores the ownerId and key.
     * We can use a public-access bypass or just use the pre-signed URL system if the owner
     * generates it.
     * 
     * For "true" peer sharing in Gen 1, we often use 'protected' access level
     * where users can read each other's files if authorized.
     * However, since we are using 'private', we need to generate a URL as the owner.
     */
    getSharedFileUrl: async (sharedFile) => {
        try {
            // Note: Storage.get for 'private' files always uses the CURRENT user's identityId.
            // To get another user's private file, we need their identityId.
            // This is a limitation of simple Amplify Storage.
            // For now, we will recommend the user uses the pre-signed link feature
            // or we would need to move files to a 'protected' bucket path.

            // Temporary workaround: generate link via Storage.getUrl if current user is owner
            // If recipient, this will fail unless we use a custom function.
            // For this milestone, we will implement the permission tracking.

            const result = await getUrl({
                key: sharedFile.fileKey,
                options: {
                    accessLevel: 'protected', // Shared files should ideally be in protected
                    // identityId: sharedFile.ownerIdentityId // Requires identityId
                }
            });
            return result.url.toString();
        } catch (error) {
            logger.error('Shared download failed', error);
            throw new Error('Access to shared S3 object denied by IAM policy.');
        }
    }
};

export default shareService;
