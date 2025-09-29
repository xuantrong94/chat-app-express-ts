import { createServer } from 'http';
import app from './app.js';
import { env } from './config/env.js';
import logger from './config/logger.js';
import process from 'process';
import { setTimeout } from 'timers';

// Create HTTP server
const server = createServer(app);

// Handle server startup
const startServer = async () => {
  try {
    // Start the server
    server.listen(env.PORT, env.HOST, () => {
      logger.info('🚀 Server started successfully', {
        port: env.PORT,
        host: env.HOST,
        environment: env.NODE_ENV,
        processId: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
      });

      logger.info(`📍 Server running at http://${env.HOST}:${env.PORT}`);
      logger.info(`🏥 Health check: http://${env.HOST}:${env.PORT}/health`);
    });

    // Handle server errors
    server.on('error', error => {
      logger.error('Server error:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async err => {
    if (err) {
      logger.error('Error during server shutdown:', err);
      process.exit(1);
    }

    logger.info('Server closed successfully');

    try {
      // Close database connections if any
      // await mongoose.connection.close();
      logger.info('Database connections closed');

      // Perform any other cleanup tasks
      logger.info('Cleanup completed successfully');

      process.exit(0);
    } catch (error) {
      logger.error('Error during cleanup:', error);
      process.exit(1);
    }
  });

  // Force shutdown if graceful shutdown takes too long
  setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing shutdown...');
    process.exit(1);
  }, 30000); // 30 seconds timeout
};

// Handle process signals for graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start the server
startServer().catch(error => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

// Export server for testing purposes
export default server;
