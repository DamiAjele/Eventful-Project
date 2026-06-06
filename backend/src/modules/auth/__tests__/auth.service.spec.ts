import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { AuthService } from '../auth.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('rh'),
}));

describe('AuthService', () => {
  const usersService: any = {
    findByEmail: jest
      .fn()
      .mockResolvedValue({ id: 'u1', email: 'a@x.com', password: 'p' }),
    setRefreshTokenHash: jest.fn(),
    findById: jest.fn().mockResolvedValue({ id: 'u1', refreshTokenHash: 'h' }),
  };
  const jwtService: any = { signAsync: jest.fn().mockResolvedValue('token') };
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(usersService as any, jwtService as any);
  });

  it('validates user with correct password', async () => {
    const u = await service.validateUser('a@x.com', 'p');
    expect(u).toBeDefined();
  });

  it('generates tokens and logs in', async () => {
    const tokens = await service.generateTokens({
      id: 'u1',
      email: 'a@x.com',
    } as any);
    expect(tokens.accessToken).toBeDefined();
    await service.login({ id: 'u1', email: 'a@x.com' } as any);
    expect(usersService.setRefreshTokenHash).toHaveBeenCalled();
  });
});
