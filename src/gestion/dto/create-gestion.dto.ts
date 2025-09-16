import { IsInt, IsPositive, IsOptional } from 'class-validator';

export class CreateGestionDto {
  @IsInt()
  @IsOptional() // Opcional para generar automáticamente
  @IsPositive()
  numero?: number;
}