import { IsInt, IsPositive } from 'class-validator';

export class CreateNivelDto {
  @IsInt()
  @IsPositive()
  numero: number;

  @IsInt()
  @IsPositive()
  planEstudioId: number;
}