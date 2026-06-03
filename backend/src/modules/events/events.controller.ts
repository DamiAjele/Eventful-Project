import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { EventsService } from './events.service';
import {
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { CreateEventDto, updateEventDto } from '../events/dto/event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiBody({ type: CreateEventDto })
  @ApiCreatedResponse({
    description: 'Event created successfully',
    type: Object,
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async create(@Body() body: CreateEventDto) {
    return this.eventsService.createEvent({
      ...body,
      startAt:
        typeof body.startAt === 'string'
          ? new Date(body.startAt)
          : body.startAt,
      endAt: typeof body.endAt === 'string' ? new Date(body.endAt) : body.endAt,
    });
  }

  @Post(':id/tiers')
  @ApiOperation({ summary: 'Add a tier to an existing event' })
  @ApiBody({ type: Object })
  @ApiCreatedResponse({
    description: 'Tier added successfully',
    type: Object,
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async addTier(@Param('id') id: string, @Body() body: any) {
    return this.eventsService.addTier(id, body);
  }

  @Get(':id')
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
