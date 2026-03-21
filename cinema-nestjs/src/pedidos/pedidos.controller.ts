import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  create(@Body() createPedidoDto: CreatePedidoDto) {
    return this.pedidosService.create(createPedidoDto);
  }

  @Get()
  findAll() {
    return this.pedidosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pedidosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePedidoDto: UpdatePedidoDto) {
    return this.pedidosService.update(+id, updatePedidoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pedidosService.remove(+id);
  }

  @Post(':id/lanches/:lancheId')
  adicionarLanche(@Param('id') id: string, @Param('lancheId') lancheId: string) {
    return this.pedidosService.adicionarLanche(+id, +lancheId);
  }

  @Delete(':id/lanches/:lancheId')
  removerLanche(@Param('id') id: string, @Param('lancheId') lancheId: string) {
    return this.pedidosService.removerLanche(+id, +lancheId);
  }

  @Post(':id/ingressos/:ingressoId')
  adicionarIngresso(@Param('id') id: string, @Param('ingressoId') ingressoId: string) {
    return this.pedidosService.adicionarIngresso(+id, +ingressoId);
  }

  @Delete(':id/ingressos/:ingressoId')
  removerIngresso(@Param('id') id: string, @Param('ingressoId') ingressoId: string) {
    return this.pedidosService.removerIngresso(+id, +ingressoId);
  }
}