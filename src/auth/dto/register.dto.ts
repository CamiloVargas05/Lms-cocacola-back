import { IsEmail, IsOptional, IsString, MinLength, IsInt } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsInt()
  roleId?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}