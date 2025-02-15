import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {  UpdateSessionDto } from './dto/update-session.dto';
import { Session } from '@prisma/client';
import { CreateSessionDto } from './dto/create-session.dto copy';

@Injectable()
export class SessionService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    return this.prismaService.session.create({
      data: createSessionDto,
      include: {
        user: true
      }
    });
  }

  async findAll(): Promise<Session[]> {
    return this.prismaService.session.findMany({
      where: {
        deletedAt: null,
      },
    });
  }

  async findOne(id: string): Promise<Session> {
    const session = await this.prismaService.session.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException(`Session with id ${id} not found`);
    }

    return session;
  }

  async findById(id: string): Promise<Session> {
    const session = await this.prismaService.session.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!session) {
      throw new NotFoundException(`Session with id ${id} not found`);
    }

    return session;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return this.prismaService.session.findMany({
      where: {
        userId,
        deletedAt: null,
      },
    });
  }

  async findActiveByHash(hash: string): Promise<Session | null> {
    return this.prismaService.session.findFirst({
      where: {
        hash,
        deletedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async softDelete(id: string): Promise<Session> {
    const session = await this.findOne(id);
    return this.prismaService.session.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async invalidateUserSessions(userId: string): Promise<void> {
    await this.prismaService.session.updateMany({
      where: {
        userId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async cleanExpiredSessions(): Promise<void> {
    await this.prismaService.session.updateMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async update(id: string, data: UpdateSessionDto): Promise<Session> {
    return this.prismaService.session.update({
      where: { id },
      data,
    });
  }
}