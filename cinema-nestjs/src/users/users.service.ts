import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { profileId, ...userData } = createUserDto;

    return this.prisma.user.create({
      data: {
        ...userData,
        profile: {
          connect: { id: profileId },
        },
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      include: {
        profile: true,
        address: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        address: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { profileId, ...userData } = updateUserDto;

    return this.prisma.user.update({
      where: { id },
      data: {
        ...userData,
        profile: profileId ? { connect: { id: profileId } } : undefined,
      },
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}