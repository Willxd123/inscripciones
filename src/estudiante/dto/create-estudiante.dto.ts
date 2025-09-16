import { IsString, IsNotEmpty, MaxLength, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateEstudianteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100) // Más permisivo
  registro: string;

  @IsString()
  @IsOptional() // Completamente opcional
  @MinLength(1) // Menos restrictivo
  clave?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200) // Más permisivo
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200) // Más permisivo
  apellido: string;

  @IsString() // Remover @IsEmail para ser más flexible
  @MaxLength(250) // Más permisivo
  correo: string;
}