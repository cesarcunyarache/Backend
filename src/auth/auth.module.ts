import { Module, Session, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { SessionModule } from 'src/session/session.module';
import { AuthGoogleModule } from '../auth-google/auth-google.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  imports: [PrismaModule,  UserModule, VerificationCodeModule, SessionModule, PassportModule, MailModule, JwtModule.register({}),

  ],

  exports: [AuthService]
})
export class AuthModule {}
