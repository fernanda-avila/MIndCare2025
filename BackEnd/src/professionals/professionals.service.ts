import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';

@Injectable()
export class ProfessionalsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProfessionalDto) {
    const prof = await this.prisma.professional.create({ data: dto as any });
    // if this professional is linked to a user and has avatarUrl, propagate to user
    if (prof.userId && prof.avatarUrl) {
      try {
        await this.prisma.user.update({ where: { id: prof.userId }, data: { avatarUrl: prof.avatarUrl } });
      } catch (err) {
        // don't fail professional creation because user update failed
        console.warn('Failed to propagate avatarUrl to user', err);
      }
    }
    return prof;
  }

  findAll() { return this.prisma.professional.findMany({ where: { active: true } }); }
  findOne(id: number) { return this.prisma.professional.findUnique({ where: { id } }); }

  // list pending professional registration requests
  findPendingRequests() {
    return this.prisma.professional.findMany({ where: { registrationStatus: 'PENDING' } });
  }

  async approve(id: number) {
    const prof = await this.prisma.professional.update({ where: { id }, data: { registrationStatus: 'APPROVED', active: true } });
    if (prof.userId && prof.avatarUrl) {
      try { await this.prisma.user.update({ where: { id: prof.userId }, data: { avatarUrl: prof.avatarUrl } }); } catch(e){}
    }
    return prof;
  }

  async reject(id: number) {
    const prof = await this.prisma.professional.update({ where: { id }, data: { registrationStatus: 'REJECTED', active: false } });
    return prof;
  }

  async update(id: number, dto: UpdateProfessionalDto) {
    const prof = await this.prisma.professional.update({ where: { id }, data: dto as any });
    // if avatarUrl updated and professional linked to user, propagate
    if (dto.avatarUrl && prof.userId) {
      try {
        await this.prisma.user.update({ where: { id: prof.userId }, data: { avatarUrl: dto.avatarUrl } });
      } catch (err) {
        console.warn('Failed to propagate avatarUrl to user after professional update', err);
      }
    }
    return prof;
  }

  remove(id: number) { return this.prisma.professional.delete({ where: { id } }); }
}
