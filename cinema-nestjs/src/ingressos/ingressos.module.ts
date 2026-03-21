import { Module } from '@nestjs/common';
import { IngressosService } from './ingressos.service';
import { IngressosController } from './ingressos.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IngressosController],
  providers: [IngressosService],
})
export class IngressosModule {}