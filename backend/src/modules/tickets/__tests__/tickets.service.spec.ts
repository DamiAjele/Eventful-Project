import { TicketsService } from '../tickets.service';

describe('TicketsService', () => {
  const ticketsRepo: any = {
    save: jest.fn().mockImplementation((x) => Promise.resolve(x)),
  };
  const tiersRepo: any = {
    findOne: jest.fn(),
    save: jest.fn().mockResolvedValue({ id: 'tier1', remainingQuantity: 9 }),
  };
  const dataSource: any = {
    transaction: jest.fn().mockImplementation((cb) =>
      cb({
        findOne: jest
          .fn()
          .mockResolvedValue({ id: 'tier1', remainingQuantity: 10 }),
        save: jest.fn().mockImplementation((x) => Promise.resolve(x)),
        create: (cls, x) => x,
      }),
    ),
  };
  let service: TicketsService;

  beforeEach(() => {
    service = new TicketsService(
      ticketsRepo as any,
      tiersRepo as any,
      dataSource as any,
    );
  });

  it('purchases tickets and returns created tickets', async () => {
    const res = await service.purchaseTier(null, 'tier1', 2);
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(2);
  });
});
