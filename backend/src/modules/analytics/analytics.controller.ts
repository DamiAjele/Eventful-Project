import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('events/:eventId/summary')
  async eventSummary(@Param('eventId') id: string) {
    return this.analytics.getEventSummary(id);
  }
}

export default AnalyticsController;
