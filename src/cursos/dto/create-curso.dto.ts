import { IsString, MinLength } from 'class-validator';

export class CreateCursoDto {
  @IsString()
  @MinLength(3)
  titulo: string;

  @IsString()
  descripcion: string;

  @IsString()
  imagen: string;
}