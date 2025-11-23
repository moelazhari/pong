import { 
  SubscribeMessage, 
  WebSocketGateway, 
  OnGatewayConnection, 
  OnGatewayDisconnect, 
  WebSocketServer 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { gameService } from './game.service';
import { engineService } from './engine.service';
import { Room } from './interfaces/room.interface';
import { UsersService } from '../users/users.service';

@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private gameService: gameService,
    private engineService: engineService,
  ) {}

  @WebSocketServer()
  server: Server;
  
  recentRoom: string | null;

  handleConnection(client: Socket) {
    // Connection is already handled by UsersGateway
    // socket.data.username contains the userId as string
  }
  
  handleDisconnect(client: Socket) {
    // Clean up game queue on disconnect
    this.gameService.removePlayerFromQueue(client);
  }
  
  async endGameSimulation(roomId: string) {
    this.gameService.removeRoom(roomId);
    await this.engineService.removeGameSimulation(roomId);
  }

  @SubscribeMessage('invite-friend')
  async handleInviteFriend(client: Socket, data: { receiverId: number; map: string }) {
    // socket.data.username contains userId as string from UsersGateway
    const senderId = parseInt(client.data.username);
    const receiverId = data.receiverId;

    console.log('=== INVITE DEBUG ===');
    console.log('Sender ID:', senderId);
    console.log('Receiver ID:', receiverId);
    console.log('Socket data:', client.data);
    console.log('Map:', data.map);

    // Validation
    if (!senderId) {
      console.log('❌ Not authenticated');
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    if (senderId === receiverId) {
      console.log('❌ Cannot invite yourself');
      client.emit('error', { message: 'Cannot invite yourself' });
      return;
    }

    // Check if sender is already in game
    if (this.gameService.isInGame(senderId) !== null) {
      console.log('❌ Sender already in game');
      client.emit('error', { message: 'You are already in a game' });
      return;
    }

    // Check if receiver is already in game
    if (this.gameService.isInGame(receiverId) !== null) {
      console.log('❌ Receiver already in game');
      client.emit('error', { message: 'This player is already in a game' });
      return;
    }

    console.log('✅ All checks passed, sending invitation...');
    console.log('Emitting to room:', receiverId.toString());

    // Send invitation to receiver (using their userId as room)
    this.server.to(receiverId.toString()).emit('game-invitation', {
      senderId: senderId,
      senderSocketId: client.id,
      map: data.map || 'default',
    });

    console.log('✅ Invitation sent!');
    client.emit('invitation-sent', { receiverId });
  }

  @SubscribeMessage('accept-invitation')
  async handleAcceptInvite(client: Socket, data: { 
    senderUserId: number; 
    senderSocketId: string;
  }) {
    const receiverId = parseInt(client.data.username);
    const senderId = data.senderUserId;

    // Check if receiver is already in game
    if (this.gameService.isInGame(receiverId) !== null) {
      client.emit('play-a-friend');
      return;
    }

    // Check if sender is already in game
    if (this.gameService.isInGame(senderId) !== null) {
      client.emit('error', { message: 'Sender is already in a game' });
      return;
    }

    const senderSocket: Socket = this.server.sockets.sockets.get(data.senderSocketId);
    
    if (!senderSocket) {
      client.emit('error', { message: 'Sender is no longer online' });
      return;
    }

    // Create game room using userId as string (matching your existing system)
    const socket1: Array<Socket> = [client];
    const socket2: Array<Socket> = [senderSocket];
    const room: Room = this.gameService.creatRoom(
      socket1, 
      socket2, 
      receiverId.toString(), 
      senderId.toString()
    );
    
    if (room) {
      this.gameService.removePlayerFromQueue(client);
      this.gameService.removePlayerFromQueue(senderSocket);
      
      await this.engineService.createGameSimulation(room);
      this.engineService.sendPosition(room, this.endGameSimulation.bind(this));
      this.engineService.addServerToGame(room.id, this.server);
      
      const gameInfo = {
        room: room.id,
        leftPlayer: room.players[0].position === 'left' 
          ? room.players[0].username 
          : room.players[1].username,
        rightPlayer: room.players[0].position === 'right' 
          ? room.players[0].username 
          : room.players[1].username,
      };

      // Notify both players
      client.emit('play-a-friend');
      client.emit('game-info', gameInfo);
      
      senderSocket.emit('play-a-friend');
      senderSocket.emit('game-info', gameInfo);
    }
  }

  @SubscribeMessage('retry-game')
  handleRetryGame(client: Socket, data: { receiverId: number }) {
    const senderId = parseInt(client.data.username);
    const receiverId = data.receiverId;

    if (senderId === receiverId || this.gameService.isInGame(receiverId) !== null) {
      return;
    }

    this.server.to(receiverId.toString()).emit('retry-game', {
      senderId: senderId,
      senderSocketId: client.id,
    });
  }

  @SubscribeMessage('accept-retry')
  async handleAcceptRetry(client: Socket, data: { 
    senderUserId: number;
    senderSocketId: string;
  }) {
    const receiverId = parseInt(client.data.username);

    if (this.gameService.isInGame(receiverId) !== null) {
      return;
    }

    const senderSocket: Socket = this.server.sockets.sockets.get(data.senderSocketId);
    
    if (!senderSocket) {
      client.emit('error', { message: 'Sender is no longer online' });
      return;
    }

    const socket1: Array<Socket> = [client];
    const socket2: Array<Socket> = [senderSocket];
    const room: Room = this.gameService.creatRoom(
      socket1, 
      socket2, 
      receiverId.toString(), 
      data.senderUserId.toString()
    );
    
    if (room) {
      this.gameService.removePlayerFromQueue(client);
      this.gameService.removePlayerFromQueue(senderSocket);
      
      await this.engineService.createGameSimulation(room);
      this.engineService.sendPosition(room, this.endGameSimulation.bind(this));
      this.engineService.addServerToGame(room.id, this.server);
      
      const gameInfo = {
        room: room.id,
        leftPlayer: room.players[0].position === 'left' 
          ? room.players[0].username 
          : room.players[1].username,
        rightPlayer: room.players[0].position === 'right' 
          ? room.players[0].username 
          : room.players[1].username,
      };

      client.emit('game-info', gameInfo);
      client.emit('refresh-page');
      
      senderSocket.emit('game-info', gameInfo);
      senderSocket.emit('refresh-page');
    }
  }

  @SubscribeMessage('rightPaddle')
  handlerPaddle(client: Socket, data: { room: string; direction: string }) {
    this.engineService.setRightBoardPosition(data.room, data.direction);
  }
  
  @SubscribeMessage('leftPaddle')
  handlelPaddle(client: Socket, data: { room: string; direction: string }) {
    this.engineService.setLeftBoardPosition(data.room, data.direction);
  }

  @SubscribeMessage('full-Game')
  handleFullGame(client: Socket, userId: number) {
    const room: Room = this.gameService.findRoomByPlayer(userId.toString());
    
    if (room) {
      const gameInfo = {
        room: room.id,
        leftPlayer: room.players[0].position === 'left' 
          ? room.players[0].username 
          : room.players[1].username,
        rightPlayer: room.players[0].position === 'right' 
          ? room.players[0].username 
          : room.players[1].username,
      };
      client.emit('game-info', gameInfo);
    }
  }

  @SubscribeMessage('leave-game')
  handleLeaveGame(client: Socket, data: { room: string; playerId: number }) {
    const room: Room = this.gameService.findRoom(data.room);
    
    if (!room) return;

    let winner: string;
    let loser: string;
	
    if (room.players[0].username === data.playerId.toString()) {
      winner = room.players[1].position;
      loser = room.players[0].position;
    } else {
      winner = room.players[0].position;
      loser = room.players[1].position;
    }
    
    this.server.to(data.room).emit('winner', winner);
    this.engineService.setLoser(data.room, loser);
    this.endGameSimulation(data.room);
  }
  
  @SubscribeMessage('looking-for-match')
  async handleLookingForMatch(client: Socket) {
    this.gameService.addPlayerToQueue(client);
    const found: Room | null = this.gameService.findMatch();
    
    if (found !== null) {
      await this.engineService.createGameSimulation(found);
      this.engineService.sendPosition(found, this.endGameSimulation.bind(this));
      this.engineService.addServerToGame(found.id, this.server);
    }
  }

  @SubscribeMessage('player-status')
  handleAlreadyLooking(client: Socket, userId: number) {
    const roomId: string | null = this.gameService.isInGame(userId);

    if (roomId) {
      client.join(roomId);
      client.emit('player-status', 'already-playing');
    } else {
      client.emit('player-status', 'not-looking');
    }
  }
}