import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateAppointmentDto) {
    // Valida profissional
    const prof = await this.prisma.professional.findUnique({
      where: { id: dto.professionalId },
    });
    if (!prof || !prof.active) {
      throw new NotFoundException('Profissional não encontrado/ativo');
    }

    // Valida janela
    const start = new Date(dto.startAt);
    const end = new Date(dto.endAt);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Datas inválidas');
    }
    if (!(start < end)) {
      throw new BadRequestException('Intervalo inválido');
    }

    // Checa conflito de agenda do profissional:
    // (start < existing.end) AND (end > existing.start)
    const profClash = await this.prisma.appointment.findFirst({
      where: {
        professionalId: dto.professionalId,
        status: { not: 'CANCELLED' },
        startAt: { lt: end },
        endAt: { gt: start },
      },
      select: { id: true },
    });
    if (profClash) {
      throw new ConflictException('Horário indisponível');
    }

    const userClash = await this.prisma.appointment.findFirst({
      where: {
        userId,
        status: { not: 'CANCELLED' },
        startAt: { lt: end },
        endAt: { gt: start },
      },
      select: { id: true },
    });
    if (userClash) {
      throw new ConflictException('Você já tem um agendamento nesse horário');
    }

    return this.prisma.appointment.create({
      data: {
        userId,
        professionalId: dto.professionalId,
        startAt: start,
        endAt: end,
      notes: dto.notes,
    },
  });
}
  async ofProfessional(user: { sub: number; role: string }, professionalId: number) {
    // ensure professional exists
    const prof = await this.prisma.professional.findUnique({ where: { id: professionalId } });
    if (!prof) throw new NotFoundException('Profissional não encontrado');

    // Admin can fetch any professional's schedule
    if (user.role === 'ADMIN') {
      return this.prisma.appointment.findMany({
        where: { professionalId, status: { not: 'CANCELLED' } },
        orderBy: { startAt: 'asc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
    }

    // DEBUG: log values used in permission check to help diagnose 403
    try {
      console.log('[DEBUG] appointments.ofProfessional check — professionalId=%s, prof.userId=%s (typeof=%s), req.user.sub=%s (typeof=%s), req.user.role=%s',
        String(professionalId), String(prof.userId), typeof prof.userId, String(user.sub), typeof user.sub, String(user.role));
    } catch (e) {
      console.log('[DEBUG] appointments.ofProfessional check — failed to stringify debug values', e);
    }

    // PROFESSIONAL/HELPER can only fetch if they are linked to this professional record
    // ensure numeric comparison to avoid string/number mismatches from JWT 'sub'
    if (Number(prof.userId) !== Number(user.sub)) {
      console.log('[DEBUG] permission denied: Number(prof.userId) !== Number(user.sub) ->', Number(prof.userId), Number(user.sub));
      throw new ForbiddenException('Sem permissão para acessar a agenda deste profissional');
    }

    return this.prisma.appointment.findMany({
      where: { professionalId, status: { not: 'CANCELLED' } },
      orderBy: { startAt: 'asc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  // Admin: todos; Helper/Profissional: seus; User: próprios
  findMine(user: { userId: number; role: string }) {
    if (user.role === 'ADMIN') {
      return this.prisma.appointment.findMany({
        orderBy: { startAt: 'asc' },
        include: { professional: { select: { id: true, name: true, specialty: true } }, },
      });
    }
    // (se houver vínculo de profissional ao usuário, poderíamos refinar para PROFESSIONAL ver só dele)
    if (user.role === 'HELPER') {
      return this.prisma.appointment.findMany({
        orderBy: { startAt: 'asc' },
        include: { professional: { select: { id: true, name: true, specialty: true } }, },
      });
    }
    return this.prisma.appointment.findMany({
      where: { userId: user.userId },
      orderBy: { startAt: 'asc' },
      include: { professional: { select: { id: true, name: true, specialty: true } }, },
    });
  }

  async update(user: { userId: number; role: string }, id: number, dto: UpdateAppointmentDto) {
    const appt = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appt) throw new NotFoundException('Agendamento não encontrado');

    // Permissão: Admin pode tudo; usuário só altera o próprio; profissional vinculado também pode alterar notas
    // Helpers (staff) também devem poder editar apenas as notas — permitimos HELPERS aqui
    if (user.role !== 'ADMIN' && user.role !== 'HELPER' && appt.userId !== user.userId) {
      // check if user is the professional owner of this appointment
      const prof = await this.prisma.professional.findUnique({ where: { id: appt.professionalId } });
      if (!prof || prof.userId !== user.userId) {
        throw new ForbiddenException('Sem permissão');
      }
    }

    const start = dto.startAt ? new Date(dto.startAt) : appt.startAt;
    const end = dto.endAt ? new Date(dto.endAt) : appt.endAt;

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Datas inválidas');
    }
    if (!(start < end)) {
      throw new BadRequestException('Intervalo inválido');
    }

    // Conflito no profissional (exclui o próprio id)
    const conflict = await this.prisma.appointment.findFirst({
      where: {
        id: { not: id },
        professionalId: appt.professionalId,
        status: { not: 'CANCELLED' },
        startAt: { lt: end },
        endAt: { gt: start },
      },
      select: { id: true },
    });
    if (conflict) throw new ConflictException('Horário indisponível');

    return this.prisma.appointment.update({
      where: { id },
      data: {
        startAt: start,
        endAt: end,
        notes: dto.notes,
      },
    });
  }

  cancel(user: { userId: number; role: string }, id: number) {
    // User pode cancelar o próprio; Admin/Helper qualquer
    const where =
      user.role === 'ADMIN' || user.role === 'HELPER'
        ? { id }
        : { id, userId: user.userId };

    return this.prisma.appointment.update({
      where,
      data: { status: 'CANCELLED' },
    });
  }
}
