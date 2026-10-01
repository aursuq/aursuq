import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { AuthGuard } from './auth.guard';

interface GoogleLoginDto {
  credential: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('google/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate Owner with Google ID token' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credential or unauthorized account' })
  async googleLogin(
    @Body() body: GoogleLoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ user: { userId: string; email: string; role: string } }> {
    if (!body.credential) {
      return { user: null as any };
    }
    const result = await this.authService.loginWithGoogle(body.credential, response);
    return { user: result.user };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('aursuq_session')
  @ApiOperation({ summary: 'Get current authenticated Owner user' })
  @ApiResponse({ status: 200, description: 'Current user data' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async me(@Req() request: Request): Promise<{ user: { userId: string; email: string; role: string } }> {
    const sessionPayload = (request as any).sessionPayload;
    const result = await this.authService.getCurrentUser(sessionPayload);
    return { user: result!.user };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('aursuq_session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout current Owner' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ success: boolean }> {
    await this.authService.logout(response);
    return { success: true };
  }
}