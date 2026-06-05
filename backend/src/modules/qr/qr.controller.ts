import { Body, Controller, Post } from '@nestjs/common';
import { QrService } from './qr.service';
import {
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

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
  async generate(@Body() body: { ticketId: string }) {
    return this.qrService.generateForTicket(body.ticketId);
  }

  @Post('validate')
  async validate(
    @Body() body: { code: string; auditor?: { id?: string; name?: string } },
  ) {
    return this.qrService.validateCode(body.code, body.auditor);
  }
}

export default QrController;
