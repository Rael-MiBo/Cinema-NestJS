import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private async buildToken(user: {
    id: number;
    email: string;
    name: string;
    profile: { name: string };
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.profile.name,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.profile.name,
      },
    };
  }

async login(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    let isPasswordValid = false;

    const isHashed = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');

    if (isHashed) {
      isPasswordValid = await bcrypt.compare(pass, user.password);
    } else {
      isPasswordValid = user.password === pass;

      if (isPasswordValid) {
        const hashedPassword = await bcrypt.hash(pass, 10);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });
      }
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.buildToken({
      id: user.id,
      email: user.email,
      name: user.name,
      profile: { name: user.profile.name },
    });
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new BadRequestException('E-mail já cadastrado');
    }

    let profile = await this.prisma.profile.findFirst({
      where: { name: 'USER' },
    });

    if (!profile) {
      profile = await this.prisma.profile.create({
        data: { name: 'USER' },
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        profileId: profile.id,
      },
      include: { profile: true },
    });

    return this.buildToken({
      id: user.id,
      email: user.email,
      name: user.name,
      profile: { name: user.profile.name },
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return {
        message:
          'Se o e-mail existir, você receberá instruções para redefinir a senha.',
      };
    }

    const token = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.passwordReset.deleteMany({ where: { email } });
    await this.prisma.passwordReset.create({
      data: { email, token, expiresAt },
    });

    return {
      message: 'Token gerado. Use-o na tela de redefinição de senha.',
      resetToken: token,
      expiresAt,
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const reset = await this.prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!reset || reset.expiresAt < new Date()) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { email: reset.email },
      data: { password: hashedPassword },
    });

    await this.prisma.passwordReset.delete({ where: { token } });

    return { message: 'Senha alterada com sucesso' };
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const { password, ...safe } = user;
    return safe;
  }

  async checkEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return {
      exists: !!user,
      available: !user,
    };
  }
}