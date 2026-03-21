import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIngressoDto } from './dto/create-ingresso.dto';
import { UpdateIngressoDto } from './dto/update-ingresso.dto';

@Injectable()
export class IngressosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createIngressoDto: CreateIngressoDto) {
    const sessao = await this.prisma.sessao.findUnique({
      where: { id: createIngressoDto.sessaoId },
      include: { sala: true },
    });

    if (!sessao) {
      throw new NotFoundException('Sessão não encontrada.');
    }

    const ingressosVendidos = await this.prisma.ingresso.count({
      where: { sessaoId: createIngressoDto.sessaoId },
    });

    if (ingressosVendidos >= sessao.sala.capacidade) {
      throw new ConflictException('A capacidade máxima da sala para esta sessão já foi atingida.');
    }

    return this.prisma.ingresso.create({
      data: createIngressoDto,
    });
  }

  findAll() {
    return this.prisma.ingresso.findMany({
      include: { sessao: true },
    });
  }

  async findOne(id: number) {
    const ingresso = await this.prisma.ingresso.findUnique({
      where: { id },
      include: { sessao: true },
    });

    if (!ingresso) {
      throw new NotFoundException('Ingresso não encontrado.');
    }

    return ingresso;
  }

  async update(id: number, updateIngressoDto: UpdateIngressoDto) {
    await this.findOne(id);

    if (updateIngressoDto.sessaoId) {
      const sessao = await this.prisma.sessao.findUnique({
        where: { id: updateIngressoDto.sessaoId },
        include: { sala: true },
      });

      if (!sessao) {
        throw new NotFoundException('Sessão não encontrada.');
      }

      const ingressosVendidos = await this.prisma.ingresso.count({
        where: {
          sessaoId: updateIngressoDto.sessaoId,
          id: { not: id },
        },
      });

      if (ingressosVendidos >= sessao.sala.capacidade) {
        throw new ConflictException('A capacidade máxima da sala para esta sessão já foi atingida.');
      }
    }

    return this.prisma.ingresso.update({
      where: { id },
      data: updateIngressoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.ingresso.delete({
      where: { id },
    });
  }
}