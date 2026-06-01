jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({ secure_url: 'http://cdn/qr.png' }),
    },
  },
}));
import { QrService } from '../qr.service';
import { Repository } from 'typeorm';

const mockTicket = {
  id: 't1',
  code: 'CODE1',
  qrCodeUrl: null,
  used: false,
} as any;

describe('QrService', () => {
  let service: QrService;
  const ticketsRepo: Partial<Repository<any>> = {
    findOneBy: jest.fn().mockResolvedValue(mockTicket),
    save: jest.fn().mockImplementation((t) => Promise.resolve(t)),
  };
  const cache: any = {
    exists: jest.fn().mockResolvedValue(false),
    set: jest.fn().mockResolvedValue(null),
  };
  const dataSource: any = {
    transaction: (cb: any) =>
      cb({
        findOne: jest.fn().mockResolvedValue(mockTicket),
        save: jest.fn().mockResolvedValue(mockTicket),
      }),
  };

  beforeEach(() => {
    service = new QrService(
      ticketsRepo as any,
      dataSource as any,
      cache as any,
      { get: () => undefined } as any,
    );
  });

  it('generates a QR and saves to ticket', async () => {
    const res = await service.generateForTicket('t1');
    expect(res.qrCodeUrl).toBeDefined();
    expect(ticketsRepo.save).toHaveBeenCalled();
  });

  it('validates a code and marks ticket used', async () => {
    const res = await service.validateCode('CODE1', {
      id: 'aud1',
      name: 'Auditor',
    });
    expect(res.valid).toBe(true);
    expect(res.scannedBy).toBe('Auditor');
  });
});
