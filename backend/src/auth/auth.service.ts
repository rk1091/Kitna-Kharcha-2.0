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

  async updateProfile(userId: string, data: { name?: string; defaultCurrency?: string; preferences?: any }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.defaultCurrency !== undefined && { defaultCurrency: data.defaultCurrency }),
        ...(data.preferences !== undefined && { preferences: data.preferences }),
      },
    });
    const { passwordHash: _, encryptionSalt: __, ...userWithoutSecrets } = user;
    return userWithoutSecrets;
  }

  async clearAllUserData(userId: string) {
    await this.prisma.$transaction([
      this.prisma.transaction.deleteMany({ where: { statement: { userId } } }),
      this.prisma.statementUpload.deleteMany({ where: { userId } }),
      this.prisma.classificationRule.deleteMany({ where: { userId } }),
      this.prisma.budget.deleteMany({ where: { userId } }),
      this.prisma.copilotSession.deleteMany({ where: { userId } }),
    ]);
    return { success: true, message: 'All user data cleared.' };
  }

  async exportAllUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        statements: true,
        rules: true,
        budgets: true,
      },
    });
    const transactions = await this.prisma.transaction.findMany({
      where: { statement: { userId } },
      include: { category: true },
    });
    return {
      user: { id: user?.id, email: user?.email, name: user?.name, defaultCurrency: user?.defaultCurrency },
      transactions,
      statements: user?.statements,
      rules: user?.rules,
      budgets: user?.budgets,
      exportedAt: new Date().toISOString(),
    };
  }
}
