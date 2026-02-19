import prisma from '../config/database';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface AlertPayload {
  type: string;
  entryLogId: string;
  workerId: string;
  supervisorId?: string;
  message: string;
  priority?: 'normal' | 'high' | 'critical';
}

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  vibrate?: number[];
  data?: Record<string, unknown>;
}

export class NotificationService {
  /** Multi-channel alert dispatch based on type and priority */
  async sendAlert(payload: AlertPayload) {
    const { type, entryLogId, workerId, supervisorId, message, priority = 'normal' } = payload;

    const channels: string[] = ['in_app'];

    // Always push
    channels.push('push');

    // SMS for high/critical priority
    if ((priority === 'high' || priority === 'critical') && env.ALERT_SMS_ENABLED) {
      channels.push('sms');
    }

    const results = await Promise.allSettled(
      channels.map(async (channel) => {
        switch (channel) {
          case 'push':
            if (supervisorId) {
              await this.sendPushToUser(supervisorId, {
                title: `ManholeGuard Alert: ${type}`,
                body: message,
                tag: `alert-${type}-${entryLogId}`,
                vibrate: priority === 'critical' ? [200, 100, 200, 100, 400] : [200, 100, 200],
                data: { type, entryLogId, workerId },
              });
            }
            break;
          case 'sms':
            if (supervisorId) {
              await this.sendSMSToUser(supervisorId, message);
            }
            break;
          case 'in_app':
            await this.storeInAppNotification(workerId, type, message, entryLogId);
            if (supervisorId) {
              await this.storeInAppNotification(supervisorId, type, message, entryLogId);
            }
            break;
        }
      })
    );

    const failures = results.filter((r) => r.status === 'rejected');
    if (failures.length > 0) {
      logger.warn(`${failures.length}/${channels.length} notification channels failed for ${type}`);
    }

    logger.info(`Alert dispatched: type=${type} entry=${entryLogId} channels=${channels.join(',')}`);
  }

  /** Send push notification to a specific worker */
  async sendCheckInPrompt(workerId: string, entryLogId: string, checkInId: string) {
    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      include: { user: { select: { pushSubscription: true } } },
    });

    if (!worker?.user?.pushSubscription) {
      logger.warn(`No push subscription for worker ${workerId}`);
      return;
    }

    await this.sendPushNotification(worker.user.pushSubscription as any, {
      title: 'Check-In Required',
      body: 'Tap to confirm you are safe. You have 60 seconds.',
      tag: `checkin-${checkInId}`,
      vibrate: [300, 100, 300, 100, 300],
      data: { type: 'CHECKIN_PROMPT', entryLogId, checkInId },
    });

    logger.info(`Check-in prompt pushed: worker=${workerId} checkIn=${checkInId}`);
  }

  /** Broadcast SOS to supervisor, admins, and emergency contacts */
  async broadcastSOS(entryLogId: string, workerId: string, reason: string) {
    const entry = await prisma.entryLog.findUnique({
      where: { id: entryLogId },
      include: {
        worker: {
          include: {
            user: { select: { pushSubscription: true } },
            supervisor: { include: { user: { select: { id: true, pushSubscription: true } } } },
          },
        },
        manhole: { select: { area: true, latitude: true, longitude: true } },
      },
    });

    if (!entry) return;

    const sosMessage = `SOS EMERGENCY: Worker ${entry.worker.name} at ${entry.manhole.area}. Reason: ${reason}. Location: ${entry.manhole.latitude}, ${entry.manhole.longitude}`;

    // Notify supervisor
    if (entry.worker.supervisor) {
      const supSub = entry.worker.supervisor.user?.pushSubscription;
      if (supSub) {
        await this.sendPushNotification(supSub as any, {
          title: 'SOS EMERGENCY',
          body: sosMessage,
          tag: `sos-${entryLogId}`,
          vibrate: [500, 200, 500, 200, 500, 200, 500],
          data: { type: 'SOS', entryLogId, workerId },
        });
      }

      if (env.ALERT_SMS_ENABLED) {
        await this.sendSMSToUser(entry.worker.supervisor.id, sosMessage);
      }
    }

    // Notify all admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true, pushSubscription: true },
    });

    for (const admin of admins) {
      if (admin.pushSubscription) {
        await this.sendPushNotification(admin.pushSubscription as any, {
          title: 'SOS EMERGENCY',
          body: sosMessage,
          tag: `sos-${entryLogId}`,
          vibrate: [500, 200, 500, 200, 500, 200, 500],
          data: { type: 'SOS', entryLogId, workerId },
        });
      }
      await this.storeInAppNotification(admin.id, 'SOS', sosMessage, entryLogId);
    }

    // SMS to emergency contact
    if (env.ALERT_SMS_ENABLED && entry.worker.emergencyContactPhone) {
      await this.sendSMS(
        entry.worker.emergencyContactPhone,
        `EMERGENCY: ${entry.worker.name} triggered SOS at ${entry.manhole.area}. Contact authorities immediately.`
      );
    }

    logger.warn(`SOS broadcast completed: entry=${entryLogId} worker=${workerId}`);
  }

  /** Send web push notification */
  async sendPushNotification(subscription: any, payload: PushPayload) {
    if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
      logger.debug('VAPID keys not configured — skipping push');
      return;
    }

    try {
      const webpush = await import('web-push');
      webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);

      await webpush.sendNotification(subscription, JSON.stringify(payload));
    } catch (error: any) {
      if (error?.statusCode === 410 || error?.statusCode === 404) {
        logger.info('Push subscription expired — removing');
        // Subscription no longer valid
      } else {
        logger.error('Push notification failed:', error);
      }
      throw error;
    }
  }

  /** Send push to a user by looking up their subscription */
  private async sendPushToUser(userId: string, payload: PushPayload) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushSubscription: true },
    });

    if (!user?.pushSubscription) return;
    await this.sendPushNotification(user.pushSubscription, payload);
  }

  /** Send SMS via configured provider */
  async sendSMS(phone: string, message: string) {
    if (!env.ALERT_SMS_ENABLED) return;

    try {
      if (env.SMS_PROVIDER === 'twilio') {
        const twilio = await import('twilio' as string);
        const client = (twilio as any).default(env.SMS_API_KEY, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: message,
          from: env.SMS_SENDER_ID,
          to: phone,
        });
      } else {
        // MSG91 or other provider — HTTP API call
        const response = await fetch(`https://api.msg91.com/api/v5/flow/`, {
          method: 'POST',
          headers: {
            'authkey': env.SMS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            template_id: env.SMS_TEMPLATE_ID,
            sender: env.SMS_SENDER_ID,
            mobiles: phone,
            message,
          }),
        });
        if (!response.ok) {
          throw new Error(`MSG91 SMS failed: ${response.statusText}`);
        }
      }
      logger.info(`SMS sent to ${phone.slice(-4)}`);
    } catch (error) {
      logger.error('SMS send failed:', error);
      throw error;
    }
  }

  /** Send SMS to a user by looking up their phone */
  private async sendSMSToUser(userId: string, message: string) {
    const supervisor = await prisma.supervisor.findUnique({
      where: { id: userId },
      select: { phone: true },
    });
    if (supervisor?.phone) {
      await this.sendSMS(supervisor.phone, message);
    }
  }

  /** Store notification for in-app polling */
  async storeInAppNotification(userId: string, type: string, message: string, entryLogId?: string) {
    // Using alertRecord as in-app notification store
    if (entryLogId) {
      await prisma.alertRecord.create({
        data: {
          entryLogId,
          alertType: type,
          sentTo: userId,
          channel: 'in_app',
        },
      });
    }
  }
}
