import app from './app';
import { env } from './config/env';
import prisma from './config/database';
import { logger } from './utils/logger';

async function main() {
  try {
    await prisma.$connect();
    logger.info('Database connected');

    const server = app.listen(env.PORT, () => {
      logger.info(`ManholeGuard API running on port ${env.PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Server shut down');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
