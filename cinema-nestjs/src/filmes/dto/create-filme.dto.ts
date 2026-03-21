import { IsString, IsInt, IsOptional, IsDateString } from 'class-validator';

export class CreateFilmeDto {
  @IsString()
  titulo: string;

  @IsString()
  @IsOptional()
  sinopse?: string;

  @IsString()
  classificacao: string;

  @IsInt()
  duracao: number;

  @IsString()
  @IsOptional()
  elenco?: string;

  @IsDateString()
  dataIniciaExibicao: string;

  @IsDateString()
  dataFinalExibicao: string;

  @IsInt()
  generoId: number;
}