import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Looking for professionals with avatarUrl and linked user...');
  const pros = await prisma.professional.findMany({ where: { avatarUrl: { not: null } }, select: { id: true, userId: true, avatarUrl: true } });
  console.log(`Found ${pros.length} professionals with avatarUrl`);

  let updated = 0;
  for (const p of pros) {
    if (!p.userId) continue;
    try {
      const u = await prisma.user.findUnique({ where: { id: p.userId }, select: { id: true, avatarUrl: true } });
      if (!u) continue;
      if (u.avatarUrl !== p.avatarUrl) {
        await prisma.user.update({ where: { id: u.id }, data: { avatarUrl: p.avatarUrl } });
        updated++;
        console.log(`Updated user ${u.id} avatarUrl -> ${p.avatarUrl}`);
      }
    } catch (err) {
      console.warn('Failed to update user for professional', p.id, err);
    }
  }

  console.log(`Sync complete. Users updated: ${updated}`);
}

main()
  .catch((e) => {
    console.error('Seed sync error', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
