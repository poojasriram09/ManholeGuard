import { Queue, Worker as BullWorker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from './env';

const redisConnection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });

export const notificationQueue = new Queue('notifications', { connection: redisConnection as any });
export const reportQueue = new Queue('reports', { connection: redisConnection as any });
export const scheduledJobsQueue = new Queue('scheduled-jobs', { connection: redisConnection as any });

export { redisConnection, BullWorker };
