import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SessoesService } from './sessoes.service';
import { CreateSessaoDto } from './dto/create-sessao.dto';
import { UpdateSessaoDto } from './dto/update-sessao.dto';

@Controller('sessoes')
export class SessoesController {
  constructor(private readonly sessoesService: SessoesService) {}

  @Post()
  create(@Body() createSessaoDto: CreateSessaoDto) {
    return this.sessoesService.create(createSessaoDto);
  }

  @Get()
  findAll() {
    return this.sessoesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessoesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSessaoDto: UpdateSessaoDto) {
    return this.sessoesService.update(+id, updateSessaoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sessoesService.remove(+id);
  }
}