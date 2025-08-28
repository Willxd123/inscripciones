import { IsInt, IsPositive } from 'class-validator';

export class CreatePeriodoDto {
  @IsInt()
  @IsPositive()
  numero: number;

  @IsInt()
  @IsPositive()
  gestionId: number;
}