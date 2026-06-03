import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    type: Object,
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(
      dto.email,
      dto.password,
      dto.firstName,
      dto.lastName,
    );
    return { id: user.id, email: user.email, createdAt: user.createdAt };
  }

  @ApiOperation({ summary: 'Get user by email' })
  @ApiBody({
    type: String,
    description: 'User email address',
  })
  @ApiCreatedResponse({
    description: 'User found successfully',
    type: Object,
  })
  @ApiBadRequestResponse({ description: 'User not found' })
  @Post('findByEmail')
  async findByEmail(@Body('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiBody({ type: String, description: 'User ID' })
  @ApiCreatedResponse({
    description: 'User found successfully',
    type: Object,
  })
  @ApiBadRequestResponse({ description: 'User not found' })
  @Post('findById')
  async findById(@Body('id') id: string) {
    return this.usersService.findById(id);
  }

  @ApiOperation({ summary: 'Set refresh token hash' })
  @ApiBody({ type: String, description: 'User ID' })
  @ApiCreatedResponse({
    description: 'Refresh token hash set successfully',
    type: Object,
  })
  @ApiBadRequestResponse({ description: 'Failed to set refresh token hash' })
  @Post('setRefreshTokenHash')
  async setRefreshTokenHash(
    @Body('userId') userId: string,
    @Body('hash') hash: string,
  ) {
    return this.usersService.setRefreshTokenHash(userId, hash);
  }
}

export default UsersController;
