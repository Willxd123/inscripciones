import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateGrupoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  nombre: string;
}