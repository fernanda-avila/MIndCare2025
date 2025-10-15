import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({ data: { email: dto.email, name: dto.name, passwordHash, role: dto.role } });

    // If the created user is a HELPER, ensure a Professional row exists for them.
    try {
      if (user.role === 'HELPER') {
        const existing = await this.prisma.professional.findUnique({ where: { userId: user.id } });
        if (!existing) {
          await this.prisma.professional.create({ data: {
            userId: user.id,
            name: user.name,
            specialty: (dto as any).specialty || null,
            bio: (dto as any).bio || null,
            avatarUrl: (dto as any).avatarUrl || null,
            active: true,
            registrationStatus: 'APPROVED'
          } });
        }
      }
    } catch (err) {
      // Don't fail user creation on professional sync issues; log or rethrow depending on needs.
      // For now, swallow to keep user experience smooth.
      console.warn('Failed to create professional for helper user', err);
    }

    return user;
  }
  findAll() { return this.prisma.user.findMany({ select: { id:true, email:true, name:true, role:true, avatarUrl:true, createdAt:true } }); }
  findHelpers() { return this.prisma.user.findMany({ where: { role: 'HELPER' }, select: { id:true, email:true, name:true, role:true, avatarUrl:true, createdAt:true } }); }
  /**
   * Create Professional rows for users with role HELPER that don't have one yet.
   * Returns summary { created: number, skipped: number }
   */
  async syncHelpersToProfessionals() {
    const helpers = await this.prisma.user.findMany({ where: { role: 'HELPER' }, include: { professional: true } });
    const toCreate = helpers.filter((h) => !h.professional);
    if (toCreate.length === 0) return { created: 0, skipped: helpers.length };

    const created: any[] = [];
    await this.prisma.$transaction(async (tx) => {
      for (const u of toCreate) {
        const p = await tx.professional.create({ data: { userId: u.id, name: u.name, specialty: null, bio: null } });
        created.push(p);
      }
    });
    return { created: created.length, skipped: helpers.length - created.length };
  }
  findOne(id: number) { return this.prisma.user.findUnique({ where: { id }, select: { id:true, email:true, name:true, role:true, avatarUrl:true } }); }
  async update(id: number, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({ where: { id }, data: dto });

    // Keep Professional in sync when role/name changes.
    try {
      const prof = await this.prisma.professional.findUnique({ where: { userId: id } });

      // If user became a HELPER, create professional if missing
      if (dto.role === 'HELPER') {
        if (!prof) {
          await this.prisma.professional.create({ data: { userId: id, name: user.name, specialty: null, bio: null } });
        }
      }

      // If user lost HELPER role, deactivate the professional instead of deleting
      if (dto.role && dto.role !== 'HELPER' && prof) {
        await this.prisma.professional.update({ where: { id: prof.id }, data: { active: false } });
      }

      // If name changed, propagate to professional
      if (dto.name && prof) {
        await this.prisma.professional.update({ where: { id: prof.id }, data: { name: user.name } });
      }
    } catch (err) {
      console.warn('Failed to sync professional after user update', err);
    }

    return user;
  }
  remove(id: number) { return this.prisma.user.delete({ where: { id } }); }
}
