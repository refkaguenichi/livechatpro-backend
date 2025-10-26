import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createRoomDto: CreateRoomDto & { ownerId: string }) {
    const owner = await this.userRepository.findOne({ where: { id: createRoomDto.ownerId } });
    if (!owner) throw new BadRequestException('Owner not found');
    const room = this.roomRepository.create({
      name: createRoomDto.name,
      owner,
      participants: [owner],
    });
    return this.roomRepository.save(room);
  }

  async createDefaultRoomForUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    const existing = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.owner', 'owner')
      .where('owner.id = :userId', { userId })
      .andWhere('room.name = :name', { name: 'My First Room' })
      .getOne();
    if (existing) return existing;
    const room = this.roomRepository.create({ name: 'My First Room', owner: user, participants: [user] });
    return this.roomRepository.save(room);
  }

  async inviteUserByEmail(roomId: string, email: string) {
    const room = await this.roomRepository.findOne({ where: { id: roomId }, relations: ['participants'] });
    if (!room) throw new BadRequestException('Room not found');
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('User not found');
    const already = room.participants?.some((p) => p.id === user.id);
    if (!already) {
      room.participants = [...(room.participants || []), user];
      await this.roomRepository.save(room);
    }
    return { message: 'User invited (added to room)', roomId, userId: user.id };
  }

  async findRoomsForUser(userId: string) {
    const rooms = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.participants', 'participant')
      .leftJoinAndSelect('room.owner', 'owner')
      .where('participant.id = :userId', { userId })
      .getMany();
    return rooms;
  }

  async findAll() {
    return this.roomRepository.find();
  }

  async findOne(id: string) {
    return this.roomRepository.findOne({ where: { id } });
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    await this.roomRepository.update(id, { name: updateRoomDto.name });
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.roomRepository.delete(id);
    return { id };
  }
}
