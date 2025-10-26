// chat.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from 'src/message/message.service';

@WebSocketGateway({
  cors: {
    origin: [process.env.FRONTEND_ORIGIN || 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: MessageService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // No explicit leave needed as socket.io handles room cleanup on disconnect
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { userId: string; roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId, roomId } = data;
    client.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);
    client.emit('joinedRoom', {
      roomId,
      message: `Welcome to room ${roomId}, ${userId}!`,
    });
  }


  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { senderId: string; text: string; roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Sending message to room:', data.roomId);
    // Save message with the actual roomId from client
    const savedMessage = await this.chatService.saveMessage(data);

    // Emit to all clients in the specific room
    this.server.to(data.roomId).emit('receiveMessage', savedMessage);

    // Optionally emit back to sender for confirmation
    client.emit('messageSent', savedMessage);
  }
}
