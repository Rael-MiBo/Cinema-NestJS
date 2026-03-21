import { IsString, IsArray } from 'class-validator';

export class CreateSalaDto {
  @IsString()
  numero: string;

  @IsArray()
  poltronas: number[][];
}