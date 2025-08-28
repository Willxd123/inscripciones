import { IsInt, IsPositive } from 'class-validator';

export class CreateBoletaHorarioDto {
  @IsInt()
  @IsPositive()
  grupoMateriaId: number;

  @IsInt()
  @IsPositive()
  horarioId: number;
}