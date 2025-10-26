// import { Message } from "src/message/entities/message.entity";
import { Message } from "src/message/entities/message.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // Optional: room owner/creator
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  owner?: User;

  @ManyToMany(() => User)
  @JoinTable()
  participants: User[];

  @OneToMany(() => Message, message => message.room)
  messages: Message[];
}
