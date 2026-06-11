import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Response,
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { AuthGuard } from '@nestjs/passport';
import { CheckoutDto } from './dto/checkout.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/auth.controller';

@ApiTags('Pedidos')
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  @Post('checkout')
  checkout(
    @Request() req: { user: { userId: number } },
    @Body() dto: CheckoutDto,
  ) {
    return this.pedidosService.checkout(req.user.userId, dto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  findMine(@Request() req: { user: { userId: number } }) {
    return this.pedidosService.findByUser(req.user.userId);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createPedidoDto: CreatePedidoDto) {
    return this.pedidosService.create(createPedidoDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.pedidosService.findAll();
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pedidosService.findOne(+id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePedidoDto: UpdatePedidoDto) {
    return this.pedidosService.update(+id, updatePedidoDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pedidosService.remove(+id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  @Roles('ADMIN')
  @Patch(':id/reembolsar')
  reembolsar(@Param('id') id: string) {
    return this.pedidosService.reembolsar(+id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/lanches/:lancheId')
  adicionarLanche(
    @Param('id') id: string,
    @Param('lancheId') lancheId: string,
  ) {
    return this.pedidosService.adicionarLanche(+id, +lancheId);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/lanches/:lancheId')
  removerLanche(@Param('id') id: string, @Param('lancheId') lancheId: string) {
    return this.pedidosService.removerLanche(+id, +lancheId);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/ingressos/:ingressoId')
  adicionarIngresso(
    @Param('id') id: string,
    @Param('ingressoId') ingressoId: string,
  ) {
    return this.pedidosService.adicionarIngresso(+id, +ingressoId);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/ingressos/:ingressoId')
  removerIngresso(
    @Param('id') id: string,
    @Param('ingressoId') ingressoId: string,
  ) {
    return this.pedidosService.removerIngresso(+id, +ingressoId);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/comprovante')
  async gerarComprovante(@Param('id') id: string, @Response() res: any) {
    const pdfBuffer = await this.pedidosService.generateReceipt(+id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="comprovante_${id}.pdf"`,
    });
    res.send(pdfBuffer);
  }
}