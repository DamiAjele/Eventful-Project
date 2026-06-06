import { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { EventsService } from '../events.service';
import { Event } from '../entities/event.entity';
import { TicketType } from '../entities/ticket-type.entity';
describe('EventsService', () => {
  let service: EventsService;
  let eventsRepoMock: jest.Mocked<Partial<Repository<Event>>>;
  let tiersRepoMock: jest.Mocked<Partial<Repository<TicketType>>>;

  beforeEach(() => {
    // 1. Build a structurally valid mock representing our entities
    eventsRepoMock = {
      // Cast jest.fn() to match the specific signature TypeORM expects
      create: jest
        .fn<Repository<Event>['create']>()
        .mockImplementation((dto: any) => dto as Event),

      save: jest
        .fn()
        .mockImplementation((entity) =>
          Promise.resolve({ id: 'e1', ...entity } as Event),
        ),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
    };

    tiersRepoMock = {
      create: jest.fn().mockImplementation((dto) => dto as TicketType),
      save: jest
        .fn()
        .mockImplementation((entity) =>
          Promise.resolve({ id: 't1', ...entity } as TicketType),
        ),
    };

    jest.clearAllMocks();

    service = new EventsService(
      eventsRepoMock as Repository<Event>,
      tiersRepoMock as Repository<TicketType>,
    );
  });

  describe('createEvent', () => {
    it('should successfully create and save an event', async () => {
      const eventData = { title: 'Tech Conference 2026' };

      const result = await service.createEvent(eventData);

      expect(result).toHaveProperty('id', 'e1');
      expect(result.title).toBe(eventData.title);
      expect(eventsRepoMock.create).toHaveBeenCalledWith(eventData);
      expect(eventsRepoMock.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('addTier', () => {
    it('should successfully add a ticket tier to an existing event', async () => {
      const mockEvent = { id: 'e1', title: 'Tech Conference 2026' } as Event;
      eventsRepoMock.findOneBy!.mockResolvedValue(mockEvent);

      const typeData = {
        name: 'VIP',
        quantity: 50,
        price: 200,
        remainingQuantity: 50,
      };

      const result = await service.addTicketType('e1', typeData);

      // service.addTicketType returns an array of ticket types
      expect(result).toHaveProperty('id', 't1');
      expect(result[0].remainingQuantity).toBe(50);
      expect(eventsRepoMock.findOneBy).toHaveBeenCalledWith({ id: 'e1' });
      expect(tiersRepoMock.create).toHaveBeenCalledWith({
        ...typeData,
        event: mockEvent,
      });
      expect(tiersRepoMock.save).toHaveBeenCalledTimes(1);
    });

    it('should throw a NotFoundException if the target event does not exist', async () => {
      eventsRepoMock.findOneBy!.mockResolvedValue(null); // Event missing in DB

      const action = service.addTicketType('invalid-id', {
        name: 'General',
        quantity: 100,
        price: 80,
        remainingQuantity: 100,
      });

      await expect(action).rejects.toThrow(NotFoundException);
      expect(tiersRepoMock.create).not.toHaveBeenCalled();
      expect(tiersRepoMock.save).not.toHaveBeenCalled();
    });
  });

  describe('findEventById', () => {
    it('should return an event along with its relations if found', async () => {
      const mockEvent = { id: 'e1', title: 'Concert', tiers: [] } as Event;
      eventsRepoMock.findOne!.mockResolvedValue(mockEvent);

      const result = await service.findEventById('e1');

      expect(result).toEqual(mockEvent);
      expect(eventsRepoMock.findOne).toHaveBeenCalledWith({
        where: { id: 'e1' },
        relations: ['tiers'],
      });
    });

    it('should throw a NotFoundException if findOne returns null', async () => {
      eventsRepoMock.findOne!.mockResolvedValue(null);

      const action = service.findEventById('missing-id');

      await expect(action).rejects.toThrow(NotFoundException);
    });
  });
});
