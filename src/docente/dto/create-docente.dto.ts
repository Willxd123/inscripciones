import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateDocenteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200) // Más permisivo
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200) // Más permisivo
  apellido: string;

  @IsString() // Remover @IsEmail
  @MaxLength(250) // Más permisivo
  correo: string;
}