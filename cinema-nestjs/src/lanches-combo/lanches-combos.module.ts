import { Module } from '@nestjs/common';
import { LanchesCombosService } from './lanches-combos.service';
import { LanchesCombosController } from './lanches-combos.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LanchesCombosController],
  providers: [LanchesCombosService],
})
export class LanchesCombosModule {}