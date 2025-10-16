import { Room } from "src/room/entities/room.entity";
import { User } from "src/user/entities/user.entity";
import {
    Column, CreateDateColumn, DeleteDateColumn,
    Entity, ManyToOne,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @ManyToOne(() => User, user => user.sentMessages)
  sender: User;

  @ManyToOne(() => Room, room => room.messages, { nullable: true })
  room: Room;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
