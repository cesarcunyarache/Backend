import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserPreferences } from '@prisma/client';
import { CreateUserPreferencesDto } from './dto/create-user-preferences.dto';

import * as speakeasy from 'speakeasy';

import qrcode from 'qrcode';
import { UserService } from 'src/user/user.service';

@Injectable()
export class UserPreferencesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService
) {}


  async generateMFASetup (userId: string) {


    const foundUser = await this.userService.findById(userId);

    if (foundUser) {
      throw new BadRequestException('User already has a 2FA setup');
    }

    let secretKey: string;

    const secret = speakeasy.generateSecret({ length: 20 });

    secretKey = secret.base32;
    
    const data = await this.prismaService.userPreferences.create({
      data: {
        userId,
        enable2FA: true,
        emailNotification: true,
        twoFactorSecret: secretKey,
      },
    });

    const url = speakeasy.otpauthURL({
      secret: secretKey,
      label: "Cesar" ,
      issuer:  'Whisk.com',
      encoding: 'base32',
    });


    const qrImageUrl = await qrcode.toDataURL(url);
    return {
        message: '2FA setup generated successfully',
        secretKey,
        qrImageUrl
    };
  }

  async verify2FA(userId: string, code: string): Promise<UserPreferences> {
    const foundPreferences = await this.findByUserId(userId);

    if (!foundPreferences) {
      throw new BadRequestException('User does not have a 2FA setu p');
    }

    const isValid = speakeasy.totp.verify({
      secret: foundPreferences.twoFactorSecret,
      encoding: 'base32',
      token: code,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }

    return foundPreferences;
  }

  
  async findByUserId(userId: string): Promise<UserPreferences | null> {
    return this.prismaService.userPreferences.findUnique({
      where: { userId },
      include: {
        user: {
            select: {
              id: true,
              name: true,
              email: true,
              isEmailVerified: true,
              provider: true,
              socialId: true,
              photoUrl: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              deletedAt: true,
              role: true,
              sessions: true,
              verificationCodes: true
            }
        },
      }
    });
  }

  async create(createDto: CreateUserPreferencesDto): Promise<UserPreferences> {
    return this.prismaService.userPreferences.create({
      data: createDto,
    });
  }

  async update(userId: string, data: Partial<UserPreferences>): Promise<UserPreferences> {
    return this.prismaService.userPreferences.update({
      where: { userId },
      data,
    });
  }

  async toggle2FA(userId: string, enable: boolean): Promise<UserPreferences> {
    return this.prismaService.userPreferences.update({
      where: { userId },
      data: {
        enable2FA: enable,
      },
    });
  }

  async toggleEmailNotification(userId: string, enable: boolean): Promise<UserPreferences> {
    return this.prismaService.userPreferences.update({
      where: { userId },
      data: {
        emailNotification: enable,
      },
    });
  }

  async setTwoFactorSecret(userId: string, secret: string): Promise<UserPreferences> {
    return this.prismaService.userPreferences.update({
      where: { userId },
      data: {
        twoFactorSecret: secret,
      },
    });
  }
}