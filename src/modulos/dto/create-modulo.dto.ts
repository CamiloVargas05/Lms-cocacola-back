import { IsString, IsInt, MinLength } from 'class-validator';

export class CreateModuloDto {
  @IsString()
  @MinLength(3)
  titulo: string;

  @IsString()
  descripcion: string;

  @IsString()
  imagen: string;

  @IsInt()
  cursoId: number; // FK del curso al que pertenece
}