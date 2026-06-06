import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('events/:eventId/summary')
  @Roles(UserRole.CREATOR)
  @ApiOperation({ summary: 'Get event summary' })
  @ApiCreatedResponse({
    description: 'Event summary retrieved successfully',
    type: Object,
  })
  @ApiBadRequestResponse({ description: 'Invalid event ID' })
  async eventSummary(@Param('eventId') id: string) {
    return this.analytics.getEventSummary(id);
  }
}

export default AnalyticsController;
