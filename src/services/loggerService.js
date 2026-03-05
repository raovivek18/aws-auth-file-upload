/**
 * Standardized Logging Service for AWS Amplify Applications
 * Uses AWS Amplify's Logger for consistent formatting and severity levels.
 * In a production environment, this could be extended to send logs to
 * CloudWatch RUM, Amazon Pinpoint, or an external service like Sentry.
 */
import { ConsoleLogger as Logger } from 'aws-amplify/utils';

// Set standard log levels: INFO, WARN, ERROR, DEBUG
const amplifyLogger = new Logger('SecureFileStore');

const logger = {
    /**
     * Log general info, like successful operations
     */
    info: (message, context = {}) => {
        const timestamp = new Date().toISOString();
        amplifyLogger.info(`[${timestamp}] ${message}`, context);
    },

    /**
     * Log non-critical warnings, like unauthorized attempts or retries
     */
    warn: (message, context = {}) => {
        const timestamp = new Date().toISOString();
        amplifyLogger.warn(`[${timestamp}] ${message}`, context);
    },

    /**
     * Log errors with full context and stack trace
     */
    error: (error, context = {}) => {
        const timestamp = new Date().toISOString();
        const message = error instanceof Error ? error.message : error;
        const stack = error instanceof Error ? error.stack : null;

        amplifyLogger.error(`[${timestamp}] ERROR: ${message}`, {
            ...context,
            stack,
            errorObject: error
        });

        // In production, we would send this to a monitoring tool
        // Example: if (process.env.NODE_ENV === 'production') {
        //    MonitoringService.sendToCloudWatch(error, context);
        // }
    },

    /**
     * Debug logs for development use only
     */
    debug: (message, context = {}) => {
        if (process.env.NODE_ENV !== 'production') {
            amplifyLogger.debug(`[DEBUG] ${message}`, context);
        }
    }
};

export default logger;
