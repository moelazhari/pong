import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Status, User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as cookieParse from 'cookie';

@WebSocketGateway()
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        private jwtService: JwtService) 
        { }
        @WebSocketServer() server: Server;
        
    async handleConnection(socket: Socket) {
        const cookieHeader = socket.handshake.headers.cookie;
        if (!cookieHeader) return;
        
        const cookies = cookieParse.parse(cookieHeader);
        
        const token = cookies['access_token'];
        if (!token) return;
        
        let decodedJwt;
        try {
            decodedJwt = this.jwtService.verify(token);
        } catch (error) {
            return;
        }
        
        const id = decodedJwt.id;
        if (!id) return;
        
        const user = await this.userRepo.findOneBy({ id });
        if (user) {
            user.status = Status.ONLINE;
            await this.userRepo.save(user);
            this.updeteUser(id);
        }
            
        socket.data.username = id.toString();
        socket.join(id.toString());
    }

    async handleDisconnect(socket: Socket) {
        const id =  socket.data.username

        const user =  await this.userRepo.findOneBy({id});
        if (user){
            user.status = Status.OFFLINE;
            await this.userRepo.save(user);
            this.updeteUser(id);
        }
    }

    sendFriedRequest(id: number) {
        this.server.to(id.toString()).emit('friendRequest');
    }

    updeteFriendList(id: number) {
        this.server.to(id.toString()).emit('friends');
    }

    updeteUser(id: number) {
        this.server.emit('profile', id);
    }
}