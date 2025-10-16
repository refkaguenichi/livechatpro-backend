import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './google.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { RoomModule } from 'src/room/room.module';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'google' }),TypeOrmModule.forFeature([User]), RoomModule],
  providers: [GoogleStrategy, AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}