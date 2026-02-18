import winston from 'winston';
import { env } from '../config/env';

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    env.NODE_ENV === 'development'
      ? winston.format.combine(winston.format.colorize(), winston.format.simple())
      : winston.format.json()
  ),
  defaultMeta: { service: 'manholeguard-api' },
  transports: [new winston.transports.Console()],
});
