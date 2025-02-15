import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateUserPreferencesDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsBoolean()
  enable2FA: boolean;

  @IsBoolean()
  emailNotification: boolean;
}