import { IsInt, IsPositive, IsOptional } from 'class-validator';

export class CreateBoletaHorarioDto {
  @IsInt()
  @IsPositive()
  @IsOptional() // Hacer opcional en caso de que falte
  grupoMateriaId?: number;

  @IsInt()
  @IsPositive()
  @IsOptional() // Hacer opcional en caso de que falte
  horarioId?: number;
}