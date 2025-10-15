const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const pros = await prisma.professional.findMany({ select: { id: true, name: true, avatarUrl: true, userId: true } });
    const users = await prisma.user.findMany({ where: { role: 'HELPER' }, select: { id: true, email: true, name: true, avatarUrl: true } });
    console.log('PROFESSIONALS:', JSON.stringify(pros, null, 2));
    console.log('USERS HELPER:', JSON.stringify(users, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
