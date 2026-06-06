import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketTierDto {
  @ApiProperty({
    example: 'General Admission',
    description: 'Name of the ticket tier',
  })
  @IsNotEmpty()
  @MinLength(3)
  name!: string;

  @ApiProperty({
    example: 49.99,
    description: 'Price of the ticket tier',
  })
  @IsNotEmpty()
  price!: number;

  @ApiProperty({
    example: 100,
    description: 'Total quantity of tickets available for this tier',
  })
  @IsNotEmpty()
  quantity!: number;

  @ApiProperty({
    example: 100,
    description: 'Remaining quantity of tickets available for this tier',
  })
  @IsNotEmpty()
  remainingQuantity!: number;
}
