import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { NotificationsModule } from '../src/modules/notifications/notifications.module';
import { NotificationsService } from '../src/modules/notifications/notifications.service';

describe('Notifications e2e (mocked)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [NotificationsModule],
    })
      .overrideProvider(NotificationsService)
      .useValue({
        scheduleReminder: jest.fn().mockResolvedValue({ id: 'r1' }),
        listNotifications: jest.fn().mockResolvedValue([]),
        listReminders: jest.fn().mockResolvedValue([]),
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => await app.close());

  it('/notifications/reminders (POST)', async () => {
    await request(app.getHttpServer())
      .post('/notifications/reminders')
      .send({
        eventId: 'e1',
        message: 'hi',
        sendAt: new Date().toISOString(),
        recipients: [{ email: 'a@x.com' }],
      })
      .expect(201);
  });

  it('/notifications/list (GET)', async () => {
    await request(app.getHttpServer())
      .get('/notifications/list')
      .expect(200)
      .expect([]);
  });

  it('/notifications/reminders (GET)', async () => {
    await request(app.getHttpServer())
      .get('/notifications/reminders')
      .expect(200)
      .expect([]);
  });
});
