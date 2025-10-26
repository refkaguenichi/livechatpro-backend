// chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/message/entities/message.entity';
import { User } from 'src/user/entities/user.entity';
import { Room } from 'src/room/entities/room.entity'; // Import Room entity
import { DeepPartial, Repository } from 'typeorm';

type PartialMessage = {
  text: string;
  sender: DeepPartial<User>;
  room: DeepPartial<Room>; // Changed from receivers to room
};

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Room) // Inject Room repository
    private readonly roomRepo: Repository<Room>,
  ) {}

  async saveMessage(data: {
    senderId: string;
    roomId: string; // Added roomId
    text: string;
  }): Promise<Message> {
    const sender = await this.userRepo.findOne({ where: { id: data.senderId } });
    if (!sender) {
      throw new Error(`Sender with ID ${data.senderId} not found`);
    }

    let room = await this.roomRepo.findOne({ where: { id: data.roomId } });
    if (!room) {
      // If the room doesn't exist, create it (e.g., for the 'one-room-chat')
      room = this.roomRepo.create({ id: data.roomId, name: 'One Room Chat' }); // Assuming a name for the room
      await this.roomRepo.save(room);
    }


    const message = this.messageRepo.create({
      text: data.text,
      sender: sender,
      room: room, // Associate message with the room
    } as PartialMessage);

    return await this.messageRepo.save(message);
  }

  async getMessagesForRoom(roomId?: string): Promise<Message[]> {
    const query = this.messageRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.room', 'room')
      .orderBy('message.createdAt', 'DESC');

    if (roomId) {
      query.where('room.id = :roomId', { roomId });
    }

    return query.getMany();
  }
}
