import {
  Controller,
  NotFoundException,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get user by email' })
  @ApiCreatedResponse({
    description: 'User found successfully',
    type: Object,
  })
  @ApiBadRequestResponse({ description: 'User not found' })
  @Get(':email')
  @Roles(UserRole.CREATOR)
  async findByEmail(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      message: 'User found successfully',
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiCreatedResponse({
    description: 'User found successfully',
    type: Object,
  })
  @ApiBadRequestResponse({ description: 'User not found' })
  @Roles(UserRole.CREATOR)
  @Get('/:id')
  async findById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      message: 'User found successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiCreatedResponse({
    description: 'Users found successfully',
    type: Object,
  })
  @ApiBadRequestResponse({ description: 'Users not found' })
  @Roles(UserRole.CREATOR)
  @Get('get-users')
  async getAllUsers() {
    const users = await this.usersService.getAllUsers();
    return users;
  }

  // @ApiOperation({ summary: 'Set refresh token hash' })
  // @ApiBody({ type: String, description: 'User ID' })
  // @ApiCreatedResponse({
  //   description: 'Refresh token hash set successfully',
  //   type: Object,
  // })
  // @ApiBadRequestResponse({ description: 'Failed to set refresh token hash' })
  // @Post('setRefreshTokenHash')
  // async setRefreshTokenHash(
  //   @Body('userId') userId: string,
  //   @Body('hash') hash: string,
  // ) {
  //   return this.usersService.setRefreshTokenHash(userId, hash);
  // }
}

export default UsersController;
