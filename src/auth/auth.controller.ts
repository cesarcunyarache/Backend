import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  SerializeOptions,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { NullableType } from 'utils/types/nullable.type';
import { User } from '@prisma/client';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  singUp(@Body() singUpDto: SignUpDto) {
    return this.authService.singUp(singUpDto);
  }

  @Post('sign-in')
  singIn(@Body() signIn: SignInDto) {
    return this.authService.singIn(signIn);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  public me(@Request() request) {
    return this.authService.me(request.user);
  }

  @Post('email/confirm')
  async confirmEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<void> {
    return this.authService.confirmEmail(confirmEmailDto.hash);
  }

  @Post('email/confirm/new')
  async confirmNewEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<void> {
    return this.authService.confirmNewEmail(confirmEmailDto.hash);
  }

  @Post('forgot/password')
  async forgotPassword(
    @Body() forgotPasswordDto: AuthForgotPasswordDto,
  ): Promise<void> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );
  }

  /* @ApiBearerAuth() */
  /* @ApiOkResponse({
    type: RefreshResponseDto,
  }) */
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  public refresh(@Request() request): Promise<RefreshResponseDto> {
    return this.authService.refreshToken({
      sessionId: request.user.sessionId,
      hash: request.user.hash,
    });
  }

  /* @ApiBearerAuth() */
  @SerializeOptions({
    groups: ['me'],
  })
  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  /*@ ApiOkResponse({
    type: User,
  }) */
  public update(
    @Request() request,
    @Body() userDto: AuthUpdateDto,
  ): Promise<NullableType<User>> {
    return 
   /*  this.service.update(request.user, userDto); */
  }






  @SerializeOptions({
    groups: ['me'],
  })
  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  /*@ ApiOkResponse({
    type: User,
  }) */
  public updateTo(
    @Request() request,
    @Body() userDto: SignInDto ,
  ): Promise<NullableType<User>> {
    return  this.authService.update(request.user, userDto);
  }
}
