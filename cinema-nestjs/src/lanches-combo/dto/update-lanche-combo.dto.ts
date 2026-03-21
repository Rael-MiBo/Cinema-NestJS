import { PartialType } from '@nestjs/mapped-types';
import { CreateLanchesComboDto } from './create-lanche-combo.dto';

export class UpdateLancheComboDto extends PartialType(CreateLanchesComboDto) {}