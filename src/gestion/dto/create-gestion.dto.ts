import { IsInt, IsPositive } from 'class-validator';

export class CreateGestionDto {
  @IsInt()
  @IsPositive()
  numero: number;
}