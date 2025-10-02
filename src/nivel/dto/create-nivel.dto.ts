import { IsInt, IsPositive, IsOptional } from 'class-validator';

export class CreateNivelDto {
  @IsInt()
  @IsOptional() // Opcional para generar automáticamente
  @IsPositive()
  numero?: number;


}