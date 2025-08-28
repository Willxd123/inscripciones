import { IsInt, IsPositive, IsOptional } from 'class-validator';

export class CreateGrupoMateriaDto {
  @IsInt()
  @IsPositive()
  cupos: number;

  @IsInt()
  @IsPositive()
  materiaId: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  docenteId?: number;

  @IsInt()
  @IsPositive()
  grupoId: number;

  @IsInt()
  @IsPositive()
  periodoId: number;
}