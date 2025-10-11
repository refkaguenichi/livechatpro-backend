import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import passport from 'passport';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    app.enableCors({
    origin: ['http://localhost:3000','http://192.168.100.4:3000'],
    credentials: true,
    });
  app.use(cookieParser());
  app.use(passport.initialize());



  await app.listen(process.env.PORT ?? 1000);
}
bootstrap();
