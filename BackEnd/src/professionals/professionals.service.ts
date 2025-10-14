import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';

@Injectable()
export class ProfessionalsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateProfessionalDto) { return this.prisma.professional.create({ data: dto }); }
  findAll() { return this.prisma.professional.findMany({ where: { active: true } }); }
  findOne(id: number) { return this.prisma.professional.findUnique({ where: { id } }); }
  update(id: number, dto: UpdateProfessionalDto) { return this.prisma.professional.update({ where: { id }, data: dto }); }
  remove(id: number) { return this.prisma.professional.delete({ where: { id } }); }
}
