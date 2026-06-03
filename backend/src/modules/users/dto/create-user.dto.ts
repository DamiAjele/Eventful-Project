import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
  })
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({
    example: 'CREATOR',
    description: 'User role',
    enum: ['CREATOR', 'EVENTEE'],
  })
  @IsNotEmpty()
  role!: string;
}

export default CreateUserDto;
