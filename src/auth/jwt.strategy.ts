import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.access_token || null, // 👈 cookie-based
      ]),
      secretOrKey: process.env.JWT_SECRET || 'changeme',
    });
  }

  async validate(payload: any) {
    if (!payload) throw new UnauthorizedException();
    return { userId: payload.userId, email: payload.email };
  }
}
