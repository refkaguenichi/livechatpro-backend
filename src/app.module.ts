import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Module({
  imports: [
      ConfigModule.forRoot(),
      TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',         
      port: 3306,                
      username: 'root',          
      password: '',      
      database: 'livechatpro',   
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,        
    }),
      UserModule,
      AuthModule,
      ChatModule,
      DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
