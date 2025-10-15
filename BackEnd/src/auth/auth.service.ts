import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../common/enums/role.enum';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(data: RegisterDto) {
    const email = data.email.trim().toLowerCase();
    const name = data.name.trim();
    const role = data.role ?? Role.USER; 

    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('E-mail já cadastrado');

    const passwordHash = await bcrypt.hash(data.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: { email, name, passwordHash, role },
      });

      // if registering as HELPER, create a Professional request (PENDING)
      if (role === Role.HELPER) {
        await this.prisma.professional.create({
          data: {
            name,
            specialty: data.specialty || null,
            bio: data.bio || null,
            crp: data.crp || null,
            avatarUrl: data.avatarUrl || null,
            user: { connect: { id: user.id } },
            active: false,
            registrationStatus: 'PENDING'
          }
        }).catch(() => {});
      }
      return { id: user.id, email: user.email, name: user.name, role: user.role };
    } catch (e) {

      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('E-mail já cadastrado');
      }
      throw e;
    }
  }

  async login({ email, password }: LoginDto) {

    const normalized = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({ where: { email: normalized } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = await this.jwt.signAsync(payload, { expiresIn: '1d' });
    return { access_token };
  }
}
