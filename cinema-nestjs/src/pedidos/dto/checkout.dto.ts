import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutIngressoDto {
  @IsInt()
  fila: number;

  @IsInt()
  assento: number;

  @IsString()
  @IsNotEmpty()
  tipo: string;
}

export class CheckoutDto {
  @IsInt()
  sessaoId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutIngressoDto)
  ingressos: CheckoutIngressoDto[];

  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  lancheComboIds?: number[];

  @IsString()
  @IsNotEmpty()
  metodoPagamento: string;
}
