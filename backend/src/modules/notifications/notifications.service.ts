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
    const now = new Date();
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

  async sendReminder(reminder: EventReminder) {
    if (!reminder.recipients || reminder.recipients.length === 0) return;
    for (const rec of reminder.recipients) {
      const notif = this.notificationsRepo.create({
        channel: 'email',
        recipient: rec.email,
        message: reminder.message,
      } as any);
      try {
        if (this.transporter) {
          await this.transporter.sendMail({
            from: this.config.get('EMAIL_FROM') || 'no-reply@example.com',
            to: rec.email,
            subject: `Reminder: ${reminder.event.title}`,
            text: reminder.message,
          });
          notif.sent = true;
          notif.sentAt = new Date();
        }
      } catch (err) {
        this.logger.error(`Email send failed to ${rec.email}: ${err}`);
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
}

export default NotificationsService;
