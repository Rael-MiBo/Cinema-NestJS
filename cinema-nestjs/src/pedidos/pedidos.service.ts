import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class PedidosService {
  update(arg0: number, updatePedidoDto: UpdatePedidoDto) {
    throw new Error('Method not implemented.');
  }
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

  async checkout(userId: number, dto: CheckoutDto) {
    if (!dto.ingressos?.length) {
      throw new BadRequestException('Selecione ao menos um assento.');
    }

    const sessao = await this.prisma.sessao.findUnique({
      where: { id: dto.sessaoId },
      include: { sala: true, filme: true },
    });

    if (!sessao) {
      throw new NotFoundException('Sessão não encontrada.');
    }

    const mapaPoltronas = sessao.sala.poltronas as number[][];
    const ingressoIds: number[] = [];
    let qtInteira = 0;
    let qtMeia = 0;
    let valorTotal = 0;

    for (const item of dto.ingressos) {
      if (
        !mapaPoltronas[item.fila] ||
        mapaPoltronas[item.fila][item.assento] !== 1
      ) {
        throw new BadRequestException(
          `Poltrona inválida: fila ${item.fila}, assento ${item.assento}`,
        );
      }

      const ocupado = await this.prisma.ingresso.findFirst({
        where: {
          sessaoId: dto.sessaoId,
          fila: item.fila,
          assento: item.assento,
        },
      });

      if (ocupado) {
        throw new ConflictException(
          `Assento ${item.fila + 1}-${item.assento + 1} já ocupado.`,
        );
      }

      let valorFinal = sessao.valorIngresso;
      const isMeia = item.tipo.toLowerCase().trim() === 'meia';
      if (isMeia) {
        valorFinal = sessao.valorIngresso / 2;
        qtMeia++;
      } else {
        qtInteira++;
      }

      valorTotal += valorFinal;

      const ingresso = await this.prisma.ingresso.create({
        data: {
          tipo: item.tipo,
          valorPago: valorFinal,
          sessaoId: dto.sessaoId,
          fila: item.fila,
          assento: item.assento,
        },
      });

      ingressoIds.push(ingresso.id);
    }

    const pedido = await this.prisma.pedido.create({
      data: {
        valorTotal,
        qtInteira,
        qtMeia,
        metodoPagamento: dto.metodoPagamento,
        userId,
        ingressos: { connect: ingressoIds.map((id) => ({ id })) },
      },
    });

    if (dto.lancheComboIds?.length) {
      for (const lancheId of dto.lancheComboIds) {
        await this.adicionarLanche(pedido.id, lancheId);
      }
    }

    return this.findOne(pedido.id);
  }

  findByUser(userId: number) {
    return this.prisma.pedido.findMany({
      where: { userId },
      include: {
        ingressos: {
          include: { sessao: { include: { filme: true, sala: true } } },
        },
        lanches: { include: { lanche: true } },
      },
      orderBy: { dataHora: 'desc' },
    });
  }

  async create(createPedidoDto: CreatePedidoDto) {
    let qtInteira = 0;
    let qtMeia = 0;
    let valorTotal = 0;
    const connectIngressos: { id: number }[] = [];

    if (createPedidoDto.ingressoIds && createPedidoDto.ingressoIds.length > 0) {
      const ingressos = await this.prisma.ingresso.findMany({
        where: { id: { in: createPedidoDto.ingressoIds } },
      });

      for (const ingresso of ingressos) {
        if (ingresso.pedidoId)
          throw new BadRequestException(`Ingresso #${ingresso.id} ocupado.`);
        valorTotal += ingresso.valorPago;
        connectIngressos.push({ id: ingresso.id });
        if (ingresso.tipo.toLowerCase().trim() === 'meia') qtMeia++;
        else qtInteira++;
      }
    }

    const pedido = await this.prisma.pedido.create({
      data: {
        valorTotal,
        qtInteira,
        qtMeia,
        ingressos: { connect: connectIngressos },
      },
    });

    if (
      createPedidoDto.lancheComboIds &&
      createPedidoDto.lancheComboIds.length > 0
    ) {
      for (const lancheId of createPedidoDto.lancheComboIds) {
        await this.adicionarLanche(pedido.id, lancheId);
      }
    }

    return this.findOne(pedido.id);
  }

  findAll() {
    return this.prisma.pedido.findMany({
      include: { ingressos: true, lanches: { include: { lanche: true } } },
    });
  }

  async findOne(id: number) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: {
        ingressos: {
          include: {
            sessao: { include: { filme: true, sala: true } },
          },
        },
        lanches: { include: { lanche: true } },
      },
    });
    if (!pedido) throw new NotFoundException('Pedido não encontrado.');
    return pedido;
  }

  async adicionarLanche(pedidoId: number, lancheId: number) {
    const pedido = await this.findOne(pedidoId);
    const lanche = await this.prisma.lancheCombo.findUnique({
      where: { id: lancheId },
    });
    if (!lanche || lanche.qtUnidade <= 0)
      throw new BadRequestException('Lanche indisponível.');

    await this.prisma.lancheCombo.update({
      where: { id: lancheId },
      data: {
        qtUnidade: lanche.qtUnidade - 1,
        subtotal: (lanche.qtUnidade - 1) * lanche.valorUnitario,
      },
    });

    const item = await this.prisma.itemPedidoLanche.findFirst({
      where: { pedidoId, lancheId },
    });

    if (item) {
      await this.prisma.itemPedidoLanche.update({
        where: { id: item.id },
        data: { quantidade: item.quantidade + 1 },
      });
    } else {
      await this.prisma.itemPedidoLanche.create({
        data: { pedidoId, lancheId, quantidade: 1 },
      });
    }

    return this.prisma.pedido.update({
      where: { id: pedidoId },
      data: { valorTotal: pedido.valorTotal + lanche.valorUnitario },
      include: { ingressos: true, lanches: { include: { lanche: true } } },
    });
  }

  async removerLanche(pedidoId: number, lancheId: number) {
    const pedido = await this.findOne(pedidoId);
    const item = await this.prisma.itemPedidoLanche.findFirst({
      where: { pedidoId, lancheId },
      include: { lanche: true },
    });
    if (!item) throw new NotFoundException('Item não encontrado.');

    await this.prisma.lancheCombo.update({
      where: { id: lancheId },
      data: {
        qtUnidade: item.lanche.qtUnidade + 1,
        subtotal: (item.lanche.qtUnidade + 1) * item.lanche.valorUnitario,
      },
    });

    if (item.quantidade > 1) {
      await this.prisma.itemPedidoLanche.update({
        where: { id: item.id },
        data: { quantidade: item.quantidade - 1 },
      });
    } else {
      await this.prisma.itemPedidoLanche.delete({ where: { id: item.id } });
    }

    return this.prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        valorTotal: Math.max(0, pedido.valorTotal - item.lanche.valorUnitario),
      },
      include: { ingressos: true, lanches: { include: { lanche: true } } },
    });
  }

  async adicionarIngresso(pedidoId: number, ingressoId: number) {
    const pedido = await this.findOne(pedidoId);
    const ingresso = await this.prisma.ingresso.findUnique({
      where: { id: ingressoId },
    });
    if (!ingresso || ingresso.pedidoId)
      throw new BadRequestException('Ingresso indisponível.');

    const isMeia = ingresso.tipo.toLowerCase().trim() === 'meia';

    return this.prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        valorTotal: pedido.valorTotal + ingresso.valorPago,
        qtInteira: isMeia ? pedido.qtInteira : pedido.qtInteira + 1,
        qtMeia: isMeia ? pedido.qtMeia + 1 : pedido.qtMeia,
        ingressos: { connect: { id: ingressoId } },
      },
      include: { ingressos: true, lanches: { include: { lanche: true } } },
    });
  }

  async removerIngresso(pedidoId: number, ingressoId: number) {
    const pedido = await this.findOne(pedidoId);
    const ingresso = await this.prisma.ingresso.findUnique({
      where: { id: ingressoId },
    });
    if (!ingresso) throw new NotFoundException('Ingresso não encontrado.');

    const isMeia = ingresso.tipo.toLowerCase().trim() === 'meia';

    await this.prisma.ingresso.delete({ where: { id: ingressoId } });

    return this.prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        valorTotal: Math.max(0, pedido.valorTotal - ingresso.valorPago),
        qtInteira: Math.max(
          0,
          isMeia ? pedido.qtInteira : pedido.qtInteira - 1,
        ),
        qtMeia: Math.max(0, isMeia ? pedido.qtMeia - 1 : pedido.qtMeia),
      },
      include: { ingressos: true, lanches: { include: { lanche: true } } },
    });
  }

  async remove(id: number) {
    const pedido = await this.findOne(id);
    for (const item of pedido.lanches) {
      await this.prisma.lancheCombo.update({
        where: { id: item.lancheId },
        data: {
          qtUnidade: item.lanche.qtUnidade + item.quantidade,
          subtotal:
            (item.lanche.qtUnidade + item.quantidade) *
            item.lanche.valorUnitario,
        },
      });
    }
    await this.prisma.ingresso.deleteMany({ where: { pedidoId: id } });
    return this.prisma.pedido.delete({ where: { id } });
  }

  async reembolsar(id: number) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
    });

    if (!pedido) throw new NotFoundException('Pedido não encontrado');

    return this.prisma.pedido.update({
      where: { id },
      data: {
        status: 'REEMBOLSADO',
        valorTotal: 0,
        qtInteira: 0,
        qtMeia: 0,
      },
    });
  }

  async generateReceipt(id: number): Promise<Buffer> {
    const pedido = await this.findOne(id);

    const receiptData = {
      pedidoId: pedido.id,
      dataHora: new Date(pedido.dataHora).toLocaleString('pt-BR'),
      valorTotal: pedido.valorTotal,
      metodoPagamento: pedido.metodoPagamento || 'Não especificado',
      ingressos: pedido.ingressos.map((ing) => ({
        filme: ing.sessao?.filme?.titulo || 'Filme',
        sala: String(ing.sessao?.sala?.numero || 'N/A'),
        data: ing.sessao?.data
          ? new Date(ing.sessao.data).toLocaleString('pt-BR')
          : 'Data não disponível',
        fila: ing.fila,
        assento: ing.assento,
        tipo: ing.tipo,
        valorPago: ing.valorPago,
      })),
      lanches: pedido.lanches.map((item) => ({
        quantidade: item.quantidade,
        nome: item.lanche.nome,
      })),
    };

    return this.pdfService.generateReceipt(receiptData);
  }
}
