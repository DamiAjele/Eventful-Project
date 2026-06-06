import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  eventId!: string;

  @ApiProperty()
  @IsNotEmpty()
  items!: {
    ticketTypeId: string;
    quantity: number;
  }[];
}
