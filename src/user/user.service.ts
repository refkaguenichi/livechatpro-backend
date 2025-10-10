import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private signJwt(payload: any): string {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'changeme',
      { expiresIn: '7d' }
    );
  }
async register({ name, email, password }: { name: string; email: string; password: string }) {
  const existing = await this.userRepository.findOne({ where: { email } });
  if (existing) throw new BadRequestException('Email already in use');
  const hashed = await bcrypt.hash(password, 10);
  const user = this.userRepository.create({ name, email, password: hashed });
  await this.userRepository.save(user);
  // Issue JWT after registration
  const token = this.signJwt({ userId: user.id, email: user.email });
  return { token, user: { id: user.id, name: user.name, email: user.email } };
}

  async login(data: { email: string; password: string }) {
    const user = await this.userRepository.findOne({ where: { email: data.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

  const token = this.signJwt({ userId: user.id, email: user.email });
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  }
}