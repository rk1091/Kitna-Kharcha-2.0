import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const encryptionSalt = crypto.randomBytes(16).toString('hex');

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        encryptionSalt,
      },
    });

    // Exclude passwordHash and encryptionSalt from returned user object
    const { passwordHash: _, encryptionSalt: __, ...userWithoutSecrets } = user;

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { user: userWithoutSecrets, token };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { passwordHash: _, encryptionSalt: __, ...userWithoutSecrets } = user;

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { user: userWithoutSecrets, token };
  }
}
