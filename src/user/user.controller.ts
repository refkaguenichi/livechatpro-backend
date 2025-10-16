import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Req,
  Res,
  UnauthorizedException,
  Get,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import type { Response } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('register')
  async register(
    @Body() body: { name: string; email: string; password: string },
    @Res() res: Response,
  ) {
    try {
      const { token, refreshToken, user } =
        await this.userService.register(body);

      // Set access token in an HTTP-only cookie
      res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
      });

      // Set refresh token in an HTTP-only cookie
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
      });

      return res.send({ message: 'Registration successful', user });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Public()
  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res() res: Response,
  ) {
    const { token, refreshToken, user } = await this.userService.login(body);

    // Set access token in an HTTP-only cookie
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    // Set refresh token in an HTTP-only cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    return res.send({ message: 'Login successful', user });
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() req, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');

    const payload = this.userService.verifyRefreshToken(refreshToken);
    if (typeof payload !== 'object' || !payload.userId || !payload.email) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccessToken = this.userService.signJwt({
      userId: payload.userId,
      email: payload.email,
    });

    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    return res.send({ message: 'Token refreshed' });
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.send({ message: 'Logged out successfully' });
  }

  @Get('profile')
  async getProfile(@Req() req) {
    try {
      const user = await this.userService.getUserById(req.user.userId);
      return { message: 'Profile fetched successfully', user };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
