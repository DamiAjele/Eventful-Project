import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async create(
    email: string,
    firstName: string,
    lastName: string,
    password: string,
  ) {
    const existing = await this.usersRepo.findOneBy({ email });
    if (existing) throw new ConflictException('Email already registered');
    const hashed = await bcrypt.hash(password, 10);
    const user = this.usersRepo.create({
      email,
      firstName,
      lastName,
      password: hashed,
    });
    return this.usersRepo.save(user);
  }

  async findByEmail(email: string) {
    return this.usersRepo.findOneBy({ email });
  }

  async findById(id: string) {
    const u = await this.usersRepo.findOneBy({ id });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  async setRefreshTokenHash(userId: string, hash: string) {
    await this.usersRepo.update({ id: userId }, { refreshTokenHash: hash });
  }

  async removeRefreshToken(userId: string) {
    await this.usersRepo.update({ id: userId }, { refreshTokenHash: null });
  }
}

export default UsersService;
