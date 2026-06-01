import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize')
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
