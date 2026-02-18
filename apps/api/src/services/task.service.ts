import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class TaskService {
  async create(supervisorId: string, data: {
    manholeId?: string; assignedWorkerIds: string[]; taskType: string;
    description?: string; allowedDuration?: number; priority?: string; scheduledAt?: string;
  }) {
    return prisma.task.create({
      data: {
        supervisorId,
        manholeId: data.manholeId,
        assignedWorkerIds: data.assignedWorkerIds,
        taskType: data.taskType,
        description: data.description,
        allowedDuration: data.allowedDuration ?? 45,
        priority: data.priority ?? 'normal',
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      },
      include: { supervisor: { select: { name: true } } },
    });
  }

  async getAll(filters?: { status?: string; supervisorId?: string }) {
    return prisma.task.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.supervisorId && { supervisorId: filters.supervisorId }),
      },
      include: { supervisor: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(taskId: string, status: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError(404, 'TASK_NOT_FOUND', 'Task not found');

    const data: any = { status };
    if (status === 'in_progress') data.startedAt = new Date();
    if (status === 'completed') data.completedAt = new Date();

    return prisma.task.update({ where: { id: taskId }, data });
  }
}
