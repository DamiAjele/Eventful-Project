import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import express from 'express';
import * as crypto from 'crypto';
import { OrderService } from '../orders/order.service';

@Controller('webhooks/paystack')
export class PaystackWebhookController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async handleWebhook(
    @Req() req: express.Request,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    const rawBody = (req as any).rawBody;

    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    if (!secret) {
      throw new BadRequestException('PAYSTACK_SECRET_KEY not configured');
    }

    const hash = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      throw new BadRequestException('Invalid signature');
    }

    const event = JSON.parse(rawBody.toString());

    if (event.event === 'charge.success') {
      const reference = event.data?.reference;
      if (reference) {
        await this.orderService.markOrderAsPaidByReference(reference);
      }
    }

    return { status: 'ok' };
  }
}
