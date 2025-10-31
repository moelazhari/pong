import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
// import { UserDTO, LoginDTO } from '../users/dto/change-email.dto';
import { JwtService } from '@nestjs/jwt';
import { Status } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { LoginDTO } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(body: LoginDTO) {
    const existingUser = await this.userService.findOneByEmail(body.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = {
      email: body.email,
      password: hashedPassword,
      username: null,
      avatar: null,
      baner: '/img/baner.webp',
      status: Status.ONLINE,
      level: 0,
      XP: 0,
      wins: 0,
      loses: 0,
      fact2Auth: false,
      fact2Secret: null,
      completeProfile: false,
    };

    console.log("befor creating the usr in db");
    const createdUser = await this.userService.create(user);
    console.log("after creating the usr in db");

    return this.generateTokens(createdUser.id, false);
  }

 async login(loginDto: LoginDTO){

  const user = await this.userService.findOneByEmail(loginDto.email);
  
  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
  
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // If 2FA is enabled
  if (user.fact2Auth) {
    await this.userService.updateProfile(user.id, { status: Status.ONLINE });
    
    const tokens = await await this.generateTokens(user.id, true);

    return {
    accessToken : tokens.accessToken,
    refreshToken : tokens.refreshToken,
    refreshTokenExpiry : tokens.refreshTokenExpiry,
    requires2FA: false,
    };
  }

  // No 2FA
  await this.userService.updateProfile(user.id, { status: Status.ONLINE });
  
  const tokens = await await this.generateTokens(user.id, true);

  return {
    accessToken : tokens.accessToken,
    refreshToken : tokens.refreshToken,
    refreshTokenExpiry : tokens.refreshTokenExpiry,
    requires2FA: false,
  };
}

  async refreshTokens(userId: number) {
    const user = await this.userService.findOneById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.generateTokens(user.id, user.fact2Auth);
  }

  async logout(userId: number) {
    const user = await this.userService.findOneById(userId);
    if (user) {
      await this.userService.updateProfile(userId, { status: Status.OFFLINE });
    }
    return { message: 'Logged out successfully' };
  }

  async generate2FASecret(userId: number) {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      user.email,
      'pong',
      secret,
    );

    await this.userService.set2FASecret(secret, userId);

    return {
      secret,
      otpauthUrl,
      qrCode: await toDataURL(otpauthUrl),
    };
  }

  async enable2FA(userId: number, code: string) {
    const user = await this.userService.findOneById(userId);
    if (!user || !user.fact2Secret) {
      throw new BadRequestException('2FA secret not generated');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.fact2Secret,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }

    await this.userService.turnOn2FA(userId);

    return { message: '2FA enabled successfully' };
  }

  async verify2FA(userId: number, code: string) {
    const user = await this.userService.findOneById(userId);
    if (!user || !user.fact2Auth) {
      throw new BadRequestException('2FA not enabled for this user');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.fact2Secret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    return this.generateTokens(userId, true);
  }

  async disable2FA(userId: number, code: string) {
    const user = await this.userService.findOneById(userId);
    if (!user || !user.fact2Auth) {
      throw new BadRequestException('2FA is not enabled');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.fact2Secret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    await this.userService.turnOff2FA(userId);

    return { message: '2FA disabled successfully' };
  }

private async generateTokens(userId: number, is2FAVerified: boolean) {
  const payload = {
    id: userId,
    fact2Verified: is2FAVerified, // ✅ This is what middleware checks
  };

  const accessToken = await this.jwtService.signAsync(payload, {
    secret: process.env.ACCESS_TOKEN_SECRET,
    expiresIn: process.env.ACCESS_TOKEN_EXP_D,
  });

  const refreshToken = await this.jwtService.signAsync(payload, {
    secret: process.env.REFRESH_TOKEN_SECRET,
    expiresIn: process.env.REFRESH_TOKEN_EXP_D,
  });

  const refreshTokenExpiry = 7 * 24 * 60 * 60; // 7 days

  return {
    accessToken,
    refreshToken,
    refreshTokenExpiry,
  };
}

}