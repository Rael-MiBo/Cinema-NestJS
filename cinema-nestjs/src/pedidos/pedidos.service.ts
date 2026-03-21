import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPedidoDto: CreatePedidoDto) {
    let valorTotal = 0;
    let qtInteira = 0;
    let qtMeia = 0;
    const connectIngressos: { id: number }[] = [];
    const connectLanches: { id: number }[] = [];

    if (createPedidoDto.ingressoIds && createPedidoDto.ingressoIds.length > 0) {
      const ingressos = await this.prisma.ingresso.findMany({
        where: { id: { in: createPedidoDto.ingressoIds } },
      });

      if (ingressos.length !== createPedidoDto.ingressoIds.length) {
        throw new NotFoundException('Um ou mais ingressos não encontrados.');
      }

      for (const ingresso of ingressos) {
        if (ingresso.pedidoId) {
          throw new BadRequestException(`O ingresso #${ingresso.id} já foi vendido.`);
        }

        valorTotal += ingresso.valorPago;
        connectIngressos.push({ id: ingresso.id });

        if (ingresso.tipo.toLowerCase() === 'meia') {
          qtMeia++;
        } else {
          qtInteira++;
        }
      }
    }

    if (createPedidoDto.lancheComboIds && createPedidoDto.lancheComboIds.length > 0) {
      const lanches = await this.prisma.lancheCombo.findMany({
        where: { id: { in: createPedidoDto.lancheComboIds } },
      });

      if (lanches.length !== createPedidoDto.lancheComboIds.length) {
        throw new NotFoundException('Um ou mais lanches não encontrados.');
      }

      for (const lanche of lanches) {
        if (lanche.qtUnidade <= 0) {
          throw new BadRequestException(`O lanche '${lanche.nome}' está sem estoque.`);
        }

        valorTotal += lanche.valorUnitario;
        connectLanches.push({ id: lanche.id });

        const novaQtd = lanche.qtUnidade - 1;

        await this.prisma.lancheCombo.update({
          where: { id: lanche.id },
          data: {
            qtUnidade: novaQtd,
            subtotal: novaQtd * lanche.valorUnitario,
          },
        });
      }
    }

    return this.prisma.pedido.create({
      data: {
        valorTotal,
        qtInteira,
        qtMeia,
        ingressos: {
          connect: connectIngressos,
        },
        lanches: {
          connect: connectLanches,
        },
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

  async update(id: number, updatePedidoDto: UpdatePedidoDto) {
    await this.findOne(id);
    return this.prisma.pedido.update({
      where: { id },
      data: updatePedidoDto,
    });
  }

  async remove(id: number) {
    const pedido = await this.findOne(id);

    await this.prisma.ingresso.deleteMany({
      where: { pedidoId: id }
    });

    return this.prisma.pedido.delete({
      where: { id }
    });
  }

  async adicionarLanche(pedidoId: number, lancheId: number) {
    const pedido = await this.findOne(pedidoId);
    const lanche = await this.prisma.lancheCombo.findUnique({ where: { id: lancheId } });
    
    if (!lanche) throw new NotFoundException('Lanche não encontrado.');
    if (lanche.qtUnidade <= 0) throw new BadRequestException('Lanche sem estoque.');

    await this.prisma.lancheCombo.update({
      where: { id: lancheId },
      data: { 
        qtUnidade: lanche.qtUnidade - 1, 
        subtotal: (lanche.qtUnidade - 1) * lanche.valorUnitario 
      }
    });

    return this.prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        valorTotal: pedido.valorTotal + lanche.valorUnitario,
        lanches: { connect: { id: lancheId } }
      },
      include: { ingressos: true, lanches: true }
    });
  }

  async removerLanche(pedidoId: number, lancheId: number) {
    const pedido = await this.findOne(pedidoId);
    const lanche = await this.prisma.lancheCombo.findUnique({ where: { id: lancheId } });
    
    if (!lanche) throw new NotFoundException('Lanche não encontrado.');

    await this.prisma.lancheCombo.update({
      where: { id: lancheId },
      data: { 
        qtUnidade: lanche.qtUnidade + 1, 
        subtotal: (lanche.qtUnidade + 1) * lanche.valorUnitario 
      }
    });

    return this.prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        valorTotal: pedido.valorTotal - lanche.valorUnitario,
        lanches: { disconnect: { id: lancheId } }
      },
      include: { ingressos: true, lanches: true }
    });
  }

  async adicionarIngresso(pedidoId: number, ingressoId: number) {
    const pedido = await this.findOne(pedidoId);
    const ingresso = await this.prisma.ingresso.findUnique({ where: { id: ingressoId } });
    
    if (!ingresso) throw new NotFoundException('Ingresso não encontrado.');
    if (ingresso.pedidoId) throw new BadRequestException('Ingresso já está em um pedido.');

    const isMeia = ingresso.tipo.toLowerCase() === 'meia';

    return this.prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        valorTotal: pedido.valorTotal + ingresso.valorPago,
        qtInteira: isMeia ? pedido.qtInteira : pedido.qtInteira + 1,
        qtMeia: isMeia ? pedido.qtMeia + 1 : pedido.qtMeia,
        ingressos: { connect: { id: ingressoId } }
      },
      include: { ingressos: true, lanches: true }
    });
  }

  async removerIngresso(pedidoId: number, ingressoId: number) {
    const pedido = await this.findOne(pedidoId);
    const ingresso = await this.prisma.ingresso.findUnique({ where: { id: ingressoId } });
    
    if (!ingresso) throw new NotFoundException('Ingresso não encontrado.');

    const isMeia = ingresso.tipo.toLowerCase().trim() === 'meia';

    await this.prisma.ingresso.delete({
      where: { id: ingressoId }
    });

    return this.prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        valorTotal: Math.max(0, pedido.valorTotal - ingresso.valorPago),
        qtInteira: Math.max(0, isMeia ? pedido.qtInteira : pedido.qtInteira - 1),
        qtMeia: Math.max(0, isMeia ? pedido.qtMeia - 1 : pedido.qtMeia),
      },
      include: { ingressos: true, lanches: true }
    });
  }
}