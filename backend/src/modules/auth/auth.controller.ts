import { Body, Controller, Post, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from '../users/dto/login.dto';
import {
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    type: Object,
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async register(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(
      dto.email,
      dto.firstName,
      dto.lastName,
      dto.password,
      dto.role,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role === 'creator' ? 'CREATOR' : 'ATTENDEE',
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
    };
  }

  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginDto })
  @ApiCreatedResponse({
    description: 'User logged in successfully',
    type: Object,
  })
  @ApiBadRequestResponse({ description: 'Invalid credentials' })
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(@Body() dto: LoginDto) {
    const tokens = await this.authService.login(dto);

    return {
      message: 'Logged in succesfully',
      user: {
        email: dto.email,
      },
      ...tokens,
    };
  }

  // @ApiOperation({ summary: 'Refresh access token' })
  // @ApiBody({ type: Object, description: 'Refresh token' })
  // @ApiCreatedResponse({
  //   description: 'Access token refreshed successfully',
  //   type: Object,
  // })
  // @ApiBadRequestResponse({ description: 'Invalid refresh token' })
  // @Post('refresh')
  // async refresh(@Req() req: any, @Body() body: { refreshToken: string }) {
  //   const userId = req.user?.sub;
  //   return this.authService.refreshTokens(userId, body.refreshToken);
  // }
  // @ApiOperation({
  //   summary: 'Generate new access and refresh tokens for a user',
  // })
  // @ApiBody({ type: Object, description: 'User ID' })
  // @ApiCreatedResponse({
  //   description: 'Tokens generated successfully',
  //   type: Object,
  // })
  // @ApiBadRequestResponse({ description: 'User not found' })
  // @Post('generate-tokens')
  // async generateTokens(@Body('userId') userId: string) {
  //   const user = await this.usersService.findById(userId);
  //   if (!user) throw new Error('User not found');
  //   return this.authService.generateTokens(user);
  // }

  @ApiOperation({ summary: 'Logout a user' })
  @ApiBody({ type: Object, description: 'User ID' })
  @ApiCreatedResponse({
    description: 'User logged out successfully',
    type: Object,
  })
  @ApiBadRequestResponse({ description: 'User not found' })
  @Post('logout')
  async logout(@Req() req) {
    const user = req.user.id;
    if (!user) throw new Error('User not found');
    await this.authService.logout(user.id);
    return { message: 'Logged out successfully' };
  }
}

export default AuthController;
