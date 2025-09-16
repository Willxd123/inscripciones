import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt, IsPositive } from 'class-validator';

export class CreateMateriaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(250) // Más permisivo
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50) // Más permisivo
  sigla: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  nivelId?: number;
}