import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { UpdateGeneroDto } from './dto/update-genero.dto';

@Injectable()
export class GenerosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGeneroDto: CreateGeneroDto) {
    const generoExiste = await this.prisma.genero.findUnique({
      where: { nome: createGeneroDto.nome },
    });

    if (generoExiste) {
      throw new ConflictException('Gênero com este nome já existe.');
    }

    return this.prisma.genero.create({
      data: createGeneroDto,
    });
  }

  findAll() {
    return this.prisma.genero.findMany();
  }

  async findOne(id: number) {
    const genero = await this.prisma.genero.findUnique({
      where: { id },
    });

    if (!genero) {
      throw new NotFoundException('Gênero não encontrado.');
    }

    return genero;
  }

  async update(id: number, updateGeneroDto: UpdateGeneroDto) {
    await this.findOne(id);

    if (updateGeneroDto.nome) {
      const generoExiste = await this.prisma.genero.findUnique({
        where: { nome: updateGeneroDto.nome },
      });

      if (generoExiste && generoExiste.id !== id) {
        throw new ConflictException('Gênero com este nome já existe.');
      }
    }

    return this.prisma.genero.update({
      where: { id },
      data: updateGeneroDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.genero.delete({
      where: { id },
    });
  }
}