import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../common/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('professionals')
@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly pros: ProfessionalsService) {}

  // Público: listar/ver
  @Public()
  @Get()
  findAll() { return this.pros.findAll(); }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) { return this.pros.findOne(+id); }

  // Admin/Helper: CRUD de profissionais
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.HELPER)
  @Post()
  create(@Body() dto: CreateProfessionalDto) { return this.pros.create(dto); }

  // Admin: listar solicitações pendentes
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('requests/pending')
  pendingRequests() { return this.pros.findPendingRequests(); }

  // Admin: aprovar solicitação
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/approve')
  approve(@Param('id') id: string) { return this.pros.approve(+id); }

  // Admin: reprovar solicitação
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/reject')
  reject(@Param('id') id: string) { return this.pros.reject(+id); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.HELPER)
  @Patch(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateProfessionalDto) {
    const user = req.user;
    // If helper, ensure they can only update their own professional record
    if (user.role === 'HELPER') {
      const prof = await this.pros.findOne(+id);
      if (!prof || prof.userId !== user.userId) throw new ForbiddenException('Somente seu próprio perfil pode ser alterado');
    }
    return this.pros.update(+id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) { return this.pros.remove(+id); }
}
