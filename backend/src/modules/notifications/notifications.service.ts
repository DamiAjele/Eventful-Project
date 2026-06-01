import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { EventReminder } from './entities/event-reminder.entity';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    @InjectRepository(EventReminder)
    private remindersRepo: Repository<EventReminder>,
    @InjectRepository(Notification)
    private notificationsRepo: Repository<Notification>,
    private config: ConfigService,
  ) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<number>('SMTP_PORT') || 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    if (host && user) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        auth: { user, pass },
      });
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

  private async sendMailWithRetry(
    mail: nodemailer.SendMailOptions,
    maxAttempts = 3,
    baseDelay = 500,
  ) {
    let attempt = 0;
    let lastErr: any = null;
    while (attempt < maxAttempts) {
      try {
        attempt++;
        if (!this.transporter) throw new Error('No transporter configured');
        const res = await this.transporter.sendMail(mail);
        return { success: true, attempt, info: res };
      } catch (err) {
        lastErr = err;
        const delayMs = baseDelay * Math.pow(2, attempt - 1);
        this.logger.warn(
          `Send attempt ${attempt} failed; retrying in ${delayMs}ms`,
        );
        await this.delay(delayMs);
      }
    }
    return { success: false, attempt: maxAttempts, error: lastErr };
  }

  async sendReminder(reminder: EventReminder) {
    if (!reminder.recipients || reminder.recipients.length === 0) return;
    for (const rec of reminder.recipients) {
      const notif = this.notificationsRepo.create({
        channel: 'email',
        recipient: rec.email,
        message: reminder.message,
      } as any);
      try {
        const mail = {
          from: this.config.get('EMAIL_FROM') || 'no-reply@example.com',
          to: rec.email,
          subject: `Reminder: ${reminder.event.title}`,
          text: reminder.message,
        } as nodemailer.SendMailOptions;
        const result = await this.sendMailWithRetry(mail, 3, 500);
        notif.attempts = result.attempt || 0;
        if (result.success) {
          notif.sent = true;
          notif.sentAt = new Date();
        } else {
          notif.lastError = String(result.error ?? 'unknown');
        }
      } catch (err) {
        this.logger.error(`Email send failed to ${rec.email}: ${err}`);
        notif.lastError = String(err);
      }
      await this.notificationsRepo.save(notif);
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
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async listReminders(limit = 100) {
    return this.remindersRepo.find({ order: { sendAt: 'DESC' }, take: limit });
  }
}

export default NotificationsService;
