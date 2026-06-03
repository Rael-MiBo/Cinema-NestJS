import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  SetMetadata,
  Request,
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { CheckoutDto } from './dto/checkout.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('checkout')
  checkout(
    @Request() req: { user: { userId: number } },
    @Body() dto: CheckoutDto,
  ) {
    return this.pedidosService.checkout(req.user.userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  findMine(@Request() req: { user: { userId: number } }) {
    return this.pedidosService.findByUser(req.user.userId);
  }

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

  @Patch(':id/reembolsar')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SetMetadata('roles', ['ADMIN'])
  reembolsar(@Param('id') id: string) {
    return this.pedidosService.reembolsar(+id);
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