import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVerificationCodeDto } from './dto/create-verification-code.dto';
import { VerificationCode, VerificationEnum } from '@prisma/client';
import { fortyFiveMinutesFromNow } from 'utils/date-time';
import { generateUniqueCode } from 'utils/uuid';

@Injectable()
export class VerificationCodeService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateVerificationCodeDto): Promise<VerificationCode> {
    return this.prismaService.verificationCode.create({
      data,
    });
  }

  async findOne(code: string): Promise<VerificationCode> {
    const verificationCode =
      await this.prismaService.verificationCode.findUnique({
        where: { code },
      });

    if (!verificationCode) {
      throw new NotFoundException(`Verification code not found`);
    }

    return verificationCode;
  }

  async findByUserAndType(
    userId: string,
    type: VerificationEnum,
  ): Promise<VerificationCode | null> {
    return this.prismaService.verificationCode.findFirst({
      where: {
        userId,
        type,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async delete(code: string): Promise<void> {
    await this.prismaService.verificationCode.delete({
      where: { code },
    });
  }

  async isValid(code: string): Promise<boolean> {
    const verificationCode = await this.findOne(code);
    const now = new Date();
    return verificationCode.expiresAt > now;
  }

  async countsVerificationCode({
    userId,
    type,
    date,
  }: {
    userId: string;
    type: VerificationEnum;
    date: Date;
  }) {
    return this.prismaService.verificationCode.count({
      where: {
        userId,
        type,
        createdAt: {
          gt: date,
        },
      },
    });
  }
}
