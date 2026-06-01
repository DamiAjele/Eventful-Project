import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('reminders')
  async createReminder(
    @Body()
    body: {
      eventId: string;
      message: string;
      sendAt: string;
      recipients: { email: string; name?: string }[];
    },
  ) {
    const sendAt = new Date(body.sendAt);
    return this.notificationsService.scheduleReminder(
      body.eventId,
      body.message,
      sendAt,
      body.recipients || [],
    );
  }

  @Get('list')
  async listNotifications(@Query('limit') limit?: string) {
    const n = limit ? Number(limit) : undefined;
    return this.notificationsService.listNotifications(n ?? 100);
  }

  @Get('reminders')
  async listReminders(@Query('limit') limit?: string) {
    const n = limit ? Number(limit) : undefined;
    return this.notificationsService.listReminders(n ?? 100);
  }
}

export default NotificationsController;
