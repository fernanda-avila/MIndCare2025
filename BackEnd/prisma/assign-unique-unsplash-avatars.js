const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Larger curated pool of stable Unsplash image URLs (direct image links)
const POOL = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
  'https://images.unsplash.com/photo-1545996124-1bbf9e4d8f83',
  'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c',
  'https://images.unsplash.com/photo-1524504388940-9a1f0a1f3c4b',
  'https://images.unsplash.com/photo-1544005313-3ddc1a27f6b6',
  'https://images.unsplash.com/photo-1546967191-fdfb13ed6b1b',
  'https://images.unsplash.com/photo-1554151228-14d9def656e4',
  'https://images.unsplash.com/photo-1531123414780-f8f5e0e5d0bb',
  'https://images.unsplash.com/photo-1545996124-2e6a2a4f4c63',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
  'https://images.unsplash.com/photo-1524504388940-8e7a3c0b6b2b',
  'https://images.unsplash.com/photo-1545996124-2e6a2a4f4c63',
  'https://images.unsplash.com/photo-1545996124-1bbf9e4d8f83',
  'https://images.unsplash.com/photo-1545996124-2e6a2a4f4c63',
  'https://images.unsplash.com/photo-1544005313-3ddc1a27f6b6',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
  'https://images.unsplash.com/photo-1545996124-1bbf9e4d8f83',
  'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c',
  'https://images.unsplash.com/photo-1554151228-14d9def656e4',
  'https://images.unsplash.com/photo-1524504388940-8e7a3c0b6b2b',
  'https://images.unsplash.com/photo-1524504388940-9a1f0a1f3c4b',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1'
];

function pickIndexByName(name) {
  let h = 0;
  const s = (name || '').toLowerCase();
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % POOL.length;
}

(async () => {
  try {
    const pros = await prisma.professional.findMany({ select: { id: true, name: true, avatarUrl: true, userId: true } });
    const helpers = await prisma.user.findMany({ where: { role: 'HELPER' }, select: { id: true, name: true, avatarUrl: true } });

    // build current assignment map (url -> assigned)
    const assigned = new Map();
    for (const p of pros) if (p.avatarUrl) assigned.set(p.avatarUrl.split('?')[0], true);
    for (const h of helpers) if (h.avatarUrl) assigned.set(h.avatarUrl.split('?')[0], true);

    const available = POOL.slice();

    // function to get next available unique url starting from index
    function getUniqueUrl(name) {
      let idx = pickIndexByName(name);
      for (let i = 0; i < available.length; i++) {
        const realIdx = (idx + i) % available.length;
        const base = available[realIdx];
        if (!assigned.has(base)) {
          assigned.set(base, true);
          return base + '?w=200&h=200&fit=crop';
        }
      }
      // all taken — fallback by adding seeded query param to create uniqueness
      const fallback = available[idx];
      return fallback + `?w=200&h=200&fit=crop&u=${encodeURIComponent(name)}`;
    }

    let updatedP = 0;
    for (const p of pros) {
      const url = getUniqueUrl(p.name);
      if (p.avatarUrl !== url) {
        await prisma.professional.update({ where: { id: p.id }, data: { avatarUrl: url } });
        updatedP++;
        if (p.userId) {
          await prisma.user.update({ where: { id: p.userId }, data: { avatarUrl: url } }).catch(() => {});
        }
      }
    }

    let updatedU = 0;
    for (const u of helpers) {
      const url = getUniqueUrl(u.name);
      if (u.avatarUrl !== url) {
        await prisma.user.update({ where: { id: u.id }, data: { avatarUrl: url } });
        updatedU++;
      }
    }

    console.log(`Assigned unique images. Professionals updated: ${updatedP}, Helpers updated: ${updatedU}`);
  } catch (e) {
    console.error('Error assigning unique images', e);
  } finally {
    await prisma.$disconnect();
  }
})();
