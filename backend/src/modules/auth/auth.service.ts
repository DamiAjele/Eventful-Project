import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;
    return user;
  }

  async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  async login(user: { email: string; password: string }) {
    const validatedUser = await this.validateUser(user.email, user.password);
    Logger.log('validated user:', validatedUser);
    if (!validatedUser) throw new UnauthorizedException();
    const tokens = await this.generateTokens(validatedUser);
    Logger.log('tokens generated');
    const hashed = await bcrypt.hash(tokens.refreshToken, 10);
    Logger.log('hash created');
    await this.usersService.setRefreshTokenHash(validatedUser.id, hashed);
    Logger.log('DB update done');
    return tokens;
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException();
    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) throw new UnauthorizedException();
    const tokens = await this.generateTokens(user);
    const newHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersService.setRefreshTokenHash(user.id, newHash);
    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.removeRefreshToken(userId);
  }
}

export default AuthService;
