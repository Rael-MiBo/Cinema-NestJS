import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLanchesComboDto } from './dto/create-lanche-combo.dto';
import { UpdateLancheComboDto } from './dto/update-lanche-combo.dto';

@Injectable()
export class LanchesCombosService {
  constructor(private readonly prisma: PrismaService) {}

  create(createLanchesComboDto: CreateLanchesComboDto) {
    const subtotal = createLanchesComboDto.valorUnitario * createLanchesComboDto.qtUnidade;

    return this.prisma.lancheCombo.create({
      data: {
        nome: createLanchesComboDto.nome,
        descricao: createLanchesComboDto.descricao,
        valorUnitario: createLanchesComboDto.valorUnitario,
        qtUnidade: createLanchesComboDto.qtUnidade,
        subtotal: subtotal,
      },
    });
  }

  findAll() {
    return this.prisma.lancheCombo.findMany();
  }

  async findOne(id: number) {
    const lanche = await this.prisma.lancheCombo.findUnique({
      where: { id },
    });

    if (!lanche) {
      throw new NotFoundException('Lanche não encontrado.');
    }

    return lanche;
  }

  async update(id: number, updateLanchesComboDto: UpdateLancheComboDto) {
    const lanche = await this.findOne(id);

    const valorUnitario = updateLanchesComboDto.valorUnitario ?? lanche.valorUnitario;
    const qtUnidade = updateLanchesComboDto.qtUnidade ?? lanche.qtUnidade;
    const subtotal = valorUnitario * qtUnidade;

    return this.prisma.lancheCombo.update({
      where: { id },
      data: {
        ...updateLanchesComboDto,
        subtotal: subtotal,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.lancheCombo.delete({
      where: { id },
    });
  }
}