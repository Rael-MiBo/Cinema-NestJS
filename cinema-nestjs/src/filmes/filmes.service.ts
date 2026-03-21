import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFilmeDto } from './dto/create-filme.dto';
import { UpdateFilmeDto } from './dto/update-filme.dto';

@Injectable()
export class FilmesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFilmeDto: CreateFilmeDto) {
    const generoExiste = await this.prisma.genero.findUnique({
      where: { id: createFilmeDto.generoId },
    });

    if (!generoExiste) {
      throw new NotFoundException('Gênero não encontrado.');
    }

    return this.prisma.filme.create({
      data: createFilmeDto,
    });
  }

  findAll() {
    return this.prisma.filme.findMany({
      include: {
        genero: true,
      },
    });
  }

  async findOne(id: number) {
    const filme = await this.prisma.filme.findUnique({
      where: { id },
      include: {
        genero: true,
      },
    });

    if (!filme) {
      throw new NotFoundException('Filme não encontrado.');
    }

    return filme;
  }

  async update(id: number, updateFilmeDto: UpdateFilmeDto) {
    await this.findOne(id);

    if (updateFilmeDto.generoId) {
      const generoExiste = await this.prisma.genero.findUnique({
        where: { id: updateFilmeDto.generoId },
      });

      if (!generoExiste) {
        throw new NotFoundException('Gênero não encontrado.');
      }
    }

    return this.prisma.filme.update({
      where: { id },
      data: updateFilmeDto,
    });
  }

  async remove(id: number) {
    const filme = await this.prisma.filme.findUnique({ 
      where: { id }, 
      include: { sessoes: true } 
    });
    
    if (!filme) {
      throw new NotFoundException('Filme não encontrado.');
    }
    
    if (filme.sessoes.length > 0) {
      throw new BadRequestException('Não é possível remover um filme com sessões agendadas.');
    }
    
    return this.prisma.filme.delete({ where: { id } });
  }
  
}