import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';
import logger from './loggerService';

const client = generateClient();

const activityService = {
  /**
   * Log a new activity to the database
   */
  logActivity: async (actionType, fileId = null, fileName = null) => {
    try {
      // Use userId (sub) for consistency with AppSync owner field
      const { userId } = await getCurrentUser();

      let ip = 'unknown';
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        ip = data.ip;
      } catch (e) {
        logger.warn('Could not fetch IP address', { error: e });
      }

      await client.graphql({
        query: mutations.createActivityLog,
        variables: {
          input: {
            userId, // This maps to the userId field in schema
            actionType,
            timestamp: new Date().toISOString(),
            fileId,
            fileName,
            ip
          }
        },
        authMode: 'userPool'
      });
    } catch (error) {
      logger.error('Failed to log activity', { error });
    }
  },

  /**
   * Fetch logs for the current user
   */
  getActivityLogs: async () => {
    try {
      const { userId } = await getCurrentUser();
      const result = await client.graphql({
        query: queries.listLogsByUser,
        variables: {
          userId,
          sortDirection: 'DESC'
        },
        authMode: 'userPool'
      });
      return result.data?.listLogsByUser?.items || [];
    } catch (error) {
      logger.error('Error fetching activity logs', { error });
      throw new Error('Could not retrieve activity logs.');
    }
  }
};

export default activityService;
