/* import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user'; */

import { ApiProperty } from "@nestjs/swagger";
import {  User } from "@prisma/client";


class UserResponse {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  photoUrl?: string;
}

export class LoginResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  tokenExpires: number;

  @ApiProperty({
    type: () => UserResponse
  })
  user: UserResponse;
}
