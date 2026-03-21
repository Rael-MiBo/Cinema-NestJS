import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';

@Injectable()
export class SalasService {
  constructor(private readonly prisma: PrismaService) {}

  create(createSalaDto: CreateSalaDto) {
    let capacidadeCalculada = 0;
    for (let i = 0; i < createSalaDto.poltronas.length; i++) {
      for (let j = 0; j < createSalaDto.poltronas[i].length; j++) {
        if (createSalaDto.poltronas[i][j] === 1) {
          capacidadeCalculada++;
        }
      }
    }

    return this.prisma.sala.create({
      data: {
        numero: createSalaDto.numero,
        capacidade: capacidadeCalculada,
        poltronas: createSalaDto.poltronas,
      },
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

    let capacidadeCalculada = undefined;
    if (updateSalaDto.poltronas) {
      let capacidadeCalculada: number | undefined = undefined;
      for (let i = 0; i < updateSalaDto.poltronas.length; i++) {
        for (let j = 0; j < updateSalaDto.poltronas[i].length; j++) {
          if (updateSalaDto.poltronas[i][j] === 1) {
            if (capacidadeCalculada === undefined) {
              capacidadeCalculada = 0;
            }
            capacidadeCalculada++;
          }
        }
      }
    }

    return this.prisma.sala.update({
      where: { id },
      data: {
        ...updateSalaDto,
        capacidade: capacidadeCalculada,
      },
    });
  }

  async remove(id: number) {
    const sala = await this.prisma.sala.findUnique({ 
      where: { id }, 
      include: { sessoes: true } 
    });
    
    if (!sala) {
      throw new NotFoundException('Sala não encontrada.');
    }
    
    if (sala.sessoes.length > 0) {
      throw new BadRequestException('Não é possível remover uma sala com sessões agendadas.');
    }
    
    return this.prisma.sala.delete({ where: { id } });
  }
}