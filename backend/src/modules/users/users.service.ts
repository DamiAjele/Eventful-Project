import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './entities/user.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async create(
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    role: string = 'ATTENDEE',
  ) {
    const existing = await this.usersRepo.findOneBy({ email });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(password, 10);

    // Map frontend roles to backend roles
    let mappedRole: UserRole = UserRole.ATTENDEE;
    if (role.toUpperCase() === 'CREATOR') mappedRole = UserRole.CREATOR;
    if (role.toUpperCase() === 'ATTENDEE') mappedRole = UserRole.ATTENDEE;

    const user = this.usersRepo.create({
      email,
      firstName,
      lastName,
      password: hashed,
      role: mappedRole,
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

  async getAllUsers() {
    const users = await this.usersRepo.find({
      relations: ['events', 'tickets'],
    });

    return users;
  }

  async setRefreshTokenHash(userId: string, hash: string) {
    const result = await this.usersRepo.update(
      { id: userId },
      { refreshTokenHash: hash },
    );
    Logger.log(result);
  }

  async removeRefreshToken(userId: string) {
    await this.usersRepo.update({ id: userId }, { refreshTokenHash: null });
  }
}

export default UsersService;
