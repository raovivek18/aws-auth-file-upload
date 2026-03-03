import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';

const client = generateClient();

const activityService = {
  /**
   * Log a new activity to the database
   * @param {string} actionType - The type of action (e.g., 'File uploaded')
   * @param {string} fileId - ID of the file associated with the action
   * @param {string} fileName - Name of the file for better readability in logs
   */
  logActivity: async (actionType, fileId = null, fileName = null) => {
    try {
      // 1. Get current user
      const { userId } = await getCurrentUser();

      // 2. Try to get IP (using a public API as a helper)
      let ip = 'unknown';
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        ip = data.ip;
      } catch (e) {
        console.warn('Could not fetch IP address:', e);
      }

      // 3. Save to GraphQL
      await client.graphql({
        query: mutations.createActivityLog,
        variables: {
          input: {
            userId,
            actionType,
            timestamp: new Date().toISOString(),
            fileId,
            fileName,
            ip
          }
        },
        authMode: 'userPool' // Ensure we use Cognito
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
      // We don't throw here to prevent activity logging from breaking the main app flow
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
          sortDirection: 'DESC' // Newest first
        },
        authMode: 'userPool'
      });
      return result.data.listLogsByUser.items;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw new Error('Could not retrieve activity logs.');
    }
  }
};

export default activityService;
