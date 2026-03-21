import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { GenerosModule } from './generos/generos.module';
import { FilmesModule } from './filmes/filmes.module';
import { SalasModule } from './salas/salas.module';
import { SessoesModule } from './sessoes/sessoes.module';
import { IngressosModule } from './ingressos/ingressos.module';
import { LanchesCombosModule } from './lanches-combo/lanches-combos.module';
import { PedidosModule } from './pedidos/pedidos.module';

@Module({
  imports: [
    PrismaModule,
    GenerosModule,
    FilmesModule,
    SalasModule,
    SessoesModule,
    IngressosModule,
    LanchesCombosModule,
    PedidosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}