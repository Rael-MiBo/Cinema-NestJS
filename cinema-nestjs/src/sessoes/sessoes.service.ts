import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessaoDto } from './dto/create-sessao.dto';
import { UpdateSessaoDto } from './dto/update-sessao.dto';

@Injectable()
export class SessoesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSessaoDto: CreateSessaoDto) {
    const filme = await this.prisma.filme.findUnique({
      where: { id: createSessaoDto.filmeId },
    });

    if (!filme) {
      throw new NotFoundException('Filme não encontrado.');
    }

    const sala = await this.prisma.sala.findUnique({
      where: { id: createSessaoDto.salaId },
    });

    if (!sala) {
      throw new NotFoundException('Sala não encontrada.');
    }

    const novaDataInicio = new Date(createSessaoDto.data);
    const novaDataFim = new Date(novaDataInicio.getTime() + filme.duracao * 60000);

    const sessoesExistentes = await this.prisma.sessao.findMany({
      where: { salaId: createSessaoDto.salaId },
      include: { filme: true },
    });

    const conflito = sessoesExistentes.some((sessao) => {
      const inicioExistente = new Date(sessao.data);
      const fimExistente = new Date(inicioExistente.getTime() + sessao.filme.duracao * 60000);
      return novaDataInicio < fimExistente && novaDataFim > inicioExistente;
    });

    if (conflito) {
      throw new ConflictException('Já existe uma sessão agendada para este horário nesta sala.');
    }

    return this.prisma.sessao.create({
      data: {
        data: novaDataInicio,
        valorIngresso: createSessaoDto.valorIngresso,
        filmeId: createSessaoDto.filmeId,
        salaId: createSessaoDto.salaId,
      },
    });
  }

  findAll() {
    return this.prisma.sessao.findMany({
      include: {
        filme: true,
        sala: true,
      },
    });
  }

  async findOne(id: number) {
    const sessao = await this.prisma.sessao.findUnique({
      where: { id },
      include: {
        filme: true,
        sala: true,
      },
    });

    if (!sessao) {
      throw new NotFoundException('Sessão não encontrada.');
    }

    return sessao;
  }

  async update(id: number, updateSessaoDto: UpdateSessaoDto) {
    const sessaoAtual = await this.findOne(id);

    const filmeId = updateSessaoDto.filmeId || sessaoAtual.filmeId;
    const salaId = updateSessaoDto.salaId || sessaoAtual.salaId;
    const dataString = updateSessaoDto.data || sessaoAtual.data.toISOString();

    const filme = await this.prisma.filme.findUnique({
      where: { id: filmeId },
    });

    if (!filme) {
      throw new NotFoundException('Filme não encontrado.');
    }

    const sala = await this.prisma.sala.findUnique({
      where: { id: salaId },
    });

    if (!sala) {
      throw new NotFoundException('Sala não encontrada.');
    }

    const novaDataInicio = new Date(dataString);
    const novaDataFim = new Date(novaDataInicio.getTime() + filme.duracao * 60000);

    const sessoesExistentes = await this.prisma.sessao.findMany({
      where: {
        salaId: salaId,
        id: { not: id },
      },
      include: { filme: true },
    });

    const conflito = sessoesExistentes.some((sessao) => {
      const inicioExistente = new Date(sessao.data);
      const fimExistente = new Date(inicioExistente.getTime() + sessao.filme.duracao * 60000);
      return novaDataInicio < fimExistente && novaDataFim > inicioExistente;
    });

    if (conflito) {
      throw new ConflictException('Já existe uma sessão agendada para este horário nesta sala.');
    }

    return this.prisma.sessao.update({
      where: { id },
      data: {
        data: novaDataInicio,
        valorIngresso: updateSessaoDto.valorIngresso,
        filmeId: updateSessaoDto.filmeId,
        salaId: updateSessaoDto.salaId,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.sessao.delete({
      where: { id },
    });
  }
}