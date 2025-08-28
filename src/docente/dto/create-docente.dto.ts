import { IsString, IsNotEmpty, MaxLength, IsEmail } from 'class-validator';

export class CreateDocenteDto {
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
