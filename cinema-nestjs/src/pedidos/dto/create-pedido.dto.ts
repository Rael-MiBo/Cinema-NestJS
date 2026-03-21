import { IsArray, IsInt, IsOptional } from 'class-validator';

export class CreatePedidoDto {
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  ingressoIds?: number[];

  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  lancheComboIds?: number[];
}