import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { config } from 'dotenv';

config();

const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    console.log(req.cookies['access_token']);
    return req.cookies['access_token'];
  }
  return null;
};

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOneById(payload.id);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: payload.id,
      fact2Auth: payload.fact2Auth,
    };
  }
}