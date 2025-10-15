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

  // Remove the simple legacy prof creation and replace with a richer helpers seed

  const helpersSeed = [
    {
      email: 'isabela.ribeiro@local.com',
      name: 'Isabela Ribeiro',
      password: 'isabela123',
      professional: {
        name: 'Isabela Ribeiro',
        specialty: 'Psicologia Clínica',
        bio: 'Psicóloga clínica especializada em transtornos de ansiedade, com abordagem cognitivo-comportamental e foco em intervenções práticas para melhorar qualidade de vida.',
        avatarUrl: '/uploads/isabela-ribeiro.jpg'
      }
    },
    {
      email: 'felipe.martins@local.com',
      name: 'Felipe Martins',
      password: 'felipe123',
      professional: {
        name: 'Felipe Martins',
        specialty: 'Terapia de Casal',
        bio: 'Terapeuta de casal com 8 anos de experiência ajudando casais a reconstruir comunicação e confiança, utilizando técnicas integrativas e sistêmicas.',
        avatarUrl: '/uploads/felipe-martins.jpg'
      }
    },
    {
      email: 'larissa.costa@local.com',
      name: 'Larissa Costa',
      password: 'larissa123',
      professional: {
        name: 'Larissa Costa',
        specialty: 'Psicologia Infantil',
        bio: 'Especialista em psicologia infantil e parentalidade, trabalha com avaliação do desenvolvimento e intervenções terapêuticas para crianças e suas famílias.',
        avatarUrl: '/uploads/larissa-costa.jpg'
      }
    },
    {
      email: 'bruno.almeida@local.com',
      name: 'Bruno Almeida',
      password: 'bruno123',
      professional: {
        name: 'Bruno Almeida',
        specialty: 'Psiquiatria',
        bio: 'Psiquiatra com prática clínica em transtornos do humor e comorbidades, atento à integração entre farmacoterapia e psicoterapia.',
        avatarUrl: '/uploads/bruno-almeida.jpg'
      }
    },
    {
      email: 'marina.duarte@local.com',
      name: 'Marina Duarte',
      password: 'marina123',
      professional: {
        name: 'Marina Duarte',
        specialty: 'Psicologia do Trabalho',
        bio: 'Psicóloga organizacional com foco em saúde mental no trabalho, burnout e desenvolvimento de equipes resilientes.',
        avatarUrl: '/uploads/marina-duarte.jpg'
      }
    },
    {
      email: 'sofia.moreira@local.com',
      name: 'Sofia Moreira',
      password: 'sofia123',
      professional: {
        name: 'Sofia Moreira',
        specialty: 'Neuropsicologia',
        bio: 'Neuropsicóloga que atua com avaliação neuropsicológica e reabilitação cognitiva para adultos e idosos.',
        avatarUrl: '/uploads/sofia-moreira.jpg'
      }
    },
    {
      email: 'gabriel.souza@local.com',
      name: 'Gabriel Souza',
      password: 'gabriel123',
      professional: {
        name: 'Gabriel Souza',
        specialty: 'TCC',
        bio: 'Psicoterapeuta em terapia cognitivo-comportamental, com experiência em tratamento de fobias, insônia e controle de estresse.',
        avatarUrl: '/uploads/gabriel-souza.jpg'
      }
    }
  ];
  // NOTE: this seed uses avatarUrl values provided explicitly in helpersSeed (local files under /uploads)
  for (const h of helpersSeed) {
    const passHash = await bcrypt.hash(h.password, 10);
  // choose avatar: prefer provided (local path), else undefined
  let chosenAvatar = h.professional?.avatarUrl || null;
  // if seed uses relative path (e.g. /uploads/...), prefix with server URL so frontend can load it
  const base = process.env.SERVER_URL || process.env.API_URL || 'http://localhost:3001';
  if (chosenAvatar && chosenAvatar.startsWith('/')) {
    chosenAvatar = base.replace(/\/$/, '') + chosenAvatar;
  }

    const userUp = await prisma.user.upsert({
      where: { email: h.email },
      update: { name: h.name, passwordHash: passHash, role: Role.HELPER, avatarUrl: chosenAvatar },
      create: { email: h.email, name: h.name, passwordHash: passHash, role: Role.HELPER, avatarUrl: chosenAvatar }
    });

    await prisma.professional.upsert({
      where: { userId: userUp.id },
      update: {
        name: h.professional.name,
        specialty: h.professional.specialty,
        bio: h.professional.bio,
        avatarUrl: chosenAvatar,
        userId: userUp.id,
        active: true,
        registrationStatus: 'APPROVED'
      },
      create: {
        name: h.professional.name,
        specialty: h.professional.specialty,
        bio: h.professional.bio,
        avatarUrl: chosenAvatar,
        user: { connect: { id: userUp.id } },
        active: true,
        registrationStatus: 'APPROVED'
      }
    });
  }

  console.log({ admin, adminLegacy, helper, user });
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
