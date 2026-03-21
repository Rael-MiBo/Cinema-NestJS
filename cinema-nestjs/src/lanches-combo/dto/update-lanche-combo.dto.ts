import { PartialType } from '@nestjs/mapped-types';
import { CreateLancheComboDto } from './create-lanche-combo.dto';

export class UpdateLancheComboDto extends PartialType(CreateLancheComboDto) {}