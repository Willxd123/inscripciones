import { IsString, IsNotEmpty, MaxLength, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateEstudianteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  registro: string;

  @IsString()
  @MinLength(6)
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

  @IsEmail()
  @MaxLength(150)
  correo: string;
}
