const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Curated stable Unsplash image URLs (direct images). These are real-photo links from Unsplash
// Note: you might want to credit photographers; check Unsplash license if used in production.
const FEMALE_URLS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
  'https://images.unsplash.com/photo-1545996124-1bbf9e4d8f83',
  'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c',
  'https://images.unsplash.com/photo-1524504388940-9a1f0a1f3c4b'
];

const MALE_URLS = [
  'https://images.unsplash.com/photo-1544005313-3ddc1a27f6b6',
  'https://images.unsplash.com/photo-1546967191-fdfb13ed6b1b',
  'https://images.unsplash.com/photo-1554151228-14d9def656e4',
  'https://images.unsplash.com/photo-1531123414780-f8f5e0e5d0bb',
  'https://images.unsplash.com/photo-1545996124-2e6a2a4f4c63'
];

const NEUTRAL_URLS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
  'https://images.unsplash.com/photo-1524504388940-8e7a3c0b6b2b'
];

function inferGenderFromName(name) {
  if (!name) return 'neutral';
  const first = name.split(' ')[0].toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  if (first.endsWith('a')) return 'female';
  if (first.endsWith('o') || first.endsWith('e') || first.endsWith('u')) return 'male';
  return 'neutral';
}

function pickUrl(list, name) {
  // deterministic pick by hashing name
  const s = (name || '').toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return list[h % list.length] + '?w=200&h=200&fit=crop';
}

(async () => {
  try {
    const pros = await prisma.professional.findMany({ select: { id: true, name: true, avatarUrl: true, userId: true } });
    let updatedP = 0;
    for (const p of pros) {
      const gender = inferGenderFromName(p.name);
      let url;
      if (gender === 'female') url = pickUrl(FEMALE_URLS, p.name);
      else if (gender === 'male') url = pickUrl(MALE_URLS, p.name);
      else url = pickUrl(NEUTRAL_URLS, p.name);

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
      let url;
      if (gender === 'female') url = pickUrl(FEMALE_URLS, u.name);
      else if (gender === 'male') url = pickUrl(MALE_URLS, u.name);
      else url = pickUrl(NEUTRAL_URLS, u.name);

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
