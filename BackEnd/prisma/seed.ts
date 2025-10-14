import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Role } from '../src/common/enums/role.enum';

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash('admin123', 10);
  const userPass = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@local.com' },
    update: { name: 'Admin', passwordHash: adminPass, role: Role.ADMIN },
    create: { email: 'admin@local.com', name: 'Admin', passwordHash: adminPass, role: Role.ADMIN }
  });

  const helper = await prisma.user.upsert({
    where: { email: 'helper@local.com' },
    update: { name: 'Helper', passwordHash: userPass, role: Role.HELPER },
    create: { email: 'helper@local.com', name: 'Helper', passwordHash: userPass, role: Role.HELPER }
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@local.com' },
    update: { name: 'User', passwordHash: userPass, role: Role.USER },
    create: { email: 'user@local.com', name: 'User', passwordHash: userPass, role: Role.USER }
  });

  // Ensure legacy admin without .com is also set as ADMIN
  const adminLegacy = await prisma.user.upsert({
    where: { email: 'admin@local' },
    update: { name: 'Admin', passwordHash: adminPass, role: Role.ADMIN },
    create: { email: 'admin@local', name: 'Admin', passwordHash: adminPass, role: Role.ADMIN }
  });

  const prof = await prisma.professional.create({
    data: { name: 'Dra. Ana', specialty: 'Psicologia' }
  });

  console.log({ admin, adminLegacy, helper, user, prof });
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
