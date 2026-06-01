import { Body, Controller, Post, Req } from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('purchase')
  async purchase(
    @Body() body: { tierId: string; qty?: number },
    @Req() req: any,
  ) {
    const userId = req.user?.sub ?? null;
    const tickets = await this.ticketsService.purchaseTier(
      userId,
      body.tierId,
      body.qty ?? 1,
    );
    return tickets;
  }
}

export default TicketsController;
