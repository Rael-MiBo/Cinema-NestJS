import { IsInt, IsISO8601, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateSessaoDto {
  @IsISO8601()
  @IsNotEmpty()
  data: string;

  @IsNumber()
  @Min(0)
  valorIngresso: number;

  @IsInt()
  filmeId: number;

  @IsInt()
  salaId: number;
}