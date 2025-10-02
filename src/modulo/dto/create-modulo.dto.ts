import { IsString, IsNotEmpty, MaxLength, IsInt, IsPositive, IsOptional } from 'class-validator';

export class CreateModuloDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200) // Más permisivo
  nombre: string;

  @IsString()
  @IsOptional() // Opcional para generar automáticamente
  @MaxLength(100) // Más permisivo
  codigo?: string;

}