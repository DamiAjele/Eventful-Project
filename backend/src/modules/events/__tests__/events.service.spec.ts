import { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EventsService } from '../events.service'; // Ensure this path is correct

describe('EventsService', () => {
  // 1. Declare the mock variables at the top scope
  let eventsRepoMock: jest.Mocked<Partial<Repository<any>>>;
  let tiersRepoMock: jest.Mocked<Partial<Repository<any>>>;
  let service: EventsService;

  beforeEach(() => {
    // 2. Re-initialize the mock objects before EVERY test to prevent state leakage
    eventsRepoMock = {
      create: jest.fn().mockImplementation((x) => x),
      save: jest.fn().mockResolvedValue({ id: 'e1' }),
      findOne: jest.fn().mockResolvedValue({ id: 'e1' }),
      findOneBy: jest.fn().mockResolvedValue({ id: 'e1' }),
    };

    tiersRepoMock = {
      create: jest.fn().mockImplementation((x) => x),
      save: jest.fn().mockResolvedValue({ id: 't1' }),
    };

    // 3. Clear call histories just to be safe
    jest.clearAllMocks();

    // 4. Instantiate your service with the fresh mocks
    service = new EventsService(
      eventsRepoMock as Repository<any>,
      tiersRepoMock as Repository<any>,
    );
  });

  it('creates event and adds tier', async () => {
    // Act
    const ev = await service.createEvent({ title: 'E' } as any);

    // Assert Event
    expect(ev).toHaveProperty('id', 'e1');
    expect(eventsRepoMock.create).toHaveBeenCalledWith({ title: 'E' });
    expect(eventsRepoMock.save).toHaveBeenCalled();

    // Act
    const tier = await service.addTier('e1', {
      name: 'General',
      quantity: 10,
    } as any);

    // Assert Tier
    expect(tier).toHaveProperty('id', 't1');
    expect(tiersRepoMock.create).toHaveBeenCalled();
    expect(tiersRepoMock.save).toHaveBeenCalled();
  });
});
