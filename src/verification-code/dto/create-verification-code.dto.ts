import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { VerificationEnum } from '@prisma/client';
import { Timestamp } from 'rxjs';

export class CreateVerificationCodeDto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  expiresAt: Date;

  @IsEnum(VerificationEnum)
  @IsNotEmpty()
  type: VerificationEnum;

  @IsString()
  code?: string;

}
