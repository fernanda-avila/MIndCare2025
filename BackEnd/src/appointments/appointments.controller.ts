import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appts: AppointmentsService) {}

  // Agenda do USUÁRIO logado
  @Get('me')
  listMine(@Request() req: any) {
    // req.user vem do JWT; no login usamos payload: { sub, email, role }
    return this.appts.findMine({ userId: req.user.sub, role: req.user.role });
  }

  // Criar agendamento
  @Post()
  create(@Body() dto: CreateAppointmentDto, @Request() req: any) {
    const userId = Number(req.user?.sub ?? req.user?.userId); // compatível com os dois formatos
    return this.appts.create(userId, dto);
  }


  // Atualizar agendamento
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAppointmentDto,
    @Request() req: any,
  ) {
    return this.appts.update({ userId: req.user.sub, role: req.user.role }, id, dto);
  }

  // Cancelar agendamento
  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.appts.cancel({ userId: req.user.sub, role: req.user.role }, id);
  }

  // Agenda de um PROFISSIONAL (ADMIN, PROFESSIONAL e HELPER podem acessar)
  @Get('professional/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROFESSIONAL, Role.HELPER)
  ofProfessional(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    // some auth flows put the id in req.user.sub, others in req.user.userId — normalize both
    const sub = req.user?.sub ?? req.user?.userId;
    return this.appts.ofProfessional({ sub, role: req.user.role }, id);
  }
}
