import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPedidoDto: CreatePedidoDto) {
    let valorTotal = 0;
    const connectIngressos: { id: number }[] = [];
    const connectLanches: { id: number }[] = [];

    if (createPedidoDto.ingressoIds && createPedidoDto.ingressoIds.length > 0) {
      const ingressos = await this.prisma.ingresso.findMany({
        where: { id: { in: createPedidoDto.ingressoIds } },
      });

      if (ingressos.length !== createPedidoDto.ingressoIds.length) {
        throw new NotFoundException('Um ou mais ingressos informados não foram encontrados.');
      }

      ingressos.forEach((ingresso) => {
        valorTotal += ingresso.valorPago;
        connectIngressos.push({ id: ingresso.id });
      });
    }

    if (createPedidoDto.lancheComboIds && createPedidoDto.lancheComboIds.length > 0) {
      const lanches = await this.prisma.lancheCombo.findMany({
        where: { id: { in: createPedidoDto.lancheComboIds } },
      });

      if (lanches.length !== createPedidoDto.lancheComboIds.length) {
        throw new NotFoundException('Um ou mais lanches/combos informados não foram encontrados.');
      }

      lanches.forEach((lanche) => {
        valorTotal += lanche.preco;
        connectLanches.push({ id: lanche.id });
      });
    }

    if (valorTotal === 0) {
      throw new BadRequestException('O pedido deve conter pelo menos um ingresso ou lanche/combo.');
    }

    return this.prisma.pedido.create({
      data: {
        valorTotal,
        ingressos: { connect: connectIngressos },
        lanches: { connect: connectLanches },
      },
      include: {
        ingressos: true,
        lanches: true,
      },
    });
  }

  findAll() {
    return this.prisma.pedido.findMany({
      include: {
        ingressos: true,
        lanches: true,
      },
    });
  }

  async findOne(id: number) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: {
        ingressos: true,
        lanches: true,
      },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    return pedido;
  }

  update(id: number, updatePedidoDto: UpdatePedidoDto) {
    throw new BadRequestException('A atualização direta de pedidos não é permitida. Crie um novo pedido ou cancele o atual.');
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.pedido.delete({
      where: { id },
    });
  }
}