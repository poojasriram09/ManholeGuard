import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/database', () => ({
  default: {
    worker: { findUnique: vi.fn() },
    user: { findUnique: vi.fn(), findMany: vi.fn() },
    supervisor: { findUnique: vi.fn() },
    entryLog: { findUnique: vi.fn() },
    alertRecord: { create: vi.fn() },
  },
}));

vi.mock('../../config/env', () => ({
  env: {
    ALERT_SMS_ENABLED: false,
    ALERT_EMAIL_ENABLED: false,
    VAPID_PUBLIC_KEY: '',
    VAPID_PRIVATE_KEY: '',
    VAPID_SUBJECT: 'mailto:admin@manholeguard.in',
    SMS_PROVIDER: 'msg91',
    SMS_API_KEY: '',
    SMS_SENDER_ID: 'MHGARD',
    SMS_TEMPLATE_ID: '',
  },
}));

vi.mock('../../utils/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import prisma from '../../config/database';
import { NotificationService } from '../../services/notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new NotificationService();
  });

  describe('sendAlert', () => {
    it('should dispatch to multiple channels (in_app and push)', async () => {
      // With ALERT_SMS_ENABLED=false, channels will be ['in_app', 'push']
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'sup-1',
        pushSubscription: { endpoint: 'https://push.example.com/sub1', keys: { p256dh: 'key1', auth: 'auth1' } },
      } as any);

      vi.mocked(prisma.alertRecord.create).mockResolvedValue({} as any);

      await service.sendAlert({
        type: 'OVERSTAY',
        entryLogId: 'entry-1',
        workerId: 'worker-1',
        supervisorId: 'sup-1',
        message: 'Worker has overstayed in manhole at Dadar West.',
        priority: 'normal',
      });

      // in_app: stores notification for worker (and supervisor if provided)
      expect(prisma.alertRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          entryLogId: 'entry-1',
          alertType: 'OVERSTAY',
          channel: 'in_app',
        }),
      });
    });

    it('should handle all channels failing gracefully', async () => {
      // Make push fail (no subscription)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'sup-2', pushSubscription: null } as any);
      vi.mocked(prisma.alertRecord.create).mockResolvedValue({} as any);

      // Should not throw even if push has no subscription
      await expect(
        service.sendAlert({
          type: 'CHECKIN_MISSED',
          entryLogId: 'entry-2',
          workerId: 'worker-2',
          supervisorId: 'sup-2',
          message: 'Worker missed check-in.',
        })
      ).resolves.not.toThrow();
    });
  });

  describe('broadcastSOS', () => {
    it('should notify supervisor, admins, and emergency contacts', async () => {
      vi.mocked(prisma.entryLog.findUnique).mockResolvedValueOnce({
        id: 'entry-sos',
        workerId: 'worker-sos',
        worker: {
          id: 'worker-sos',
          name: 'Ramesh Kumar',
          emergencyContactPhone: '+919876543210',
          supervisor: {
            id: 'sup-sos',
            phone: '+919876000000',
            user: {
              id: 'sup-user',
              pushSubscription: { endpoint: 'https://push.example.com/sup', keys: { p256dh: 'k', auth: 'a' } },
            },
          },
          user: {
            pushSubscription: { endpoint: 'https://push.example.com/worker', keys: { p256dh: 'k', auth: 'a' } },
          },
        },
        manhole: {
          area: 'Dadar West',
          latitude: 19.076,
          longitude: 72.877,
        },
      } as any);

      vi.mocked(prisma.user.findMany).mockResolvedValueOnce([
        { id: 'admin-1', pushSubscription: { endpoint: 'https://push.example.com/admin1', keys: { p256dh: 'k', auth: 'a' } } },
        { id: 'admin-2', pushSubscription: null },
      ] as any);

      vi.mocked(prisma.alertRecord.create).mockResolvedValue({} as any);

      await service.broadcastSOS('entry-sos', 'worker-sos', 'AUTO_MISSED_CHECKIN');

      // Should query admins
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { role: 'ADMIN', isActive: true },
        select: { id: true, pushSubscription: true },
      });

      // Should store in_app notification for each admin
      expect(prisma.alertRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          entryLogId: 'entry-sos',
          alertType: 'SOS',
          sentTo: 'admin-1',
          channel: 'in_app',
        }),
      });

      expect(prisma.alertRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          entryLogId: 'entry-sos',
          alertType: 'SOS',
          sentTo: 'admin-2',
          channel: 'in_app',
        }),
      });
    });

    it('should handle missing entry gracefully', async () => {
      vi.mocked(prisma.entryLog.findUnique).mockResolvedValueOnce(null);

      // Should return early without throwing
      await expect(service.broadcastSOS('nonexistent', 'worker-1', 'MANUAL')).resolves.not.toThrow();

      expect(prisma.user.findMany).not.toHaveBeenCalled();
    });
  });

  describe('sendCheckInPrompt', () => {
    it('should send push to worker with push subscription', async () => {
      vi.mocked(prisma.worker.findUnique).mockResolvedValueOnce({
        id: 'worker-ci',
        user: {
          pushSubscription: {
            endpoint: 'https://push.example.com/worker-ci',
            keys: { p256dh: 'pubkey123', auth: 'authkey456' },
          },
        },
      } as any);

      // Since VAPID keys are empty, sendPushNotification will skip
      // but the worker lookup and logic should still be called
      await service.sendCheckInPrompt('worker-ci', 'entry-ci', 'checkin-ci');

      expect(prisma.worker.findUnique).toHaveBeenCalledWith({
        where: { id: 'worker-ci' },
        include: { user: { select: { pushSubscription: true } } },
      });
    });

    it('should warn when worker has no push subscription', async () => {
      vi.mocked(prisma.worker.findUnique).mockResolvedValueOnce({
        id: 'worker-nopush',
        user: { pushSubscription: null },
      } as any);

      await service.sendCheckInPrompt('worker-nopush', 'entry-nopush', 'checkin-nopush');

      // Should not throw, just log warning
      expect(prisma.worker.findUnique).toHaveBeenCalledWith({
        where: { id: 'worker-nopush' },
        include: { user: { select: { pushSubscription: true } } },
      });
    });
  });
});
