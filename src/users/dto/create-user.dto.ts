import { IsEmail, IsOptional, IsString, MinLength, IsInt } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsInt()
  @IsOptional()
  roleId?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}