import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import appConfig from './config/app.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import authConfig from './auth/config/auth.config';
import mailConfig from './mail/config/mail.config';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import { AllConfigType } from './config/config.type';
import * as path from 'path';
import { Auth } from './auth/entities/auth.entity';

import googleConfig from './auth-google/config/google.config';
import { MailerModule } from './mailer/mailer.module';
import { SessionModule } from './session/session.module';
import { AuthGoogleModule } from './auth-google/auth-google.module';
import facebookConfig from './auth-facebook/config/facebook.config';
import { AuthFacebookModule } from './auth-facebook/auth-facebook.module';

console.log(path.join(__dirname, '/i18n/'));
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, mailConfig, googleConfig, facebookConfig],
      envFilePath: ['.env'],
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),

        loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return [
              configService.get('app.headerLanguage', {
                infer: true,
              }),
            ];
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    MailModule,
    SessionModule,
    MailerModule,
    AuthGoogleModule,
    /* AuthFacebookModule, */
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
