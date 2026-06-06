jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({
    data: { data: { reference: 'ref', authorization_url: 'url' } },
  }),
  get: jest.fn().mockResolvedValue({ data: { data: { status: 'success' } } }),
}));

import { PaymentsService } from '../payments.service';

describe('PaymentsService', () => {
  const paymentsRepo: any = {
    create: jest.fn().mockImplementation((x) => x),
    save: jest.fn().mockResolvedValue({ id: 'p1', reference: 'ref' }),
    findOne: jest.fn().mockResolvedValue({
      id: 'p1',
      reference: 'ref',
      type: { id: 't1' },
      quantity: 1,
      fulfilled: false,
    }),
  };
  const tiersRepo: any = {
    findOneBy: jest
      .fn()
      .mockResolvedValue({ id: 't1', price: '10', remainingQuantity: 10 }),
  };
  const ticketsRepo: any = {
    save: jest.fn().mockResolvedValue({ id: 'ticket1' }),
  };
  const dataSource: any = {
    transaction: jest.fn().mockImplementation((cb) =>
      cb({
        findOne: jest
          .fn()
          .mockResolvedValue({ id: 't1', remainingQuantity: 10 }),
        save: jest.fn().mockResolvedValue({}),
        create: (cls, x) => x,
      }),
    ),
  };
  const config: any = { get: (_k: string) => 'sk_test' };
  let service: PaymentsService;

  beforeEach(() => {
    service = new PaymentsService(
      config as any,
      dataSource as any,
      paymentsRepo as any,
      tiersRepo as any,
      ticketsRepo as any,
    );
  });

  it('initializes payment and creates record', async () => {
    const res = await service.initializePayment('t1', 1, 'a@x.com');
    expect(res.reference).toBe('ref');
  });

  it('verifies and fulfills payment', async () => {
    const res = await service.verifyAndFulfill('ref');
    expect(res.success).toBe(true);
    expect(res.tickets).toBeDefined();
  });
});
