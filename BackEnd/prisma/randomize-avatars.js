const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function pickRandom(urls) {
  return urls[Math.floor(Math.random() * urls.length)];
}

async function main() {
  // generate a small pool of random avatar urls (pravatar and picsum seeds)
  const pool = [];
  for (let i = 1; i <= 20; i++) {
    pool.push(`https://i.pravatar.cc/150?img=${i}`);
    pool.push(`https://picsum.photos/seed/avatar${i}/200/200`);
  }

  console.log('Fetching helpers and professionals...');
  const helpers = await prisma.user.findMany({ where: { role: 'HELPER' }, select: { id: true, avatarUrl: true } });
  const pros = await prisma.professional.findMany({ select: { id: true, userId: true, avatarUrl: true } });

  let uUpdated = 0;
  let pUpdated = 0;

  for (const h of helpers) {
    const newUrl = pickRandom(pool);
    // update user avatarUrl
    await prisma.user.update({ where: { id: h.id }, data: { avatarUrl: newUrl } });
    uUpdated++;
  }

  for (const p of pros) {
    const newUrl = pickRandom(pool);
    await prisma.professional.update({ where: { id: p.id }, data: { avatarUrl: newUrl } });
    pUpdated++;
    // propagate to linked user if exists
    if (p.userId) {
      await prisma.user.update({ where: { id: p.userId }, data: { avatarUrl: newUrl } }).catch(() => {});
    }
  }

  console.log(`Randomize complete. Users updated: ${uUpdated}, Professionals updated: ${pUpdated}`);
}

main()
  .catch((e) => { console.error('Error', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
