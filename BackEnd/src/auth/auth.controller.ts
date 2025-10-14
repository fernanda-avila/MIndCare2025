import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // Inject UsersService lazily to avoid circular import at top; require here
  // We'll import dynamically
  private usersService: any;

  onModuleInit() {
    // no-op: Nest will populate providers normally; kept for compatibility
  }

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @ApiBearerAuth()
  @Get('me')
  async me(@Request() req: any) {
    // req.user é preenchido pelo JwtStrategy (userId, email, role)
    // Get full user from DB so we can return avatarUrl and name
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const u = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { id: true, email: true, name: true, role: true, avatarUrl: true } });
    await prisma.$disconnect();
    return u;
  }
}