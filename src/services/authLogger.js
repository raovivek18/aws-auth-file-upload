import { Hub } from 'aws-amplify/utils';
import logger from './loggerService';

/**
 * Initializes listeners for Amplify Hub events to log authentication changes
 */
export const initAuthLogger = () => {
    Hub.listen('auth', ({ payload }) => {
        const { event, data } = payload;

        switch (event) {
            case 'signedIn':
                logger.info('User signed in successfully', { user: data.username });
                break;
            case 'signedOut':
                logger.info('User signed out');
                break;
            case 'signInWithRedirect':
                logger.info('Sign in with redirect initiated');
                break;
            case 'signInWithRedirect_failure':
                logger.error('Sign in with redirect failed', { error: data });
                break;
            case 'tokenRefresh':
                logger.debug('Auth token refreshed');
                break;
            case 'tokenRefresh_failure':
                logger.error('Auth token refresh failed', { error: data });
                break;
            default:
                break;
        }
    });

    // Also listen to API and Storage events if needed
    Hub.listen('api', ({ payload }) => {
        const { event, data } = payload;
        if (event === 'error') {
            logger.error('API Error detected via Hub', { error: data });
        }
    });

    Hub.listen('storage', ({ payload }) => {
        const { event, data } = payload;
        if (event === 'error') {
            logger.error('Storage Error detected via Hub', { error: data });
        }
    });
};
