import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/database', () => ({
  default: {
    checklist: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    entryLog: {
      update: vi.fn(),
    },
  },
}));

vi.mock('@manholeguard/shared/src/constants/ppe-items', () => ({
  PPE_CHECKLIST_ITEMS: [
    { id: 'helmet', label: 'Safety helmet', mandatory: true },
    { id: 'gas_detector', label: 'Gas detector', mandatory: true },
    { id: 'harness', label: 'Safety harness', mandatory: true },
    { id: 'gloves', label: 'Rubber gloves', mandatory: true },
    { id: 'boots', label: 'Gumboots', mandatory: true },
    { id: 'vest', label: 'Reflective vest', mandatory: true },
    { id: 'respirator', label: 'Respirator', mandatory: true },
    { id: 'firstaid', label: 'First-aid kit', mandatory: true },
    { id: 'comms', label: 'Communication device', mandatory: true },
    { id: 'tripod', label: 'Tripod and winch', mandatory: true },
    { id: 'ventilation', label: 'Ventilation fan', mandatory: false },
    { id: 'supervisor', label: 'Supervisor present', mandatory: true },
  ],
}));

vi.mock('../../middleware/errorHandler', async () => {
  class AppError extends Error {
    statusCode: number;
    code: string;
    constructor(statusCode: number, code: string, message: string) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
      this.name = 'AppError';
    }
  }
  return { AppError };
});

import prisma from '../../config/database';
import { ChecklistService } from '../../services/checklist.service';

describe('ChecklistService', () => {
  let service: ChecklistService;

  const allMandatoryChecked = [
    { id: 'helmet', checked: true },
    { id: 'gas_detector', checked: true },
    { id: 'harness', checked: true },
    { id: 'gloves', checked: true },
    { id: 'boots', checked: true },
    { id: 'vest', checked: true },
    { id: 'respirator', checked: true },
    { id: 'firstaid', checked: true },
    { id: 'comms', checked: true },
    { id: 'tripod', checked: true },
    { id: 'supervisor', checked: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ChecklistService();
  });

  describe('createChecklist', () => {
    it('should pass when all 11 mandatory items are checked', async () => {
      const items = [...allMandatoryChecked, { id: 'ventilation', checked: false }];

      vi.mocked(prisma.checklist.create).mockResolvedValueOnce({
        id: 'cl-1',
        entryLogId: 'entry-1',
        items,
        allPassed: true,
        completedAt: new Date(),
      } as any);

      vi.mocked(prisma.entryLog.update).mockResolvedValueOnce({} as any);

      const result = await service.createChecklist('entry-1', items);

      expect(result.allPassed).toBe(true);

      expect(prisma.checklist.create).toHaveBeenCalledWith({
        data: {
          entryLogId: 'entry-1',
          items: items as any,
          allPassed: true,
          completedAt: expect.any(Date),
        },
      });

      // Should update entry state to CHECKLIST_PENDING
      expect(prisma.entryLog.update).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
        data: { checklistCompleted: true, state: 'CHECKLIST_PENDING' },
      });
    });

    it('should fail when a mandatory item is missing', async () => {
      // Missing 'helmet'
      const items = allMandatoryChecked.filter(i => i.id !== 'helmet');

      vi.mocked(prisma.checklist.create).mockResolvedValueOnce({
        id: 'cl-2',
        entryLogId: 'entry-2',
        items,
        allPassed: false,
        completedAt: null,
      } as any);

      const result = await service.createChecklist('entry-2', items);

      expect(result.allPassed).toBe(false);

      // Should NOT update entry state when checklist fails
      expect(prisma.entryLog.update).not.toHaveBeenCalled();
    });

    it('should fail when a mandatory item is unchecked', async () => {
      const items = allMandatoryChecked.map(i =>
        i.id === 'harness' ? { ...i, checked: false } : i
      );

      vi.mocked(prisma.checklist.create).mockResolvedValueOnce({
        id: 'cl-3',
        entryLogId: 'entry-3',
        items,
        allPassed: false,
        completedAt: null,
      } as any);

      const result = await service.createChecklist('entry-3', items);

      expect(result.allPassed).toBe(false);
      expect(prisma.entryLog.update).not.toHaveBeenCalled();
    });

    it('should pass even when optional ventilation is unchecked', async () => {
      const items = [...allMandatoryChecked, { id: 'ventilation', checked: false }];

      vi.mocked(prisma.checklist.create).mockResolvedValueOnce({
        id: 'cl-4',
        entryLogId: 'entry-4',
        items,
        allPassed: true,
        completedAt: new Date(),
      } as any);
      vi.mocked(prisma.entryLog.update).mockResolvedValueOnce({} as any);

      const result = await service.createChecklist('entry-4', items);

      expect(result.allPassed).toBe(true);
    });

    it('should pass when all items including optional are checked', async () => {
      const items = [...allMandatoryChecked, { id: 'ventilation', checked: true }];

      vi.mocked(prisma.checklist.create).mockResolvedValueOnce({
        id: 'cl-5',
        entryLogId: 'entry-5',
        items,
        allPassed: true,
        completedAt: new Date(),
      } as any);
      vi.mocked(prisma.entryLog.update).mockResolvedValueOnce({} as any);

      const result = await service.createChecklist('entry-5', items);

      expect(result.allPassed).toBe(true);
    });
  });

  describe('supervisorOverride', () => {
    it('should set supervisorApproved and completedAt', async () => {
      vi.mocked(prisma.checklist.findUnique).mockResolvedValueOnce({
        id: 'cl-override',
        entryLogId: 'entry-override',
        allPassed: false,
      } as any);

      vi.mocked(prisma.checklist.update).mockResolvedValueOnce({
        id: 'cl-override',
        supervisorApproved: true,
        completedAt: new Date(),
      } as any);

      vi.mocked(prisma.entryLog.update).mockResolvedValueOnce({} as any);

      const result = await service.supervisorOverride('cl-override', 'Emergency entry approved');

      expect(result.supervisorApproved).toBe(true);
      expect(result.completedAt).not.toBeNull();

      expect(prisma.checklist.update).toHaveBeenCalledWith({
        where: { id: 'cl-override' },
        data: { supervisorApproved: true, completedAt: expect.any(Date) },
      });

      expect(prisma.entryLog.update).toHaveBeenCalledWith({
        where: { id: 'entry-override' },
        data: { checklistCompleted: true, state: 'CHECKLIST_PENDING' },
      });
    });

    it('should throw 404 when checklist not found', async () => {
      vi.mocked(prisma.checklist.findUnique).mockResolvedValueOnce(null);

      await expect(
        service.supervisorOverride('non-existent', 'reason')
      ).rejects.toThrow('Checklist not found');
    });
  });

  describe('getByEntryLog', () => {
    it('should return checklist for given entry', async () => {
      const mockChecklist = {
        id: 'cl-get',
        entryLogId: 'entry-get',
        allPassed: true,
        items: allMandatoryChecked,
      };

      vi.mocked(prisma.checklist.findUnique).mockResolvedValueOnce(mockChecklist as any);

      const result = await service.getByEntryLog('entry-get');

      expect(result).toEqual(mockChecklist);
      expect(prisma.checklist.findUnique).toHaveBeenCalledWith({
        where: { entryLogId: 'entry-get' },
      });
    });

    it('should return null when no checklist exists', async () => {
      vi.mocked(prisma.checklist.findUnique).mockResolvedValueOnce(null);

      const result = await service.getByEntryLog('entry-none');

      expect(result).toBeNull();
    });
  });
});
