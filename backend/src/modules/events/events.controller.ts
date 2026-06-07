import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import {
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateEventDto, updateEventDto } from '../events/dto/event.dto';
import { CreateTicketTierDto } from './dto/ticket-type.dto';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('create-event')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  @ApiOperation({ summary: 'Create a new event' })
  @ApiBody({ type: CreateEventDto })
  @ApiCreatedResponse({
    description: 'Event created successfully',
    type: Object,
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async create(@Body() body: CreateEventDto) {
    await this.eventsService.createEvent({
      ...body,
      startAt:
        typeof body.startAt === 'object' &&
        (body.startAt as any) instanceof Date
          ? body.startAt
          : body.startAt,
      endAt:
        typeof body.endAt === 'object' && (body.endAt as any) instanceof Date
          ? body.endAt
          : body.endAt,
    });

    return {
      message: 'Event created successfully',
      event: body,
      startAt: body.startAt,
      endAt: body.endAt,
    };
  }

  @Post(':eventId/ticket-type')
  @Roles(UserRole.CREATOR)
  @ApiOperation({ summary: 'Add a ticket type to an existing event' })
  @ApiBody({ type: CreateTicketTierDto })
  @ApiCreatedResponse({
    description: 'Ticket type added successfully',
    type: Object,
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async addTicketType(
    @Param('eventId') id: string,
    @Body() body: CreateTicketTierDto,
  ) {
    return this.eventsService.addTicketType(id, body);
  }

  @Get(':id')
  @Roles(UserRole.CREATOR, UserRole.ATTENDEE)
  @ApiOperation({ summary: 'Get event details' })
  @ApiCreatedResponse({
    description: 'Event details retrieved successfully',
    type: Object,
  })
  @ApiBadRequestResponse({ description: 'Event not found' })
  async get(@Param('id') id: string) {
    return this.eventsService.findEventById(id);
  }

  @Put(':id')
  @Roles(UserRole.CREATOR)
  @ApiOperation({ summary: 'Update event details' })
  @ApiBody({ type: updateEventDto })
  @ApiCreatedResponse({
    description: 'Event updated successfully',
    type: Object,
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async update(@Param('id') id: string, @Body() body: updateEventDto) {
    return this.eventsService.updateEvent(id, body);
  }

  @Get()
  @Roles(UserRole.CREATOR, UserRole.ATTENDEE)
  @ApiOperation({ summary: 'Get all events' })
  @ApiCreatedResponse({
    description: 'Events retrieved successfully',
    type: [Object],
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async findAll() {
    return this.eventsService.findAllEvents();
  }
}

export default EventsController;
