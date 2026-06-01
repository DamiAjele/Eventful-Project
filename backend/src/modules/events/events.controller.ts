import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async create(@Body() body: any) {
    return this.eventsService.createEvent(body);
  }

  @Post(':id/tiers')
  async addTier(@Param('id') id: string, @Body() body: any) {
    return this.eventsService.addTier(id, body);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.eventsService.findEventById(id);
  }
}

export default EventsController;
