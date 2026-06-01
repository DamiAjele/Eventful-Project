import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { QrModule } from '../src/modules/qr/qr.module';

describe('QR e2e (mocked)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [QrModule] })
      .overrideProvider('QrService')
      .useValue({
        generateForTicket: jest
          .fn()
          .mockResolvedValue({ qrCodeUrl: 'http://img' }),
        validateCode: jest.fn().mockResolvedValue({ valid: true }),
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/qr/generate (POST)', async () => {
    await request(app.getHttpServer())
      .post('/qr/generate')
      .send({ ticketId: 't1' })
      .expect(201)
      .expect({ qrCodeUrl: 'http://img' });
  });

  it('/qr/validate (POST)', async () => {
    await request(app.getHttpServer())
      .post('/qr/validate')
      .send({ code: 'CODE1' })
      .expect(201)
      .expect({ valid: true });
  });
});
