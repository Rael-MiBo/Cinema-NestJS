import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';

@Injectable()
export class SalasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSalaDto: CreateSalaDto) {
    const salaExiste = await this.prisma.sala.findUnique({
      where: { numero: createSalaDto.numero },
    });

    if (salaExiste) {
      throw new ConflictException('Sala com este número já existe.');
    }

    return this.prisma.sala.create({
      data: createSalaDto,
    });
  }

  findAll() {
    return this.prisma.sala.findMany();
  }

  async findOne(id: number) {
    const sala = await this.prisma.sala.findUnique({
      where: { id },
    });

    if (!sala) {
      throw new NotFoundException('Sala não encontrada.');
    }

    return sala;
  }

  async update(id: number, updateSalaDto: UpdateSalaDto) {
    await this.findOne(id);

    if (updateSalaDto.numero) {
      const salaExiste = await this.prisma.sala.findUnique({
        where: { numero: updateSalaDto.numero },
      });

      if (salaExiste && salaExiste.id !== id) {
        throw new ConflictException('Sala com este número já existe.');
      }
    }

    return this.prisma.sala.update({
      where: { id },
      data: updateSalaDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.sala.delete({
      where: { id },
    });
  }
}