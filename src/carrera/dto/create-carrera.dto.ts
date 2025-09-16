import { IsNotEmpty, IsString, Length, IsOptional } from 'class-validator';

export class CreateCarreraDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 200) // Más permisivo
  nombre: string;

  @IsString()
  @IsOptional() // Hacer opcional para generar automáticamente
  @Length(1, 50) // Más permisivo
  codigo?: string;
}