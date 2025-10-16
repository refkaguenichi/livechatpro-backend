import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/user/entities/user.entity';
import { RoomService } from 'src/room/room.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly roomService: RoomService,
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

    // Generate short-lived access token
    const token = this.signJwt({ userId: user.id, email: user.email }, '15m');

    // Generate long-lived refresh token
    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET || 'refresh_secret',
      { expiresIn: '7d' }
    );

    // Optionally save the refresh token in the database
    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    await this.roomService.createDefaultRoomForUser(user.id);
    return { token, refreshToken, user: { id: user.id, name: user.name, email: user.email } };
  }

  private signJwt(payload: any, expiresIn: string = '30m'): string {
    return jwt.sign(payload, process.env.JWT_SECRET || 'changeme', { expiresIn });
  }
}