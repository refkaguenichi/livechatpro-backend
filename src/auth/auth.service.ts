import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Register or login with Google profile
  async validateGoogleUser(profile: { googleId: string; name: string; email: string }) {
    let user = await this.userRepository.findOne({ where: { email: profile.email } });
    if (!user) {
      user = this.userRepository.create({
        name: profile.name,
        email: profile.email,
        googleId: profile.googleId,
        password: '', // No password for Google users
      });
      await this.userRepository.save(user);
    }
    const token = this.signJwt({ userId: user.id, email: user.email });
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  }

  private signJwt(payload: any) {
    return jwt.sign(payload, process.env.JWT_SECRET || 'changeme', { expiresIn: '7d' });
  }
}