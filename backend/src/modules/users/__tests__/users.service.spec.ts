jest.mock('bcryptjs', () => ({ hash: jest.fn().mockResolvedValue('hashed') }));

import { UsersService } from '../users.service';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  const usersRepo: Partial<Repository<any>> = {
    findOneBy: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((x) => x),
    save: jest
      .fn()
      .mockImplementation((x) => Promise.resolve({ ...x, id: 'u1' })),
    update: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    service = new UsersService(usersRepo as any);
  });

  it('creates a new user', async () => {
    const u = await service.create('a@x.com', 'password');
    expect(u).toHaveProperty('id', 'u1');
  });

  it('sets and removes refresh token', async () => {
    await service.setRefreshTokenHash('u1', 'hash');
    expect(usersRepo.update).toHaveBeenCalled();
    await service.removeRefreshToken('u1');
    expect(usersRepo.update).toHaveBeenCalled();
  });
});
