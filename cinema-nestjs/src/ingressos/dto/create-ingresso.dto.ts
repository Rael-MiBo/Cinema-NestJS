import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateIngressoDto {
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsInt()
  sessaoId: number;

  @IsInt()
  fila: number;

  @IsInt()
  assento: number;
}