import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { PaymentsService } from './payments.service';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Initialize a payment for a specific tier' })
  @ApiBody({
    schema: {
      properties: {
        tierId: { type: 'string' },
        qty: { type: 'number' },
        email: { type: 'string' },
      },
    },
    description:
      'Payment initialization details including tierId, quantity, and email',
  })
  @ApiCreatedResponse({
    description: 'Payment initialized successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid payment initialization request',
  })
  async initialize(
    @Body() body: { tierId: string; qty: number; email: string },
  ) {
    return this.paymentsService.initializePayment(
      body.tierId,
      body.qty ?? 1,
      body.email,
    );
  }

  @Post('verify')
  async verify(@Body() body: { reference: string }) {
    return this.paymentsService.verifyAndFulfill(body.reference);
  }

  @Post('webhook')
  @SkipThrottle()
  async webhook(
    @Req() req: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const raw = req.rawBody as Buffer | undefined;
    if (!raw)
      throw new Error(
        'rawBody not available; enable raw body saving in main.ts',
      );
    return this.paymentsService.handleWebhook(raw, signature);
  }
}

export default PaymentsController;
