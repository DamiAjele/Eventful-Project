import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { QrService } from './qr.service';
import {
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @ApiOperation({ summary: 'Generate QR' })
  @ApiBody({
    schema: {
      properties: {
        tierId: { type: 'string' },
      },
    },
    description: 'Generate QR for tickets',
  })
  @ApiCreatedResponse({ description: 'qr generated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ATTENDEE, UserRole.CREATOR)
  async generate(@Body() body: { ticketId: string }) {
    return this.qrService.generateForTicket(body.ticketId);
  }

  @ApiOperation({ summary: 'Validate QR' })
  @ApiBody({
    schema: {
      properties: {
        code: { type: 'string' },
        auditor: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
    description: 'Validate QR code for ticket entry',
  })
  @ApiCreatedResponse({ description: 'qr validated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid QR code' })
  @Roles(UserRole.ATTENDEE, UserRole.CREATOR)
  @Post('validate')
  async validate(
    @Body() body: { code: string; auditor?: { id?: string; name?: string } },
  ) {
    return this.qrService.validateCode(body.code, body.auditor);
  }
}

export default QrController;
