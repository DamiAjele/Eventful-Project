import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    example: 'Tech Conference 2024',
    description: 'Name of the event',
  })
  @IsNotEmpty()
  @MinLength(3)
  title!: string;

  @ApiProperty({
    example: 'An annual conference for tech enthusiasts.',
    description: 'Detailed description of the event',
  })
  @IsNotEmpty()
  @MinLength(10)
  description!: string;

  @ApiProperty({
    example: 'Convention Center, City',
    description: 'Venue of the event',
  })
  venue!: string;

  @ApiProperty({
    example: '2024-10-01T09:00:00Z',
    description: 'Start date and time of the event in ISO format',
  })
  @IsNotEmpty()
  startAt!: string;

  @ApiProperty({
    example: '2024-10-01T17:00:00Z',
    description: 'End date and time of the event in ISO format',
  })
  @IsNotEmpty()
  endAt!: string;
}

export class updateEventDto {
  @ApiProperty({
    example: 'Tech Conference 2024',
    description: 'Name of the event',
  })
  @IsNotEmpty()
  @MinLength(3)
  name?: string;

  @ApiProperty({
    example: 'An annual conference for tech enthusiasts.',
    description: 'Detailed description of the event',
  })
  @IsNotEmpty()
  @MinLength(10)
  description?: string;

  @ApiProperty({
    example: '2024-10-01T09:00:00Z',
    description: 'Start date and time of the event in ISO format',
  })
  @IsNotEmpty()
  startDate?: string;

  @ApiProperty({
    example: '2024-10-01T17:00:00Z',
    description: 'End date and time of the event in ISO format',
  })
  @IsNotEmpty()
  endDate?: string;
}
