/**
 * Simple Logger service for production monitoring
 * In production, this could send data to AWS CloudWatch, Sentry, or LogRocket
 */
const logger = {
    info: (message, context = {}) => {
        console.log(`[INFO] ${new Date().toISOString()}: ${message}`, context);
    },
    warn: (message, context = {}) => {
        console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, context);
    },
    error: (error, context = {}) => {
        const message = error instanceof Error ? error.message : error;
        const stack = error instanceof Error ? error.stack : null;

        console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, {
            ...context,
            stack
        });

        // PLACEHOLDER: Integrate with monitoring tools like Sentry or CloudWatch here
        // if (process.env.NODE_ENV === 'production') {
        //     Sentry.captureException(error);
        // }
    }
};

export default logger;
