import { IsString, IsNumber, IsOptional, IsInt } from 'class-validator';

export class CreateLanchesComboDto {
  @IsString()
  nome: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  valorUnitario: number;

  @IsInt()
  qtUnidade: number;
}