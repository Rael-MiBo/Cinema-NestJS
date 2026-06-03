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

    if (!user || user.password !== pass) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.buildToken(user);
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new BadRequestException('E-mail já cadastrado');
    }

    let profile = await this.prisma.profile.findFirst({
      where: { name: 'CLIENTE' },
    });

    if (!profile) {
      profile = await this.prisma.profile.create({
        data: { name: 'CLIENTE' },
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: dto.password,
        profileId: profile.id,
      },
      include: { profile: true },
    });

    return this.buildToken(user);
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

    await this.prisma.user.update({
      where: { email: reset.email },
      data: { password: newPassword },
    });

    await this.prisma.passwordReset.delete({ where: { token } });

    return { message: 'Senha alterada com sucesso' };
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, address: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const { password, ...safe } = user;
    return safe;
  }
}
