import { IsString, IsNotEmpty, MaxLength, IsInt, IsPositive } from 'class-validator';

export class CreateModuloDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  codigo: string;

  @IsInt()
  @IsPositive()
  aulaId: number;
}