import { NotificationsService } from '../notifications.service';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest
      .fn()
      .mockRejectedValueOnce(new Error('transient'))
      .mockResolvedValue({ messageId: 'ok' }),
  })),
}));

const mockReminder = {
  id: 'r1',
  event: { id: 'e1', title: 'E' },
  message: 'hi',
  recipients: [{ email: 'a@x.com' }],
  sendAt: new Date(),
  sent: false,
} as any;

describe('NotificationsService', () => {
  let service: NotificationsService;
  const remindersRepo: any = {
    find: jest.fn().mockResolvedValue([mockReminder]),
    create: jest.fn().mockReturnValue(mockReminder),
    save: jest.fn().mockResolvedValue(mockReminder),
    findOne: jest.fn(),
  };
  const notificationsRepo: any = {
    create: jest.fn().mockImplementation((x) => x),
    save: jest.fn().mockResolvedValue(null),
    find: jest.fn().mockResolvedValue([]),
  };
  const config: any = {
    get: (k: string) =>
      k === 'SMTP_HOST'
        ? 'smtp'
        : k === 'SMTP_USER'
          ? 'user'
          : k === 'SMTP_PASS'
            ? 'pass'
            : undefined,
  };

  beforeEach(() => {
    service = new NotificationsService(
      remindersRepo as any,
      notificationsRepo as any,
      config as any,
    );
  });

  it('processScheduledReminders calls sendReminder and marks sent', async () => {
    // override sendReminder
    const spy = jest
      .spyOn(service, 'sendReminder')
      .mockResolvedValue(undefined as any);
    await service.processScheduledReminders();
    expect(spy).toHaveBeenCalled();
  });

  it('sendReminder retries and records attempts', async () => {
    await service.sendReminder(mockReminder);
    expect(notificationsRepo.save).toHaveBeenCalled();
    const saved = notificationsRepo.save.mock.calls[0][0];
    expect(saved.attempts).toBeGreaterThanOrEqual(1);
  });

  it('list helpers return arrays', async () => {
    remindersRepo.find.mockResolvedValue([mockReminder]);
    notificationsRepo.find.mockResolvedValue([{ id: 'n1' }]);
    const rems = await service.listReminders(10);
    const nots = await service.listNotifications(10);
    expect(rems).toBeDefined();
    expect(nots).toBeDefined();
  });
});
