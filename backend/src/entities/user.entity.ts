import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    Index,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';

import { Exclude, Expose } from 'class-transformer';
  
import {  Channel, Message, Mutation, Bannation, Membership } from './channel.entity';

export enum Status {
  ONLINE = 'online',
  OFFLINE = 'offline',
  INGAME = 'ingame',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Exclude()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  baner: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.OFFLINE,
  })
  status: Status;

  @Column({ default: 0 })
  level: number;

  @Column({ default: 0 })
  XP: number;

  @Column({ default: 0 })
  wins: number;

  @Column({ default: 0 })
  loses: number;

  @Column({ default: false })
  fact2Auth: boolean;

  @Column({ default: '',  nullable: true  })
  @Exclude()
  fact2Secret: string;

  @Column({ default: false })
  completeProfile: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

//   @BeforeInsert()
//     async hashPassword() {
//         if (this.password) {
//         const saltRounds = 10;
//         this.password = await bcrypt.hash(this.password, saltRounds);
//     }
//   }

//   // Also hash password before update if changed
//   @BeforeUpdate()
//   async hashPasswordOnUpdate() {
//     if (this.password) {
//         const saltRounds = 10;
//         this.password = await bcrypt.hash(this.password, saltRounds);
//     }
//   }

   toPublicProfile(): Partial<User> {
    const { password, fact2Secret, email, ...publicProfile } = this;
    return publicProfile;
  }

    
    @OneToMany(() => Channel, channel => channel.owner)
    ownedChannels: Channel[];
    
    @OneToMany(() => Membership, membership => membership.member)
    // @JoinTable()
    memberships: Membership[];
    
    @OneToMany(() => Friendship, (friendship) => friendship.initiater)
    initiatedFriendships: Friendship[];
    
    @OneToMany(() => Friendship, (friendship) => friendship.receiver)
    receivedFriendships: Friendship[];
    
    @OneToMany(() => Blockage, (blockage) => blockage.blocker)
    blockedUsers: User[];
    
    @OneToMany(() => Blockage, (blockage) => blockage.blocked)
    blockedByUsers: User[];
    
    @OneToMany(() => Mutation, (mutation) => mutation.member)
    mutations: Mutation[];
    
    @OneToMany(() => GameHistory, (gameHistory) => gameHistory.winner)
    wonGames: GameHistory[];
    
    @OneToMany(() => GameHistory, (gameHistory) => gameHistory.loser)
    lostGames: GameHistory[];
    
    @OneToMany(() => Message, (message) => message.sender)
    messages: Message[];

    @OneToMany(() => Bannation, (bannation) => bannation.member)
    bannations: Bannation[];
}

@Entity({ name: 'GameHistory' })
export class GameHistory {
    @PrimaryGeneratedColumn()
    id: number;
    
    @ManyToOne(() => User, (user) => user.wonGames)
    winner: User;
  
    @ManyToOne(() => User, (user) => user.lostGames)
    loser: User;
  
    @Column()
    loserScore: number;
  
    @CreateDateColumn()
    created_at: Date;
}

@Entity({ name: 'Blockage' })
export class Blockage {
    @PrimaryGeneratedColumn()
    id: number;
    
    @ManyToOne(() => User, (user) => user.blockedUsers)
    blocker: User;
  
    @ManyToOne(() => User, (user) => user.blockedByUsers)
    blocked: User;
}

export enum Fstatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    NONE = 'none'
}

@Entity({ name: 'Friendship' })
export class Friendship {
    @PrimaryGeneratedColumn()
    id: number;
    
    @ManyToOne(() => User, (user) => user.initiatedFriendships)
    initiater: User;
  
    @ManyToOne(() => User, (user) => user.receivedFriendships)
    receiver: User;
  
    @Column( )
    status: Fstatus;
}

function BeforeInsert(): (target: User, propertyKey: "hashPassword", descriptor: TypedPropertyDescriptor<() => Promise<void>>) => void | TypedPropertyDescriptor<() => Promise<void>> {
    throw new Error('Function not implemented.');
}
function BeforeUpdate(): (target: User, propertyKey: "hashPasswordOnUpdate", descriptor: TypedPropertyDescriptor<() => Promise<void>>) => void | TypedPropertyDescriptor<() => Promise<void>> {
    throw new Error('Function not implemented.');
}

