import { PartialType } from '@nestjs/mapped-types';
import { CreateIngressoDto } from './create-ingresso.dto';

export class UpdateIngressoDto extends PartialType(CreateIngressoDto) {}