import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Message } from 'src/message/entities/message.entity';
import { Room } from 'src/room/entities/room.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true, type: 'text' })
  refreshToken: string;

  @Column({ nullable: true })
  googleId: string;

  // ✅ Relation: one user can send many messages
  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  // ✅ Rooms this user participates in
  @ManyToMany(() => Room, (room) => room.participants)
  rooms: Room[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
