import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCarreraDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 150)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  codigo: string;
}
