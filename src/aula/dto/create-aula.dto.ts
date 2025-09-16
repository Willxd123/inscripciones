import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateAulaDto {
  @IsString()
  @IsOptional() // Opcional para generar automáticamente
  @MaxLength(100) // Más permisivo
  codigo?: string;
}