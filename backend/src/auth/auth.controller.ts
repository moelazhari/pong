import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LoginDTO } from './dto/login.dto';
import { TwoFactorCodeDTO } from './dto/two-factor-code.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Res({ passthrough: true }) res: Response,
    @Body() signupDto: LoginDTO,
  ) {
    console.log(signupDto);
    const tokens = await this.authService.signUp(signupDto);

    this.setAuthCookies(res, tokens);

    return { message: 'User created successfully' };
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDTO,
  ) {
    const result = await this.authService.login(loginDto);

    this.setAuthCookies(res, result);

    return {
      requires2FA: result.requires2FA || false,
      message: result.requires2FA 
        ? 'Please verify 2FA code' 
        : 'Login successful',
    };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {

      const tokens = await this.authService.refreshTokens(req.user.id);

      this.setAuthCookies(res, tokens);

      return { message: 'Tokens refreshed successfully' };
  }

  @Delete('logout')
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.id);

    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });

    return { message: 'Logged out successfully' };
  }

  // ========================================
  // 2FA Endpoints
  // ========================================

  @Get('2fa/generate')
  @UseGuards(JwtAccessGuard)
  async generate2FA(@Req() req) {
    return this.authService.generate2FASecret(req.user.id);
  }

  @Post('2fa/enable')
  @UseGuards(JwtAccessGuard)
  async enable2FA(@Req() req, @Body() twoFactorCodeDto: TwoFactorCodeDTO) {
    return this.authService.enable2FA(req.user.id, twoFactorCodeDto.code);
  }

  @Post('2fa/verify')
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.OK)
  async verify2FA(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
    @Body() body: { code: string },
  ) {
  
  const tokens = await this.authService.verify2FA(req.user.id, body.code);

  this.setAuthCookies(res, tokens);

  return { message: '2FA verification successful' };
}

  @Post('2fa/disable')
  @UseGuards(JwtAccessGuard)
  async disable2FA(@Req() req, @Body() twoFactorCodeDto: TwoFactorCodeDTO) {
    return this.authService.disable2FA(req.user.id, twoFactorCodeDto.code);
  }

  @Get('me')
  @UseGuards(JwtAccessGuard)
  async getMe(@Req() req) {
    return { user: req.user };
  }

  // ========================================
  // Helper Method
  // ========================================

  private setAuthCookies(
    res: Response,
    tokens: {
      accessToken: string;
      refreshToken: string;
      refreshTokenExpiry: number;
    },
  ) {
    const isProduction = process.env.NODE_ENV === 'production';

    // ✅ Access token cookie (15 minutes)
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    // ✅ Refresh token cookie (7 days)
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: tokens.refreshTokenExpiry * 1000,
      path: '/',
    });
  }
}