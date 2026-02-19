import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/database', () => ({
  default: {
    entryLog: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    gasReading: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('../../config/env', () => ({
  env: {
    ALERT_CHECK_INTERVAL_MS: 30000,
    CHECKIN_INTERVAL_MINUTES: 10,
    MISSED_CHECKIN_ALERT_THRESHOLD: 2,
    ALERT_SMS_ENABLED: false,
    VAPID_PUBLIC_KEY: '',
    VAPID_PRIVATE_KEY: '',
  },
}));

vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('../../services/checkin.service', () => ({
  CheckInService: vi.fn().mockImplementation(() => ({
    promptCheckIn: vi.fn(),
    getConsecutiveMissedCount: vi.fn(),
    handleMissedCheckIn: vi.fn(),
  })),
}));

vi.mock('../../services/sos.service', () => ({
  SOSService: vi.fn().mockImplementation(() => ({
    triggerSOS: vi.fn(),
  })),
}));

vi.mock('../../services/alert.service', () => ({
  AlertService: vi.fn().mockImplementation(() => ({
    triggerOverstayAlert: vi.fn(),
    createAlert: vi.fn(),
    escalateAlert: vi.fn(),
  })),
}));

vi.mock('../../services/notification.service', () => ({
  NotificationService: vi.fn().mockImplementation(() => ({
    sendAlert: vi.fn(),
    sendCheckInPrompt: vi.fn(),
    broadcastSOS: vi.fn(),
  })),
}));

vi.mock('../../services/gas-monitor.service', () => ({
  GasMonitorService: vi.fn().mockImplementation(() => ({
    evaluateDanger: vi.fn(),
    calculateGasFactor: vi.fn(),
    isSafeToEnter: vi.fn(),
  })),
}));

import prisma from '../../config/database';
import { TimerMonitorService } from '../../services/timer-monitor.service';
import { CheckInService } from '../../services/checkin.service';
import { SOSService } from '../../services/sos.service';
import { AlertService } from '../../services/alert.service';
import { NotificationService } from '../../services/notification.service';

describe('TimerMonitorService', () => {
  let service: TimerMonitorService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TimerMonitorService();
  });

  describe('checkActiveEntries', () => {
    it('should detect overstay when elapsed > allowedDuration', async () => {
      const twoHoursAgo = new Date(Date.now() - 120 * 60000);

      vi.mocked(prisma.entryLog.findMany).mockResolvedValueOnce([
        {
          id: 'entry-1',
          workerId: 'worker-1',
          manholeId: 'manhole-1',
          taskId: null,
          shiftId: null,
          entryTime: twoHoursAgo,
          exitTime: null,
          allowedDurationMinutes: 45,
          status: 'ACTIVE',
          state: 'ACTIVE',
          geoLatitude: 19.076,
          geoLongitude: 72.877,
          geoVerified: true,
          checklistCompleted: true,
          teamEntryId: null,
          isOfflineEntry: false,
          syncedAt: null,
          notes: null,
          createdAt: twoHoursAgo,
          updatedAt: twoHoursAgo,
          worker: { id: 'worker-1', name: 'Ramesh Kumar', supervisorId: 'sup-1' },
          manhole: { id: 'manhole-1', area: 'Dadar West' },
        },
      ] as any);

      await service.checkActiveEntries();

      const alertService = (service as any).alertService as InstanceType<typeof AlertService>;
      expect(alertService.triggerOverstayAlert).toHaveBeenCalledWith('entry-1', 'sup-1');

      const notificationService = (service as any).notificationService as InstanceType<typeof NotificationService>;
      expect(notificationService.sendAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'OVERSTAY',
          entryLogId: 'entry-1',
          workerId: 'worker-1',
        })
      );
    });

    it('should not trigger alert when within allowed duration', async () => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60000);

      vi.mocked(prisma.entryLog.findMany).mockResolvedValueOnce([
        {
          id: 'entry-2',
          workerId: 'worker-2',
          manholeId: 'manhole-2',
          taskId: null,
          shiftId: null,
          entryTime: tenMinutesAgo,
          exitTime: null,
          allowedDurationMinutes: 45,
          status: 'ACTIVE',
          state: 'ACTIVE',
          geoLatitude: 19.076,
          geoLongitude: 72.877,
          geoVerified: true,
          checklistCompleted: true,
          teamEntryId: null,
          isOfflineEntry: false,
          syncedAt: null,
          notes: null,
          createdAt: tenMinutesAgo,
          updatedAt: tenMinutesAgo,
          worker: { id: 'worker-2', name: 'Suresh Patil', supervisorId: 'sup-1' },
          manhole: { id: 'manhole-2', area: 'Andheri East' },
        },
      ] as any);

      await service.checkActiveEntries();

      const alertService = (service as any).alertService as InstanceType<typeof AlertService>;
      expect(alertService.triggerOverstayAlert).not.toHaveBeenCalled();
    });
  });

  describe('checkPendingCheckIns', () => {
    it('should prompt check-in when interval elapsed', async () => {
      const twentyMinutesAgo = new Date(Date.now() - 20 * 60000);

      vi.mocked(prisma.entryLog.findMany).mockResolvedValueOnce([
        {
          id: 'entry-3',
          workerId: 'worker-3',
          manholeId: 'manhole-3',
          entryTime: twentyMinutesAgo,
          status: 'ACTIVE',
          state: 'ACTIVE',
          checkIns: [
            {
              id: 'ci-1',
              promptedAt: twentyMinutesAgo,
              respondedAt: new Date(twentyMinutesAgo.getTime() + 30000),
              wasOnTime: true,
            },
          ],
        },
      ] as any);

      const mockCheckIn = { id: 'ci-new', entryLogId: 'entry-3', workerId: 'worker-3', promptedAt: new Date() };
      const checkInService = (service as any).checkInService;
      checkInService.promptCheckIn.mockResolvedValueOnce(mockCheckIn);

      await service.checkPendingCheckIns();

      expect(checkInService.promptCheckIn).toHaveBeenCalledWith('entry-3', 'worker-3');

      const notificationService = (service as any).notificationService;
      expect(notificationService.sendCheckInPrompt).toHaveBeenCalledWith('worker-3', 'entry-3', 'ci-new');
    });

    it('should skip if there is already an unanswered check-in', async () => {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60000);

      vi.mocked(prisma.entryLog.findMany).mockResolvedValueOnce([
        {
          id: 'entry-4',
          workerId: 'worker-4',
          manholeId: 'manhole-4',
          entryTime: new Date(Date.now() - 30 * 60000),
          status: 'ACTIVE',
          state: 'ACTIVE',
          checkIns: [
            {
              id: 'ci-pending',
              promptedAt: fifteenMinutesAgo,
              respondedAt: null,
              wasOnTime: false,
            },
          ],
        },
      ] as any);

      await service.checkPendingCheckIns();

      const checkInService = (service as any).checkInService;
      expect(checkInService.promptCheckIn).not.toHaveBeenCalled();
    });
  });

  describe('checkMissedCheckIns', () => {
    it('should trigger SOS after 3+ missed check-ins', async () => {
      vi.mocked(prisma.entryLog.findMany).mockResolvedValueOnce([
        {
          id: 'entry-5',
          workerId: 'worker-5',
          manholeId: 'manhole-5',
          status: 'ACTIVE',
          state: 'ACTIVE',
        },
      ] as any);

      const checkInService = (service as any).checkInService;
      checkInService.getConsecutiveMissedCount.mockResolvedValueOnce(3);

      await service.checkMissedCheckIns();

      const sosService = (service as any).sosService;
      expect(sosService.triggerSOS).toHaveBeenCalledWith({
        workerId: 'worker-5',
        entryLogId: 'entry-5',
        method: 'auto_missed_checkin',
      });

      const notificationService = (service as any).notificationService;
      expect(notificationService.broadcastSOS).toHaveBeenCalledWith('entry-5', 'worker-5', 'AUTO_MISSED_CHECKIN');
    });

    it('should handle missed check-in below SOS threshold', async () => {
      vi.mocked(prisma.entryLog.findMany).mockResolvedValueOnce([
        {
          id: 'entry-6',
          workerId: 'worker-6',
          manholeId: 'manhole-6',
          status: 'ACTIVE',
          state: 'ACTIVE',
        },
      ] as any);

      const checkInService = (service as any).checkInService;
      checkInService.getConsecutiveMissedCount.mockResolvedValueOnce(2);

      await service.checkMissedCheckIns();

      expect(checkInService.handleMissedCheckIn).toHaveBeenCalledWith('entry-6');

      const notificationService = (service as any).notificationService;
      expect(notificationService.sendAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'CHECKIN_MISSED',
          entryLogId: 'entry-6',
          workerId: 'worker-6',
        })
      );
    });
  });

  describe('checkGasAlerts', () => {
    it('should set GAS_ALERT state for dangerous readings', async () => {
      vi.mocked(prisma.entryLog.findMany).mockResolvedValueOnce([
        {
          id: 'entry-7',
          workerId: 'worker-7',
          manholeId: 'manhole-7',
          status: 'ACTIVE',
          state: 'ACTIVE',
          manhole: { id: 'manhole-7', hasGasSensor: true, area: 'Kurla West' },
          worker: { id: 'worker-7', name: 'Amit Sharma', supervisorId: 'sup-2' },
        },
      ] as any);

      const recentReading = {
        id: 'gas-1',
        manholeId: 'manhole-7',
        h2s: 25,
        ch4: 0,
        co: 0,
        o2: 20.9,
        co2: 0,
        nh3: 0,
        temperature: 30,
        humidity: 70,
        isDangerous: true,
        alertTriggered: false,
        source: 'sensor',
        readAt: new Date(Date.now() - 2 * 60000), // 2 minutes ago
      };

      vi.mocked(prisma.gasReading.findFirst).mockResolvedValueOnce(recentReading as any);
      vi.mocked(prisma.entryLog.update).mockResolvedValueOnce({} as any);

      await service.checkGasAlerts();

      expect(prisma.entryLog.update).toHaveBeenCalledWith({
        where: { id: 'entry-7' },
        data: { state: 'GAS_ALERT' },
      });

      const alertService = (service as any).alertService;
      expect(alertService.createAlert).toHaveBeenCalledWith('entry-7', 'GAS_DANGEROUS', 'sup-2', 'push');

      const notificationService = (service as any).notificationService;
      expect(notificationService.sendAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'GAS_ALERT',
          entryLogId: 'entry-7',
          workerId: 'worker-7',
          priority: 'critical',
        })
      );
    });

    it('should skip manholes without gas sensors', async () => {
      vi.mocked(prisma.entryLog.findMany).mockResolvedValueOnce([
        {
          id: 'entry-8',
          workerId: 'worker-8',
          manholeId: 'manhole-8',
          status: 'ACTIVE',
          state: 'ACTIVE',
          manhole: { id: 'manhole-8', hasGasSensor: false, area: 'Bandra' },
          worker: { id: 'worker-8', name: 'Vijay Rao', supervisorId: 'sup-3' },
        },
      ] as any);

      await service.checkGasAlerts();

      expect(prisma.gasReading.findFirst).not.toHaveBeenCalled();
      expect(prisma.entryLog.update).not.toHaveBeenCalled();
    });
  });
});
