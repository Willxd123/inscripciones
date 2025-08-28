import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateAulaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  codigo: string;
}