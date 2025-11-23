import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Param, 
  Body, 
  Delete, 
  UseGuards, 
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';

@Controller('friendship')
@UseGuards(JwtAccessGuard)
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post('sendRequest')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: { receiver: number }, @Req() req) {
    if (!body.receiver) {
      throw new BadRequestException('Receiver ID is required');
    }

    if (req.user.id === body.receiver) {
      throw new BadRequestException('You cannot send a friend request to yourself');
    }

    await this.friendshipService.create(req.user.id, body.receiver);
    
    return { 
      message: 'Friend request sent successfully' 
    };
  }

  @Get('friendrequests')
  async friendReq(@Req() req) {
    const requests = await this.friendshipService.friendReq(req.user.id);
    return requests;
  }

  @Patch('acceptRequest')
  @HttpCode(HttpStatus.OK)
  async accept(@Body() body: { sender: number }, @Req() req) {
    if (!body.sender) {
      throw new BadRequestException('Sender ID is required');
    }

    await this.friendshipService.accept(req.user.id, body.sender);
    
    return { 
      message: 'Friend request accepted' 
    };
  }

  @Get('getFriends/:id')
  async getFriends(@Param('id', ParseIntPipe) id: number) {
    const friends = await this.friendshipService.getFriends(id);
    return { friends };
  }

  @Get('status/:id')
  async status(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.friendshipService.status(req.user.id, id);
  }

  @Get('search/:channelid/:query')
  async search(
    @Param('channelid', ParseIntPipe) channelId: number,
    @Param('query') query: string, 
    @Req() req
  ) {
    const results = await this.friendshipService.search(channelId, req.user.id, query);
    return { results };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    await this.friendshipService.remove(req.user.id, id);
    
    return { 
      message: 'Friend request declined or friendship removed' 
    };
  }
}