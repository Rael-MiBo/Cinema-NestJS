import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateSalaDto {
  @IsString()
  @IsNotEmpty()
  numero: string;

  @IsInt()
  @Min(1)
  capacidade: number;
}