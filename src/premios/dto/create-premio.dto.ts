import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreatePremioDto {
  @IsString()
  nombre: string;

  @IsNumber()
  cantidad: number;

  @IsNumber()
  puntos: number;

  @IsDateString()
  fechaLimite: Date;

  @IsString()
  img: string;
}