import { IsInt, IsPositive, IsOptional } from 'class-validator';

export class CreatePeriodoDto {
  @IsInt()
  @IsOptional() // Opcional para generar automáticamente
  @IsPositive()
  numero?: number;

  @IsInt()
  @IsPositive()
  gestionId: number;
}