import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthService } from './auth.service';

export class WorkerService {
  private authService = new AuthService();

  async create(data: {
    email: string; password: string; employeeId: string; name: string; phone: string;
    supervisorId?: string; dateOfBirth?: string; bloodGroup?: string;
    emergencyContactName?: string; emergencyContactPhone?: string; medicalNotes?: string;
  }) {
    const { email, password, ...workerData } = data;
    const { user } = await this.authService.register(email, password, 'WORKER');

    return prisma.worker.create({
      data: {
        userId: user.id,
        ...workerData,
        dateOfBirth: workerData.dateOfBirth ? new Date(workerData.dateOfBirth) : undefined,
      },
      include: { user: { select: { email: true, role: true } } },
    });
  }

  async getAll(filters?: { supervisorId?: string }) {
    return prisma.worker.findMany({
      where: filters?.supervisorId ? { supervisorId: filters.supervisorId } : undefined,
      include: {
        user: { select: { email: true, role: true, language: true, isActive: true } },
        supervisor: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: string) {
    const worker = await prisma.worker.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, role: true, language: true } },
        supervisor: { select: { name: true, phone: true } },
        certifications: true,
      },
    });
    if (!worker) throw new AppError(404, 'WORKER_NOT_FOUND', 'Worker not found');
    return worker;
  }

  async getByUserId(userId: string) {
    return prisma.worker.findUnique({
      where: { userId },
      include: { user: { select: { email: true, role: true, language: true } } },
    });
  }
}
