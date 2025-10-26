import { Controller, Get, Param } from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';

// const ONE_ROOM_CHAT_ID = '725f7210-a87b-11f0-b59c-0242ac140006'; 

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('/:roomId')
  async getMessagesForRoom(@Param('roomId') roomId: string): Promise<Message[]> {
    return this.messageService.getMessagesForRoom(roomId);
  }

  // Optional: A specific endpoint for the one-room chat messages
  // @Get('one-room-chat')
  // async getOneRoomChatMessages(): Promise<Message[]> {
  //   return this.messageService.getMessagesForRoom(ONE_ROOM_CHAT_ID);
  // }
}
