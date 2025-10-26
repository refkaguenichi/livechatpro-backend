import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for frontend URLs
  app.enableCors({
    origin: [process.env.FRONTEND_ORIGIN || 'http://localhost:3000'],
    credentials: true,
  });

  app.use(cookieParser());
  app.use(passport.initialize());

  // Use Socket.io adapter (if using WebSockets)
  app.useWebSocketAdapter(new IoAdapter(app));

  // Start server
const port = process.env.PORT ? parseInt(process.env.PORT) : 1000;
await app.listen(port, '0.0.0.0'); // <-- listen on all interfaces
  console.log(`Server running on port:${port}`);
}

bootstrap();
