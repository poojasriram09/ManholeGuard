import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

// Route imports
import authRoutes from './routes/auth.routes';
import workerRoutes from './routes/worker.routes';
import manholeRoutes from './routes/manhole.routes';
import entryRoutes from './routes/entry.routes';
import scanRoutes from './routes/scan.routes';
import checklistRoutes from './routes/checklist.routes';
import checkInRoutes from './routes/checkin.routes';
import gasRoutes from './routes/gas.routes';
import healthRoutes from './routes/health.routes';
import shiftRoutes from './routes/shift.routes';
import taskRoutes from './routes/task.routes';
import sosRoutes from './routes/sos.routes';
import alertRoutes from './routes/alert.routes';
import incidentRoutes from './routes/incident.routes';
import certificationRoutes from './routes/certification.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import grievanceRoutes from './routes/grievance.routes';
import reportRoutes from './routes/report.routes';
import analyticsRoutes from './routes/analytics.routes';
import auditRoutes from './routes/audit.routes';
import syncRoutes from './routes/sync.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();

// Global middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(rateLimiter(100));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/manholes', manholeRoutes);
app.use('/api/entry', entryRoutes);
app.use('/api/scan', rateLimiter(20), scanRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/checkin', checkInRoutes);
app.use('/api/gas', gasRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/shift', shiftRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Public routes (no auth)
app.use('/api/public', grievanceRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Error handler
app.use(errorHandler);

export default app;
