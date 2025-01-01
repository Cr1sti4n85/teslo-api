import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly messagesWsService: MessagesWsService) {}
  handleConnection(client: Socket) {
    console.log('cliente conectado', client.id);
    // throw new Error('Method not implemented.');
  }
  handleDisconnect(client: Socket) {
    console.log('Cliente desconectado', client.id);
    // throw new Error('Method not implemented.');
  }
}
