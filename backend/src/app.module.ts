import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

import { GameModule } from './game/game.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import con from '../ormconfig';
import { ChannelsModule } from './channels/channels.module';
import { GameHistoryModule } from './game-history/game-history.module';
import { FriendshipModule } from './friendship/friendship.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [TypeOrmModule.forRoot(con),
  AuthModule, UsersModule, ChannelsModule, GameHistoryModule, FriendshipModule, GameModule, RoomModule]
})

export class AppModule {}