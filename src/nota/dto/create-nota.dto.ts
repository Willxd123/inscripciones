import { IsInt, IsPositive, IsNumber, Min, Max } from 'class-validator';

export class CreateNotaDto {
  @IsInt()
  @IsPositive()
  grupoMateriaId: number;

  @IsInt()
  @IsPositive()
  estudianteId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  numero: number;
}