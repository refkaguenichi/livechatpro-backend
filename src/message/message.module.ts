import { MessageService } from 'src/message/message.service';
import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Message } from 'src/message/entities/message.entity';
import { SocketGateway } from 'src/SocketGateway';
import { Room } from 'src/room/entities/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Message, Room])],
  controllers: [MessageController],
  providers: [MessageService, SocketGateway],
  exports: [MessageService],
})
export class MessageModule {}
