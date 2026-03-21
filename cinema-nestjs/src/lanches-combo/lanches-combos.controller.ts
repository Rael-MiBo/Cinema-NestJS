import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LanchesCombosService } from './lanches-combos.service';
import { CreateLanchesComboDto } from './dto/create-lanche-combo.dto';
import { UpdateLancheComboDto } from './dto/update-lanche-combo.dto';

@Controller('lanches-combos')
export class LanchesCombosController {
  constructor(private readonly lanchesCombosService: LanchesCombosService) {}

  @Post()
  create(@Body() createLanchesComboDto: CreateLanchesComboDto) {
    return this.lanchesCombosService.create(createLanchesComboDto);
  }

  @Get()
  findAll() {
    return this.lanchesCombosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lanchesCombosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLancheComboDto: UpdateLancheComboDto) {
    return this.lanchesCombosService.update(+id, updateLancheComboDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lanchesCombosService.remove(+id);
  }
}