import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { logger } from '../utils/logger';

export const initMonitoring = () => {
  if (process.env.SENTRY_DSN && process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      integrations: [
        new ProfilingIntegration(),
      ],
      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% of requests
      // Profiling
      profilesSampleRate: 0.1, // 10% of requests
      // Filter out health checks
      beforeSend(event) {
        if (event.request?.url?.includes('/health')) {
          return null;
        }
        return event;
      },
    });
    
    logger.info('Sentry monitoring initialized');
  }
};

export { Sentry };
