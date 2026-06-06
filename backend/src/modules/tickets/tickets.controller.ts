import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import {
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { UserRole } from '../users/entities/user.entity';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @ApiOperation({ summary: 'Purchase tickets for a specific tier' })
  @ApiBody({
    schema: {
      properties: {
        tierId: { type: 'string' },
        qty: { type: 'number', nullable: true },
      },
    },
    description: 'Purchase details including tierId and optional quantity',
  })
  @ApiCreatedResponse({
    description: 'Tickets purchased successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid purchase request' })
  @Post('purchase')
  @Roles(UserRole.ATTENDEE, UserRole.CREATOR)
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
