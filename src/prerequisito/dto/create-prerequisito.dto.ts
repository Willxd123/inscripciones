import { IsInt, IsPositive } from 'class-validator';

export class CreatePrerequisitoDto {
  @IsInt()
  @IsPositive()
  materiaId: number;

  @IsInt()
  @IsPositive()
  materiaRequeridaId: number;
}