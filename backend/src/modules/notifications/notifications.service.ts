import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { EventReminder } from './entities/event-reminder.entity';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private resendClient: Resend | null = null; // 2. Cleanly type the SDK property

  constructor(
    @InjectRepository(EventReminder)
    private remindersRepo: Repository<EventReminder>,
    @InjectRepository(Notification)
    private notificationsRepo: Repository<Notification>,
    private config: ConfigService,
  ) {
    // 3. Resend only requires a single API Key instead of 4 SMTP parameters
    const apiKey = this.config.get<string>('RESEND_API_KEY');

    if (!apiKey) {
      this.logger.error(
        'RESEND_API_KEY configuration is missing! Email alerts will fail.',
      );
    } else {
      this.resendClient = new Resend(apiKey);
    }
  }

  // run every minute
  @Cron('*/1 * * * *')
  async processScheduledReminders() {
    this.logger.debug('Checking for scheduled reminders...');
    const pending = await this.remindersRepo.find({
      where: { sent: false, sendAt: () => `sendAt <= NOW()` } as any,
    });
    for (const r of pending) {
      try {
        await this.sendReminder(r);
        r.sent = true;
        await this.remindersRepo.save(r);
      } catch (err) {
        this.logger.error(`Failed to send reminder ${r.id}: ${err}`);
      }
    }
  }

  private async delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  // 4. Refactored mailer payload typing to use parameters that match Resend's API
  private async sendMailWithRetry(
    payload: { from: string; to: string; subject: string; text: string },
    maxAttempts = 3,
    baseDelay = 500,
  ) {
    let attempt = 0;
    let lastErr: any = null;

    while (attempt < maxAttempts) {
      try {
        attempt++;
        if (!this.resendClient)
          throw new Error('Resend client is not initialized');

        // 5. Fire via Resend SDK
        const { data, error } = await this.resendClient.emails.send(payload);

        if (error) {
          throw error; // Force entry into catch block for retry calculation
        }

        return { success: true, attempt, info: data };
      } catch (err) {
        lastErr = err;
        const delayMs = baseDelay * Math.pow(2, attempt - 1);
        this.logger.warn(
          `Send attempt ${attempt} failed; retrying in ${delayMs}ms. Error: ${JSON.stringify(err)}`,
        );
        await this.delay(delayMs);
      }
    }
    return { success: false, attempt: maxAttempts, error: lastErr };
  }

  async sendReminder(reminder: EventReminder) {
    if (!reminder.recipients || reminder.recipients.length === 0) return;

    for (const rec of reminder.recipients) {
      // Fixed the previous type casting error (was casting as a Notification array)
      const notif = this.notificationsRepo.create({
        channel: 'email',
        recipient: rec.email,
        message: reminder.message,
        sent: false,
        attempts: 0,
      }) as Notification;

      try {
        const mailPayload = {
          from: this.config.get<string>('EMAIL_FROM') || 'no-reply@example.com',
          to: rec.email,
          subject: `Reminder: ${reminder.event?.title || 'Upcoming Event'}`,
          text: reminder.message,
        };

        const result = await this.sendMailWithRetry(mailPayload, 3, 500);

        if (result.success) {
          notif.sent = true;
          notif.sentAt = new Date();
        } else {
          notif.lastError =
            typeof result.error === 'object'
              ? JSON.stringify(result.error)
              : String(result.error ?? 'unknown');
        }
      } catch (err) {
        this.logger.error(`Email send failed to ${rec.email}: ${err}`);
        notif.lastError = String(err);
      }

      await this.notificationsRepo.save(notif as any);
    }
  }

  async scheduleReminder(
    eventId: string,
    message: string,
    sendAt: Date,
    recipients: { email: string; name?: string }[],
  ) {
    const rem = this.remindersRepo.create({
      event: { id: eventId } as any,
      message,
      sendAt,
      recipients,
    } as any);
    return this.remindersRepo.save(rem);
  }

  // Admin helpers
  async listNotifications(limit = 100) {
    return this.notificationsRepo.find({
      order: { createdAt: 'DESC' } as any,
      take: limit,
    });
  }

  async listReminders(limit = 100) {
    return this.remindersRepo.find({
      order: { sendAt: 'DESC' } as any,
      take: limit,
    });
  }
}

export default NotificationsService;
