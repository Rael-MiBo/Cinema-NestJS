import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
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

    const mapaPoltronas = sessao.sala.poltronas as number[][];
    const { fila, assento } = createIngressoDto;

    if (!mapaPoltronas[fila] || mapaPoltronas[fila][assento] !== 1) {
      throw new BadRequestException('Esta poltrona não existe na sala.');
    }

    const ingressoExistente = await this.prisma.ingresso.findFirst({
      where: {
        sessaoId: createIngressoDto.sessaoId,
        fila: fila,
        assento: assento,
      },
    });

    if (ingressoExistente) {
      throw new ConflictException('Esta poltrona já está reservada para esta sessão.');
    }

    let valorFinal = sessao.valorIngresso;

    if (createIngressoDto.tipo.toLowerCase() === 'meia') {
      valorFinal = sessao.valorIngresso / 2;
    }

    return this.prisma.ingresso.create({
      data: {
        tipo: createIngressoDto.tipo,
        valorPago: valorFinal,
        sessaoId: createIngressoDto.sessaoId,
        fila: fila,
        assento: assento,
      },
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