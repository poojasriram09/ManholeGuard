import prisma from '../config/database';

export class IncidentService {
  async create(data: {
    manholeId: string; workerId?: string; entryLogId?: string;
    incidentType: string; description?: string; severity?: string;
  }) {
    return prisma.incident.create({
      data: {
        manholeId: data.manholeId,
        workerId: data.workerId,
        entryLogId: data.entryLogId,
        incidentType: data.incidentType,
        description: data.description,
        severity: (data.severity as any) || 'MEDIUM',
      },
    });
  }

  async getAll(filters?: { manholeId?: string; severity?: string; resolved?: boolean }) {
    return prisma.incident.findMany({
      where: {
        ...(filters?.manholeId && { manholeId: filters.manholeId }),
        ...(filters?.severity && { severity: filters.severity as any }),
        ...(filters?.resolved !== undefined && { resolved: filters.resolved }),
      },
      include: {
        manhole: { select: { area: true, qrCodeId: true } },
        worker: { select: { name: true, employeeId: true } },
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  async resolve(id: string, resolvedBy: string) {
    return prisma.incident.update({
      where: { id },
      data: { resolved: true, resolvedAt: new Date(), resolvedBy },
    });
  }
}
