import { IsString, IsBoolean, IsNotEmpty } from 'class-validator';

export class EstablecerModoColaDto {
  @IsString()
  @IsNotEmpty()
  nombreServicio: string;

  @IsBoolean()
  usarCola: boolean;
}