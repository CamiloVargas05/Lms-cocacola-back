import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class VerifyCodeDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  code: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  code: string;

  @MinLength(6)
  newPassword: string;

  @MinLength(6)
  confirmPassword: string;
}