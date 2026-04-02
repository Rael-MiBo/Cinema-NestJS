import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIngressoDto } from './dto/create-ingresso.dto';
import { UpdateIngressoDto } from './dto/update-ingresso.dto';

@Injectable()
export class IngressosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createIngressoDto: CreateIngressoDto) {
    const { sessaoId, fila, assento, tipo } = createIngressoDto;

    const sessao = await this.prisma.sessao.findUnique({
      where: { id: sessaoId },
      include: { sala: true },
    });

    if (!sessao) {
      throw new NotFoundException('Sessão não encontrada.');
    }

    const mapaPoltronas = sessao.sala.poltronas as number[][];

    if (!mapaPoltronas[fila] || mapaPoltronas[fila][assento] !== 1) {
      throw new BadRequestException('Esta poltrona não existe na sala.');
    }

    const ocupado = await this.prisma.ingresso.findFirst({
      where: {
        sessaoId,
        fila,
        assento,
      },
    });

    if (ocupado) {
      throw new ConflictException('Esta poltrona já foi selecionada para esta sessão.');
    }

    let valorFinal = sessao.valorIngresso;

    if (tipo.toLowerCase().trim() === 'meia') {
      valorFinal = sessao.valorIngresso / 2;
    }

    return this.prisma.ingresso.create({
      data: {
        tipo,
        valorPago: valorFinal,
        sessaoId,
        fila,
        assento,
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