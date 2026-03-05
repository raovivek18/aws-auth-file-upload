import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';
import logger from './loggerService';

const client = generateClient();

const STORAGE_DEFAULT_LIMIT = 100 * 1024 * 1024; // 100MB default

const analyticsService = {
    /**
     * Get or create user analytics record
     */
    getOrCreateAnalytics: async () => {
        try {
            const { userId } = await getCurrentUser();

            const result = await client.graphql({
                query: queries.getUserAnalytics,
                variables: { id: userId },
                authMode: 'userPool'
            });

            if (result.data?.getUserAnalytics) {
                return result.data.getUserAnalytics;
            }

            // Create if doesn't exist
            const newAnalytics = await client.graphql({
                query: mutations.createUserAnalytics,
                variables: {
                    input: {
                        id: userId,
                        totalFiles: 0,
                        totalStorage: 0,
                        totalShares: 0,
                        storageLimit: STORAGE_DEFAULT_LIMIT,
                        lastActive: new Date().toISOString()
                    }
                },
                authMode: 'userPool'
            });

            return newAnalytics.data?.createUserAnalytics;
        } catch (error) {
            logger.error('Error in getOrCreateAnalytics:', error);
            throw error;
        }
    },

    /**
     * Increment file count and storage
     */
    recordUpload: async (fileSize) => {
        try {
            const current = await analyticsService.getOrCreateAnalytics();
            await client.graphql({
                query: mutations.updateUserAnalytics,
                variables: {
                    input: {
                        id: current.id,
                        totalFiles: current.totalFiles + 1,
                        totalStorage: current.totalStorage + fileSize,
                        lastActive: new Date().toISOString()
                    }
                },
                authMode: 'userPool'
            });
        } catch (error) {
            logger.error('Failed to record upload analytics:', error);
        }
    },

    /**
     * Decrement file count and storage
     */
    recordDeletion: async (fileSize) => {
        try {
            const current = await analyticsService.getOrCreateAnalytics();
            await client.graphql({
                query: mutations.updateUserAnalytics,
                variables: {
                    input: {
                        id: current.id,
                        totalFiles: Math.max(0, current.totalFiles - 1),
                        totalStorage: Math.max(0, current.totalStorage - fileSize),
                        lastActive: new Date().toISOString()
                    }
                },
                authMode: 'userPool'
            });
        } catch (error) {
            logger.error('Failed to record deletion analytics:', error);
        }
    },

    /**
     * Increment share links count
     */
    recordShare: async () => {
        try {
            const current = await analyticsService.getOrCreateAnalytics();
            await client.graphql({
                query: mutations.updateUserAnalytics,
                variables: {
                    input: {
                        id: current.id,
                        totalShares: current.totalShares + 1,
                        lastActive: new Date().toISOString()
                    }
                },
                authMode: 'userPool'
            });
        } catch (error) {
            logger.error('Failed to record share analytics:', error);
        }
    },

    /**
     * Sync stats by scanning existing metadata (maintenance/verification)
     */
    syncStats: async () => {
        try {
            const { userId } = await getCurrentUser();

            // Get all files for user
            const filesResult = await client.graphql({
                query: queries.listFileMetadataByOwner,
                variables: { owner: userId },
                authMode: 'userPool'
            });

            const files = filesResult.data?.listFileMetadataByOwner?.items || [];
            const totalFiles = files.length;
            const totalStorage = files.reduce((acc, f) => acc + f.size, 0);

            // Get share count from activity logs (approximate)
            const logsResult = await client.graphql({
                query: queries.listLogsByUser,
                variables: { userId, filter: { actionType: { contains: 'Share' } } },
                authMode: 'userPool'
            });
            const totalShares = logsResult.data?.listLogsByUser?.items?.length || 0;

            const current = await analyticsService.getOrCreateAnalytics();

            await client.graphql({
                query: mutations.updateUserAnalytics,
                variables: {
                    input: {
                        id: current.id,
                        totalFiles,
                        totalStorage,
                        totalShares,
                        lastActive: new Date().toISOString()
                    }
                },
                authMode: 'userPool'
            });

            return { totalFiles, totalStorage, totalShares };
        } catch (error) {
            logger.error('Sync stats failed:', error);
            throw error;
        }
    }
};

export default analyticsService;
