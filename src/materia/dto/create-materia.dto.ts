import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt, IsPositive } from 'class-validator';

export class CreateMateriaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  sigla: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  nivelId?: number;
}