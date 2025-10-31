import {
  Injectable, 
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Like, In } from 'typeorm';
import { User, Status } from '../entities/user.entity';
import { BlockedUser } from '../entities/blocked-user.entity';
import { ChangeEmailDTO } from './dto/change-email.dto';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { UpdateStatsDTO } from './dto/update-stats.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(BlockedUser)
    private blockedUsersRepository: Repository<BlockedUser>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: User[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [users, total] = await this.usersRepository.findAndCount({
      select: [
        'id',
        'email',
        'username',
        'avatar',
        'baner',
        'level',
        'XP',
        'wins',
        'loses',
        'status',
        'createdAt',
      ],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async search(
    currentUserId: number,
    searchQuery: string,
    limit: number = 10,
  ): Promise<User[]> {

    const blockedUsers = await this.blockedUsersRepository.find({
      where: [
        { blockerId: currentUserId },
        { blockedId: currentUserId },
      ],
    });

    const blockedIds = blockedUsers.map((b) =>
      b.blockerId === currentUserId ? b.blockedId : b.blockerId,
    );

    const query = this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.avatar',
        'user.level',
        'user.status',
      ])
      .where('user.id != :currentUserId', { currentUserId })
      .andWhere(
        '(user.username LIKE :searchQuery OR user.email LIKE :searchQuery)',
        { searchQuery: `%${searchQuery}%` },
      );

    if (blockedIds.length > 0) {
      query.andWhere('user.id NOT IN (:...blockedIds)', { blockedIds });
    }

    return query.take(limit).getMany();
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOneById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async updateProfile(id: number, userData: Partial<User>): Promise<User> {
    if (userData.username) {
      const existingUser = await this.findOneByUsername(userData.username);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Username already taken');
      }
    }

    await this.usersRepository.update(id, userData);
    const updatedUser = await this.findOneById(id);
    
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    
    return updatedUser;
  }

  async changeEmail(userId: number, dto: ChangeEmailDTO): Promise<User> {
  const user = await this.findOneById(userId);
  
  const isPasswordValid = await bcrypt.compare(dto.password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid password');
  }

  const existingUser = await this.findOneByEmail(dto.newEmail);
  if (existingUser) {
    throw new ConflictException('Email already in use');
  }

  await this.usersRepository.update(userId, { email: dto.newEmail });
  return this.findOneById(userId);
}

async changePassword(userId: number, dto: ChangePasswordDTO): Promise<void> {
  const user = await this.findOneById(userId);
  
  const isValid = await bcrypt.compare(dto.currentPassword, user.password);
  if (!isValid) {
    throw new UnauthorizedException('Current password is incorrect');
  }

  const isSame = await bcrypt.compare(dto.newPassword, user.password);
  if (isSame) {
    throw new BadRequestException('New password must be different');
  }

  const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

  await this.usersRepository.update(userId, { password: hashedPassword });
}

async updateStats(userId: number, dto: UpdateStatsDTO): Promise<User> {
  const user = await this.findOneById(userId);
  
  if (!user) {
    throw new NotFoundException('User not found');
  }

  await this.usersRepository.update(userId, dto);
  return this.findOneById(userId);
}

  async delete(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async isUserNameExist(username: string): Promise<boolean> {
    const user = await this.findOneByUsername(username);
    return !!user;
  }

  async set2FASecret(secret: string, id: number): Promise<void> {
    await this.usersRepository.update(id, { fact2Secret: secret });
  }

  async turnOn2FA(id: number): Promise<void> {
    await this.usersRepository.update(id, { fact2Auth: true });
  }

  async turnOff2FA(id: number): Promise<void> {
    await this.usersRepository.update(id, {
      fact2Auth: false,
      fact2Secret: '',
    });
  }

  async block(blockerId: number, blockedId: number): Promise<void> {
    if (blockerId === blockedId) {
      throw new BadRequestException('Cannot block yourself');
    }

    const blockedUser = await this.findOneById(blockedId);
    if (!blockedUser) {
      throw new NotFoundException('User to block not found');
    }

    const existingBlock = await this.blockedUsersRepository.findOne({
      where: { blockerId, blockedId },
    });

    if (existingBlock) {
      throw new ConflictException('User is already blocked');
    }

    const block = this.blockedUsersRepository.create({
      blockerId,
      blockedId,
    });

    await this.blockedUsersRepository.save(block);
  }

  async unblock(blockerId: number, blockedId: number): Promise<void> {
    const result = await this.blockedUsersRepository.delete({
      blockerId,
      blockedId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Block relationship not found');
    }
  }

  async blockedUsers(userId: number): Promise<User[]> {
    const blocks = await this.blockedUsersRepository.find({
      where: { blockerId: userId },
    });

    if (blocks.length === 0) {
      return [];
    }

    const blockedIds = blocks.map((b) => b.blockedId);

    return this.usersRepository.find({
      where: { id: In(blockedIds) },
      select: ['id', 'username', 'avatar', 'level'],
    });
  }

  async isBlocked(
    userId: number,
    targetUserId: number,
  ): Promise<{ isBlock: boolean; direction?: 'blocker' | 'blocked' }> {
    const block = await this.blockedUsersRepository.findOne({
      where: [
        { blockerId: userId, blockedId: targetUserId },
        { blockerId: targetUserId, blockedId: userId },
      ],
    });

    if (!block) {
      return { isBlock: false };
    }

    return {
      isBlock: true,
      direction: block.blockerId === userId ? 'blocker' : 'blocked',
    };
  }

  async getUserStats(userId: number): Promise<{
    level: number;
    XP: number;
    wins: number;
    loses: number;
    winRate: number;
    totalGames: number;
  }> {
    const user = await this.findOneById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const totalGames = user.wins + user.loses;
    const winRate = totalGames > 0 ? (user.wins / totalGames) * 100 : 0;

    return {
      level: user.level,
      XP: user.XP,
      wins: user.wins,
      loses: user.loses,
      winRate: Math.round(winRate * 100) / 100,
      totalGames,
    };
  }
}