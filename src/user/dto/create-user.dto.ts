import {
  IsString,
  IsNotEmpty,
  IsEmail,
  ValidateIf,
  MinLength,
  IsStrongPassword,
  IsOptional,
  IsEnum,
  IsUUID,
  IsUrl,
} from 'class-validator';
import { AuthProvider, StatusUser } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @IsStrongPassword()
  password: string;

  @ValidateIf((o) => o.password !== o.confirmPassword)
  confirmPassword?: string;

  @IsOptional()
  @IsString()
  socialId?: string;

  @IsOptional()
  @IsEnum(AuthProvider)
  provider?: AuthProvider;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @IsOptional()
  @IsUUID()
  roleId?: string;

  @IsOptional()
  @IsEnum(StatusUser)
  status?: StatusUser;
}
