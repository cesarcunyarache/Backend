import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

import { PrismaService } from 'src/prisma/prisma.service';

import { SignInDto } from './dto/sign-in.dto';

import * as bcrypt from 'bcryptjs';
import * as ms from 'ms';
import * as crypto from 'crypto';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { JwtPayloadType } from './strategies/types/jwt-payload.type';
import { MailService } from 'src/mail/mail.service';
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type';
import { NullableType } from 'utils/types/nullable.type';
import { LoginResponseDto } from './dto/login-response.dto';
import {
  AuthProvider,
  StatusUser,
  User,
  VerificationEnum,
} from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { SignUpDto } from './dto/sign-up.dto';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { generateUniqueCode } from 'utils/uuid';
import {
  anHourFromNow,
  fortyFiveMinutesFromNow,
  threeMinutesAgo,
} from 'utils/date-time';
import { SessionService } from 'src/session/session.service';
import { SocialInterface } from 'src/social/interfaces/social.interface';
import { Response } from 'utils/response';
import { Server } from 'http';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly verificationCodeService: VerificationCodeService,
    private readonly sessionService: SessionService,
    private readonly mailService: MailService,
    private configService: ConfigService<AllConfigType>,
  ) {}

  async singUp(signUpDTO: SignUpDto) {

    const { name, email, password } = signUpDTO;

    const user = await this.userService.create({
      name,
      email,
      password,
    });

    const verificationCode = await this.verificationCodeService.create({
      userId: user.id,
      type: VerificationEnum.EMAIL_VERIFICATION,
      expiresAt: fortyFiveMinutesFromNow(),
      code: generateUniqueCode(),
    });


   /*  await this.mailService.userSignUp({
      to: email,
      data: {
        hash: verificationCode.code,
      },
    });
 */
    return {
      message: 'Created user successfully',
      data: user,
      status: HttpStatus.CREATED,
    };
  }

  async validateSocialLogin(
    authProvider: AuthProvider,
    socialData: SocialInterface,
  ): Promise<LoginResponseDto> {
    let user: NullableType<User> = null;
    const socialEmail = socialData.email?.toLowerCase();
    let userByEmail: NullableType<User> = null;

    if (socialEmail) {
      userByEmail = await this.userService.findByEmail(socialEmail);
    }

    if (socialData.id) {
      user = await this.userService.findBySocialIdAndProvider({
        socialId: socialData.id,
        provider: authProvider,
      });
    }

    if (user) {
      if (socialEmail && !userByEmail) {
        user.email = socialEmail;
      }
      await this.userService.update(user.id, user);
    } else if (userByEmail) {
      user = userByEmail;
    } else if (socialData.id) {
      /* const role = {
        id: RoleEnum.user,
      }; */
      const status = StatusUser.ACTIVE;

      user = await this.userService.create({
        email: socialEmail ?? null,
        /*  firstName: socialData.firstName ?? null,
        lastName: socialData.lastName ?? null, */
        name: socialData.firstName ?? null,
        socialId: socialData.id,
        provider: authProvider,
        password: '',
        /*  role, */
        status,
      });

      user = await this.userService.findById(user.id);
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });

    const tokenExpiresSession = Date.now() + ms(tokenExpiresIn);

    const session = await this.sessionService.create({
      userId: user.id,
      hash,
      expiresAt: tokenExpiresSession,
    });

    const {
      token: jwtToken,
      refreshToken,
      tokenExpires,
    } = await this.getTokensData({
      id: user.id,
      /*   role: user.role, */
      sessionId: session.id,
      hash,
    });

    return {
      refreshToken,
      token: jwtToken,
      tokenExpires,
      user,
    };
  }

  async singIn(signInDto: SignInDto) {
    const user = await this.userService.findByEmail(signInDto.email);

    if (!user) throw new UnauthorizedException('User not found');

    if (user.provider !== AuthProvider.EMAIL)
      throw new UnprocessableEntityException(
        `Need Login via Provider: ${user.provider}`,
      );

    if (!user.password) throw new BadRequestException('Incorrect Password');

    const isValidPassword = await bcrypt.compare(
      signInDto.password,
      user.password,
    );

    if (!isValidPassword) throw new UnauthorizedException('Incorrect Password');

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });

    const tokenExpiresSession = Date.now() + ms(tokenExpiresIn);

    const session = await this.sessionService.create({
      userId: user.id,
      hash,
      expiresAt: tokenExpiresSession,
      userAgent: signInDto.userAgent,
    });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
      hash,
      sessionId: session.id,
    });

    return {
      refreshToken,
      token,
      tokenExpires,
      user,
    };
  }

  async confirmEmail(hash: string): Promise<void> {
    let userId: string;

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        confirmEmailUserId: string;
      }>(hash, {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
      });

      userId = jwtData.confirmEmailUserId;
    } catch {
      throw new BadRequestException('Invalid Hash');
    }

    const user = await this.userService.findOne(userId);

    if (!user || user.status !== StatusUser.ACTIVE) {
      throw new NotFoundException('Not Found');
    }

    user.isEmailVerified = true;

    await this.userService.update(user.id, user);
  }

  async confirmNewEmail(hash: string): Promise<void> {
    let userId: string;
    let newEmail: string;

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        confirmEmailUserId: string;
        newEmail: string;
      }>(hash, {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
      });

      userId = jwtData.confirmEmailUserId;
      newEmail = jwtData.newEmail;
    } catch {
      throw new BadRequestException('Invalid Hash');
    }

    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new NotFoundException('Not Found');
    }

    user.email = newEmail;
    user.isEmailVerified = true;

    await this.userService.update(user.id, user);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'emailNotExists',
        },
      });
    }

    // confirgurar como variable de entorno
    const maxAttempts = 2;
    const timeAgo = threeMinutesAgo();

    const count = await this.verificationCodeService.countsVerificationCode({
      userId: user.id,
      type: VerificationEnum.PASSWORD_RESET,
      date: timeAgo,
    });

    if (count >= maxAttempts) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'maxAttemptsExceeded',
        },
      });
    }

    const tokenExpiresIn = this.configService.getOrThrow('auth.forgotExpires', {
      infer: true,
    });

    const expiresAt = anHourFromNow();

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const hash = await this.jwtService.signAsync(
      {
        forgotUserId: user.id,
      },
      {
        secret: this.configService.getOrThrow('auth.forgotSecret', {
          infer: true,
        }),
        expiresIn: tokenExpiresIn,
      },
    );

    const verificationCode = await this.verificationCodeService.create({
      userId: user.id,
      type: VerificationEnum.PASSWORD_RESET,
      expiresAt,
    });

    await this.mailService.forgotPassword({
      to: email,
      data: {
        hash,
        tokenExpires,
      },
    });
  }

  async resetPassword(hash: string, password: string): Promise<void> {
    let userId: string;

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        forgotUserId: string;
      }>(hash, {
        secret: this.configService.getOrThrow('auth.forgotSecret', {
          infer: true,
        }),
      });

      userId = jwtData.forgotUserId;
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `invalidHash`,
        },
      });
    }

    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: `notFound`,
        },
      });
    }

    user.password = password;

    await this.userService.update(user.id, user);
  }

  async update(
    userJwtPayload: JwtPayloadType,
    userDto: SignInDto,
  ): Promise<NullableType<User>> {
    const currentUser = await this.userService.findOne(userJwtPayload.id);

    if (!currentUser) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: 'userNotFound',
        },
      });
    }

    if (userDto.password) {
      if (!userDto.password) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            oldPassword: 'missingOldPassword',
          },
        });
      }

      if (!currentUser.password) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            oldPassword: 'incorrectOldPassword',
          },
        });
      }

      const isValidOldPassword = await bcrypt.compare(
        /* confrmar contraseña primero*/
        userDto.password,
        currentUser.password,
      );

      if (!isValidOldPassword) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            oldPassword: 'incorrectOldPassword',
          },
        });
      } else {
        /* await this.sessionService.deleteByUserIdWithExclude({
          userId: currentUser.id,
          excludeSessionId: userJwtPayload.sessionId,
        }); */
      }
    }

    if (userDto.password && userDto.email !== currentUser.email) {
      const userByEmail = await this.userService.findByEmail(userDto.email);

      if (userByEmail && userByEmail.id !== currentUser.id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailExists',
          },
        });
      }

      const hash = await this.jwtService.signAsync(
        {
          confirmEmailUserId: currentUser.id,
          newEmail: userDto.email,
        },
        {
          secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
            infer: true,
          }),
        },
      );

      await this.mailService.confirmNewEmail({
        to: userDto.email,
        data: {
          hash,
        },
      });
    }

    delete userDto.email;
    /* delete userDto.oldPassword; */

    await this.userService.update(userJwtPayload.id, userDto);

    return this.userService.findOne(userJwtPayload.id);
  }

  async refreshToken(
    data: Pick<JwtRefreshPayloadType, 'sessionId' | 'hash'>,
  ): Promise<Omit<LoginResponseDto, 'user'>> {
    const session = await this.sessionService.findById(data.sessionId);

    if (!session) {
      throw new UnauthorizedException();
    }

    if (session.hash !== data.hash) {
      throw new UnauthorizedException();
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const user = await this.userService.findById(session.userId);

    /* if (!user?.role) {
      throw new UnauthorizedException();
    } */

    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });

    const tokenExpiresSession = Date.now() + ms(tokenExpiresIn);

    await this.sessionService.update(session.id, {
      userId: user.id,
      hash,
      expiresAt: tokenExpiresSession,
    });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: session.userId,
      /* role: {
        id: user.role.id,
      },  */
      sessionId: session.id,
      hash,
    });

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  private async getTokensData(data: {
    id: string;
    /*    role: User['role'];*/
    sessionId: string;
    hash: string;
  }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          /*    role: data.role,*/
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
          hash: data.hash,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  async me(userJwtPayload: JwtPayloadType) {
    return this.userService.findOne(userJwtPayload.id);
  }
}
