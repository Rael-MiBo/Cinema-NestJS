import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLancheComboDto } from './dto/create-lanche-combo.dto';
import { UpdateLancheComboDto } from './dto/update-lanche-combo.dto';

@Injectable()
export class LanchesCombosService {
  constructor(private readonly prisma: PrismaService) {}

  create(createLancheComboDto: CreateLancheComboDto) {
    return this.prisma.lancheCombo.create({
      data: createLancheComboDto,
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
      throw new NotFoundException('Lanche ou Combo não encontrado.');
    }

    return lanche;
  }

  async update(id: number, updateLancheComboDto: UpdateLancheComboDto) {
    await this.findOne(id);
    return this.prisma.lancheCombo.update({
      where: { id },
      data: updateLancheComboDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.lancheCombo.delete({
      where: { id },
    });
  }
}