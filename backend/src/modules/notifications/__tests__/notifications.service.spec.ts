import { NotificationsService } from '../notifications.service';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { Repository } from 'typeorm';
import { EventReminder } from '../entities/event-reminder.entity';
import { Notification } from '../entities/notification.entity';
import { ConfigService } from '@nestjs/config';

// 1. Mock the 'resend' package instead of nodemailer
const mockSendEmail = jest.fn();
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: mockSendEmail,
      },
    })),
  };
});

describe('NotificationsService', () => {
  let service: NotificationsService;
  let remindersRepoMock: jest.Mocked<Partial<Repository<EventReminder>>>;
  let notificationsRepoMock: jest.Mocked<Partial<Repository<Notification>>>;
  let configMock: jest.Mocked<Partial<ConfigService>>;

  let mockReminder: EventReminder;

  beforeEach(() => {
    mockReminder = {
      id: 'r1',
      event: { id: 'e1', title: 'Tech Event' },
      message: 'hi',
      recipients: [{ email: 'a@x.com' }],
      sendAt: new Date(),
      sent: false,
    } as any;

    // 2. Re-initialize repositories inside beforeEach to prevent state leaking
    remindersRepoMock = {
      find: jest.fn<any>().mockResolvedValue([mockReminder]),
      create: jest.fn<any>().mockReturnValue(mockReminder),
      save: jest.fn<any>().mockResolvedValue(mockReminder),
    };

    notificationsRepoMock = {
      create: jest.fn<any>().mockImplementation((x: any) => x as Notification),
      save: jest.fn<any>().mockResolvedValue({} as any),
      find: jest.fn<any>().mockResolvedValue([]),
    };

    configMock = {
      get: jest.fn().mockImplementation((k: string) => {
        if (k === 'RESEND_API_KEY') return 're_123456789';
        if (k === 'EMAIL_FROM') return 'no-reply@example.com';
        return undefined;
      }),
    };

    // Reset our Resend mock send implementation history
    mockSendEmail.mockReset();

    service = new NotificationsService(
      remindersRepoMock as Repository<EventReminder>,
      notificationsRepoMock as Repository<Notification>,
      configMock as ConfigService,
    );
  });

  it('processScheduledReminders calls sendReminder and marks sent', async () => {
    // Override sendReminder with a clean spy
    const spy = jest
      .spyOn(service, 'sendReminder')
      .mockResolvedValue(undefined);

    await service.processScheduledReminders();

    expect(spy).toHaveBeenCalledWith(mockReminder);
    expect(remindersRepoMock.save).toHaveBeenCalled();
  });

  it('sendReminder hits resend client and saves status on success', async () => {
    // Arrange: Resend returns a successful response payload structure
    mockSendEmail.mockResolvedValue({ data: { id: 'email_id' }, error: null });

    // Act
    await service.sendReminder(mockReminder);

    // Assert
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(notificationsRepoMock.save).toHaveBeenCalled();

    const savedNotification = (notificationsRepoMock.save as jest.Mock).mock
      .calls[0][0] as any;
    expect(savedNotification.sent).toBe(true);
    expect(savedNotification.recipient).toBe('a@x.com');
  });

  it('sendReminder calculates backoff retry when Resend errors, then sets lastError', async () => {
    // Arrange: Mock Resend to fail on its attempts
    mockSendEmail.mockResolvedValue({
      data: null,
      error: { message: 'API Rate limit reached' },
    });

    // Act
    // We explicitly speed up our tests by overriding the base delay to 1ms instead of 500ms
    const sendMailSpy = jest.spyOn(service as any, 'sendMailWithRetry');

    await service.sendReminder(mockReminder);

    // Assert
    expect(mockSendEmail).toHaveBeenCalledTimes(3); // Handled by your maxAttempts loop
    expect(notificationsRepoMock.save).toHaveBeenCalled();

    const savedNotification = (notificationsRepoMock.save as jest.Mock).mock
      .calls[0][0] as any;
    expect(savedNotification.sent).toBe(false);
    expect(savedNotification.lastError).toContain('API Rate limit reached');
  });

  it('list helpers return arrays', async () => {
    // Arrange
    remindersRepoMock.find!.mockResolvedValue([mockReminder]);
    notificationsRepoMock.find!.mockResolvedValue([
      { id: 'n1' } as Notification,
    ]);

    // Act
    const rems = await service.listReminders(10);
    const nots = await service.listNotifications(10);

    // Assert
    expect(rems).toHaveLength(1);
    expect(nots).toHaveLength(1);
    expect(remindersRepoMock.find).toHaveBeenCalled();
    expect(notificationsRepoMock.find).toHaveBeenCalled();
  });
});
