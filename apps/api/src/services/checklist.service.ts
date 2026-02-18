import prisma from '../config/database';
import { PPE_CHECKLIST_ITEMS } from '@manholeguard/shared/src/constants/ppe-items';
import { AppError } from '../middleware/errorHandler';

export class ChecklistService {
  async createChecklist(entryLogId: string, items: Array<{ id: string; checked: boolean; photoUrl?: string }>) {
    const allMandatoryPassed = PPE_CHECKLIST_ITEMS
      .filter(ppeItem => ppeItem.mandatory)
      .every(ppeItem => items.find(i => i.id === ppeItem.id)?.checked);

    const checklist = await prisma.checklist.create({
      data: {
        entryLogId,
        items: items as any,
        allPassed: allMandatoryPassed,
        completedAt: allMandatoryPassed ? new Date() : null,
      },
    });

    if (allMandatoryPassed) {
      await prisma.entryLog.update({
        where: { id: entryLogId },
        data: { checklistCompleted: true, state: 'CHECKLIST_PENDING' },
      });
    }

    return checklist;
  }

  async supervisorOverride(checklistId: string, reason: string) {
    const checklist = await prisma.checklist.findUnique({ where: { id: checklistId } });
    if (!checklist) throw new AppError(404, 'CHECKLIST_NOT_FOUND', 'Checklist not found');

    const updated = await prisma.checklist.update({
      where: { id: checklistId },
      data: { supervisorApproved: true, completedAt: new Date() },
    });

    await prisma.entryLog.update({
      where: { id: checklist.entryLogId },
      data: { checklistCompleted: true, state: 'CHECKLIST_PENDING' },
    });

    return updated;
  }

  async getByEntryLog(entryLogId: string) {
    return prisma.checklist.findUnique({ where: { entryLogId } });
  }
}
