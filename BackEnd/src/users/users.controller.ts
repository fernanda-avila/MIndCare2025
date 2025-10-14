import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../common/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}
  @Post() create(@Body() dto: CreateUserDto) { return this.users.create(dto); }
  @Get() findAll() { return this.users.findAll(); }
  @Public()
  @Get('helpers') findHelpers() { return this.users.findHelpers(); }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('sync-helpers-to-pros')
  // Admin-only endpoint: create Professional records for users with role=HELPER
  // Useful to sync users (helpers) into the Professional table so they become
  // full professionals with schedule/appointments linkage.
  syncHelpersToProfessionals() { return this.users.syncHelpersToProfessionals(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.users.findOne(+id); }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Request() req: any, @Body() dto: UpdateUserDto) { return this.users.update(req.user.userId, dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateUserDto) { return this.users.update(+id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.users.remove(+id); }
}
