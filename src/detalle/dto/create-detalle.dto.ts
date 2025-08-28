import { IsInt, IsPositive } from 'class-validator';

export class CreateDetalleDto {
  @IsInt()
  @IsPositive()
  grupoMateriaId: number;

  @IsInt()
  @IsPositive()
  inscripcionId: number;
}