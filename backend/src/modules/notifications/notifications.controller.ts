import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { NotificationsService } from './notifications.service';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: 'Schedule a reminder notification for an event' })
  @ApiBody({
    schema: {
      properties: {
        eventId: { type: 'string' },
        message: { type: 'string' },
        sendAt: { type: 'string', format: 'date-time' },
        recipients: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
              name: { type: 'string' },
            },
            required: ['email'],
          },
        },
      },
      required: ['eventId', 'message', 'sendAt', 'recipients'],
    },
  })
  @ApiCreatedResponse({
    description: 'Reminder scheduled successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid reminder scheduling request',
  })
  @Post('reminders')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
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
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async listNotifications(@Query('limit') limit?: string) {
    const n = limit ? Number(limit) : undefined;
    return this.notificationsService.listNotifications(n ?? 100);
  }

  @Get('reminders')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async listReminders(@Query('limit') limit?: string) {
    const n = limit ? Number(limit) : undefined;
    return this.notificationsService.listReminders(n ?? 100);
  }
}

export default NotificationsController;
