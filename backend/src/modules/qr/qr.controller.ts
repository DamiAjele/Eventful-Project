import { Body, Controller, Post } from '@nestjs/common';
import { QrService } from './qr.service';

@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

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
