const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function inferGenderFromName(name) {
  if (!name) return 'unknown';
  const first = name.split(' ')[0].toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  if (first.endsWith('a')) return 'female';
  if (first.endsWith('o') || first.endsWith('e') || first.endsWith('u')) return 'male';
  return 'unknown';
}

function seedFromName(name) {
  // deterministic hash to make seed consistent across runs
  let h = 0;
  const s = (name || '').toLowerCase();
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 10000; // seed value
}

function buildUnsplashUrl(gender, name) {
  const seed = seedFromName(name);
  if (gender === 'female') return `https://source.unsplash.com/seed/${seed}/200x200/?woman,portrait`;
  if (gender === 'male') return `https://source.unsplash.com/seed/${seed}/200x200/?man,portrait`;
  return `https://source.unsplash.com/seed/${seed}/200x200/?portrait,person`;
}

(async () => {
  try {
    const pros = await prisma.professional.findMany({ select: { id: true, name: true, avatarUrl: true, userId: true } });
    let updatedP = 0;
    for (const p of pros) {
      const gender = inferGenderFromName(p.name);
      const url = buildUnsplashUrl(gender, p.name);
      if (p.avatarUrl !== url) {
        await prisma.professional.update({ where: { id: p.id }, data: { avatarUrl: url } });
        updatedP++;
        if (p.userId) {
          await prisma.user.update({ where: { id: p.userId }, data: { avatarUrl: url } }).catch(() => {});
        }
      }
    }

    const helpers = await prisma.user.findMany({ where: { role: 'HELPER' }, select: { id: true, name: true, avatarUrl: true } });
    let updatedU = 0;
    for (const u of helpers) {
      const gender = inferGenderFromName(u.name);
      const url = buildUnsplashUrl(gender, u.name);
      if (u.avatarUrl !== url) {
        await prisma.user.update({ where: { id: u.id }, data: { avatarUrl: url } });
        updatedU++;
      }
    }

    console.log(`Updated professionals: ${updatedP}, Updated helper users: ${updatedU}`);
  } catch (e) {
    console.error('Error', e);
  } finally {
    await prisma.$disconnect();
  }
})();
