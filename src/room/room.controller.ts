import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  create(@Req() req, @Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create({ ...createRoomDto, ownerId: req.user.userId });
  }

  @Get()
  findAll() {
    return this.roomService.findAll();
  }

  @Get('mine')
  findMine(@Req() req) {
    return this.roomService.findRoomsForUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(id, updateRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomService.remove(id);
  }

  @Post(':id/invite')
  invite(@Param('id') id: string, @Body() body: { email: string }) {
    return this.roomService.inviteUserByEmail(id, body.email);
  }
}
