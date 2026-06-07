import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { PaymentsService } from './payments.service';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Initialize payment for an order' })
  @ApiBody({
    schema: {
      properties: {
        orderId: { type: 'string' },
        email: { type: 'string', format: 'email' },
      },
      required: ['orderId', 'email'],
    },
    description: 'Initialize a payment for a specific order',
  })
  @ApiCreatedResponse({
    description: 'Payment initialized successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid payment initialization request',
  })
  @Post('initialize-order')
  @Roles(UserRole.ATTENDEE, UserRole.CREATOR)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Initialize a payment for an order' })
  async initializeOrder(@Body() body: { orderId: string; email: string }) {
    await this.paymentsService.initializePaymentForOrder(
      body.orderId,
      body.email,
    );
    return {
      message: 'Payment initialized successfully',
      orderId: body.orderId,
      email: body.email,
    };
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
