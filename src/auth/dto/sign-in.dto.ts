import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsEnum,
  ValidateIf,
  MinLength,
  IsStrongPassword,
} from 'class-validator';

export class SignInDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  userAgent?: string;
}
