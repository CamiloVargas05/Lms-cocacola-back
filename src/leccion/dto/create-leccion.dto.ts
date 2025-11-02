import { IsString, IsOptional, IsArray, IsInt, MinLength } from 'class-validator';

export class CreateLeccionDto {
  @IsString()
  @MinLength(3)
  titulo: string;

  @IsString()
  descripcion: string;

  @IsString()
  imagen: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsArray()
  archivos?: string[];

  @IsString()
  contenidoTexto: string;

  @IsInt()
  moduloId: number; // FK al módulo
}