import { IsNotEmpty, IsString, IsUUID, IsOptional, IsDate } from 'class-validator';

export class UpdateSessionDto {
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