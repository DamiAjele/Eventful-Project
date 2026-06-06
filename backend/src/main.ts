import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as express from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // preserve rawBody for webhook signature verification
  app.use(
    express.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
      },
    }),
  );
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: process.env.FRONTEND_URL ?? true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Eventful API')
      .setDescription('Eventful Ticketing Platform API')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    Logger.log('Swagger docs available at /api/docs');
  }
  await app.listen(process.env.PORT ?? 4000);
  Logger.log(`Server running on port ${process.env.PORT ?? 4000}`);
}

bootstrap();
