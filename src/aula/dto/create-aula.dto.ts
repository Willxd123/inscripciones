import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt, IsPositive } from 'class-validator';

export class CreateAulaDto {
  @IsString()
  @IsOptional()
  @MaxLength(30)
  codigo?: string;

  @IsInt()
  @IsPositive()
  moduloId: number; // Agregar esta línea
}