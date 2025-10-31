import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateStatsDTO } from './dto/update-stats.dto';
import { ChangeEmailDTO } from './dto/change-email.dto';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';
import { UpdateProfileDTO } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAccessGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Req() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const users = await this.usersService.findAll(page, limit);
    return {
      users: users.data,
      total: users.total,
      page: users.page,
      totalPages: users.totalPages,
    };
  }

  @Get('search')
  async search(
    @Req() req,
    @Query('q') query: string,
    @Query('limit') limit: number = 10,
  ) {
    // if (!query || query.trim().length < 2) {
    //   throw new BadRequestException('Search query must be at least 2 characters');
    // }

    const users = await this.usersService.search(req.user.id, query.trim(), limit);
    return { users };
  }

  @Get('me')
  async getMe(@Req() req) {
    const user = await this.usersService.findOneById(req.user.id);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {"user" : user};
  }

  @Patch('me/profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Req() req, @Body() dto: UpdateProfileDTO) {
    const user = await this.usersService.updateProfile(req.user.id, dto);
    return {
      message: 'Profile updated successfully',
      user,
    };
  }

  @Patch('me/email')
  @HttpCode(HttpStatus.OK)
  async changeEmail(@Req() req, @Body() dto: ChangeEmailDTO) {
    const user = await this.usersService.changeEmail(req.user.id, dto);
    return {
      message: 'Email changed successfully. Please verify your new email.',
      user,
    };
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Req() req, @Body() dto: ChangePasswordDTO) {
    await this.usersService.changePassword(req.user.id, dto);
    return {
      message: 'Password changed successfully. All other sessions have been logged out.',
    };
  }

  @Patch('stats/:userId')
  // @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async updateStats(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateStatsDTO,
  ) {
    const user = await this.usersService.updateStats(userId, dto);
    return {
      message: 'Stats updated successfully',
      user,
    };
  }

  @Get('check-username/:username')
  @HttpCode(HttpStatus.OK)
  async checkUsername(@Param('username') username: string) {
    const exists = await this.usersService.isUserNameExist(username);
    return { exists, available: !exists };
  }

  @Get('username/:username')
  async findByUsername(@Req() req, @Param('username') username: string) {
    const user = await this.usersService.findOneByUsername(username);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id === req.user.id) {
      throw new BadRequestException('Use /users/me to get your own profile');
    }

    const blockStatus = await this.usersService.isBlocked(req.user.id, user.id);
    if (blockStatus.isBlock) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Get(':id')
  async findById(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const user = await this.usersService.findOneById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id === req.user.id) {
      throw new BadRequestException('Use /users/me to get your own profile');
    }

    const blockStatus = await this.usersService.isBlocked(req.user.id, user.id);
    if (blockStatus.isBlock) {
      throw new NotFoundException('User not found');
    }
  
    return user;
  }

  @Post('block')
  @HttpCode(HttpStatus.OK)
  async blockUser(@Req() req, @Body('userId', ParseIntPipe) userId: number) {
    if (req.user.id === userId) {
      throw new BadRequestException('You cannot block yourself');
    }

    await this.usersService.block(req.user.id, userId);
    return { message: 'User blocked successfully' };
  }

  @Delete('block/:userId')
  @HttpCode(HttpStatus.OK)
  async unblockUser(
    @Req() req,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    await this.usersService.unblock(req.user.id, userId);
    return { message: 'User unblocked successfully' };
  }

  @Get('blocked/list')
  async getBlockedUsers(@Req() req) {
    const blockedUsers = await this.usersService.blockedUsers(req.user.id);
    return { blockedUsers };
  }

  @Get('blocked/check/:userId')
  async checkIfBlocked(
    @Req() req,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    const blockStatus = await this.usersService.isBlocked(req.user.id, userId);
    return blockStatus;
  }

  @Get('stats/:userId')
  async getUserStats(@Param('userId', ParseIntPipe) userId: number) {
    const stats = await this.usersService.getUserStats(userId);
    return stats;
  }
}