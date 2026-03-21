import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateFilmeDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsInt()
  @Min(1)
  duracao: number;

  @IsString()
  @IsNotEmpty()
  classificacaoEtaria: string;

  @IsInt()
  generoId: number;
}