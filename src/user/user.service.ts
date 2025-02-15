import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { AuthProvider, StatusUser, User } from '@prisma/client';
import { NullableType } from 'utils/types/nullable.type';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const clonedPayload = {
      ...createUserDto,
      provider: AuthProvider.EMAIL,
      status: StatusUser.ACTIVE,
    };

    if (clonedPayload.password) {
      const salt = await bcrypt.genSaltSync();
      clonedPayload.password = await bcrypt.hash(clonedPayload.password, salt);
    }

    if (clonedPayload.email) {
      const foundEmailUser = await this.findByEmail(clonedPayload.email);
      if (foundEmailUser) throw new BadRequestException(`Email already exists`);
    }

    return this.prismaService.user.create({
      data: clonedPayload,
    });
  }

  async findAll(): Promise<User[]> {
    return this.prismaService.user.findMany();
  }

  async findOne(id: string): Promise<User> {
    const foundUser = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!foundUser) throw new NotFoundException(`User with id ${id} not found`);

    return foundUser;
  }

  async findByEmail(email: string): Promise<User> {
    return await this.prismaService.user.findUnique({
      where: { email },
    });
  }

  findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: string;
    provider: AuthProvider;
  }): Promise<User> {
    return this.prismaService.user.findFirst({
      where: {
        socialId,
        provider,
      },
    });
  }

  async findById(id: string): Promise<User> {
    const foundUser = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!foundUser) throw new NotFoundException(`User with id ${id} not found`);

    return foundUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findOne(id);
    return this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }
}
