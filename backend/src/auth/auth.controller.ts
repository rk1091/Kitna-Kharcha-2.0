import { Controller, Post, Get, Patch, Body, UsePipes, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RegisterDtoSchema, LoginDtoSchema } from './dto/auth.dto';
import { ZodValidationPipe } from './zod-validation.pipe';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(RegisterDtoSchema))
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(LoginDtoSchema))
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: Request) {
    return (req as any).user;
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: Request, @Body() body: any) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    return this.authService.updateProfile(userId, body);
  }

  @Post('clear-data')
  @UseGuards(JwtAuthGuard)
  async clearAllData(@Req() req: Request) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    return this.authService.clearAllUserData(userId);
  }

  @Get('export-json')
  @UseGuards(JwtAuthGuard)
  async exportJson(@Req() req: Request) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    return this.authService.exportAllUserData(userId);
  }
}
