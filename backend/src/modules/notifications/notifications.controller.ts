import { Body, Controller, Post } from '@nestjs/common';
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
}

export default NotificationsController;
