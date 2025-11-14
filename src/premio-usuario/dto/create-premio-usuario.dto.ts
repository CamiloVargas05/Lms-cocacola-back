import { IsNumber } from 'class-validator';

export class CreatePremioUsuarioDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  premioId: number;
}