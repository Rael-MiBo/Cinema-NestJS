import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateIngressoDto {
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsNumber()
  @Min(0)
  valorPago: number;

  @IsInt()
  sessaoId: number;
}