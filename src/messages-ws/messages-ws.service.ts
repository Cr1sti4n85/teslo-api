import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClients {
  [id: string]: { socket: Socket; user: User }; //ejemplo: "5i4jo-f2f4f: {socket, user}"
}

@Injectable()
export class MessagesWsService {
  private connectedClients: ConnectedClients = {};

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registerClient(client: Socket, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) throw new NotFoundException('User not found');
    if (!user.isActive) throw new Error('User is not active');

    this.checkSingleConnection(user);

    this.connectedClients[client.id] = { socket: client, user };
  }

  removeClient(clientId: string) {
    delete this.connectedClients[clientId];
  }

  getConnectedClients(): string[] {
    const ids = Object.keys(this.connectedClients);
    let userNames: string[] = [];

    ids.forEach((id) => {
      userNames.push(this.connectedClients[id].user.fullName);
    });
    return userNames;
  }

  getUserFullName(socketId: string) {
    return this.connectedClients[socketId].user.fullName;
  }

  //validar que el usuario solo se loguea una vez y no haya multiples conexiones
  checkSingleConnection(user: User) {
    for (const clientId of Object.keys(this.connectedClients)) {
      const connectedClients = this.connectedClients[clientId];

      //si ya esta conectado, se le desconecta la sesion anterior
      if (connectedClients.user.id === user.id) {
        connectedClients.socket.disconnect();
        break;
      }
    }
  }
}
