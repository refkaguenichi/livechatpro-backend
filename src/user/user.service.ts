import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/user/entities/user.entity';
import { RoomService } from 'src/room/room.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly roomService: RoomService,
  ) {}

  signJwt(payload: any, expiresIn: string = '30m'): string {
    return jwt.sign(payload, process.env.JWT_SECRET || 'changeme', {
      expiresIn,
    });
  }
  async register({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) throw new BadRequestException('Email already in use');
    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ name, email, password: hashed });
    await this.userRepository.save(user);

    // Issue short-lived access token
    const token = this.signJwt({ userId: user.id, email: user.email });

    // Issue long-lived refresh token
    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET || 'refresh_secret',
      { expiresIn: '7d' },
    );

    // Optionally save the refresh token in the database
    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    const room = await this.roomService.createDefaultRoomForUser(user.id);

    return {
      token,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.signJwt({ userId: user.id, email: user.email });
    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET || 'refresh_secret',
      { expiresIn: '7d' },
    );

    // Optionally save the refresh token in the database
    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    // ensure default room exists on first login
    await this.roomService.createDefaultRoomForUser(user.id);

    return {
      token,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  async generateRefreshToken(user: { id: string; email: string }) {
    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET || 'refresh_secret',
      { expiresIn: '7d' },
    );
    // Save refresh token in the database or cache
    await this.userRepository.update(user.id, { refreshToken });
    return refreshToken;
  }

  verifyRefreshToken(token: string) {
    return jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET || 'refresh_secret',
    );
  }

  async getUserById(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    return { id: user.id, name: user.name, email: user.email };
  }
}
