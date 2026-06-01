import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import * as QRCode from 'qrcode';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Ticket } from '../tickets/entities/ticket.entity';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class QrService {
  constructor(
    @InjectRepository(Ticket) private ticketsRepo: Repository<Ticket>,
    private dataSource: DataSource,
    private cache: CacheService,
    private config: ConfigService,
  ) {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    }
  }

  async generateForTicket(ticketId: string) {
    const ticket = await this.ticketsRepo.findOneBy({ id: ticketId });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const payload = { code: ticket.code };
    const dataUrl = await QRCode.toDataURL(JSON.stringify(payload));
    // attempt Cloudinary upload if configured
    let storedUrl = dataUrl;
    try {
      if (cloudinary.config().cloud_name) {
        const res = await cloudinary.uploader.upload(dataUrl, {
          folder: 'eventful/qr',
        });
        if (res?.secure_url) storedUrl = res.secure_url;
      }
    } catch (err) {
      // fall back to data URL
      Logger.warn(`Cloudinary upload failed, using data URL: ${err}`);
    }

    ticket.qrCodeUrl = storedUrl;
    await this.ticketsRepo.save(ticket);

    return { qrCodeUrl: storedUrl };
  }

  // Validate QR by code; uses cache to prevent double-scan
  async validateCode(code: string, auditor?: { id?: string; name?: string }) {
    const cacheKey = `qr:scan:${code}`;
    // quick check to prevent concurrent scans
    const exists = await this.cache.exists(cacheKey);
    if (exists) throw new ConflictException('QR recently scanned');

    // set short lock to prevent immediate re-scans while processing
    await this.cache.set(cacheKey, '1', 5);

    return this.dataSource.transaction(async (manager) => {
      const ticket = await manager.findOne(Ticket, {
        where: { code },
        lock: { mode: 'pessimistic_write' },
      });
      if (!ticket) throw new NotFoundException('Ticket not found');
      if (ticket.used)
        return {
          valid: false,
          reason: 'already_used',
          scannedAt: ticket.scannedAt,
          scannedBy: ticket.scannedBy,
        };

      ticket.used = true;
      ticket.scannedAt = new Date();
      ticket.scannedBy = auditor?.name ?? auditor?.id ?? null;
      await manager.save(ticket);
      return {
        valid: true,
        ticketId: ticket.id,
        scannedAt: ticket.scannedAt,
        scannedBy: ticket.scannedBy,
      };
    });
  }
}

export default QrService;
