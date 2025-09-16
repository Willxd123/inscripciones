import { IsInt, IsPositive, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateNotaDto {
  @IsInt()
  @IsPositive()
  grupoMateriaId: number;

  @IsInt()
  @IsPositive()
  estudianteId: number;

  @IsNumber()
  @IsOptional() // Hacer opcional con valor por defecto
  @Min(0)
  @Max(100)
  numero?: number;
}