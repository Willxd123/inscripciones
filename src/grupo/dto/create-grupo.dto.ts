import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateGrupoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50) // Más permisivo
  nombre: string;
}