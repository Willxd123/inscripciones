import { IsString, IsNotEmpty, MaxLength, IsEmail, MinLength, IsOptional, IsInt, IsPositive } from 'class-validator';

export class CreateEstudianteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  registro: string;

  @IsString()
  @IsOptional()
  clave?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  apellido: string;

  @IsString()
  @MaxLength(150)
  correo: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  planEstudioId?: number; // Agregar esta línea
}