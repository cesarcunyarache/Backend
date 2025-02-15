import { IsNotEmpty, IsString, IsUUID, IsOptional, IsDate } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  hash: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsDate()
  @IsNotEmpty()
  expiresAt: Date;
}