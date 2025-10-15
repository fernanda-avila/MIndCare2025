const { PrismaClient } = require('@prisma/client');
const fetch = global.fetch;

const prisma = new PrismaClient();

function inferGenderFromName(name) {
  if (!name) return 'unknown';
  const first = name.split(' ')[0].toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  if (first.endsWith('a')) return 'female';
  if (first.endsWith('o') || first.endsWith('e') || first.endsWith('u')) return 'male';
  return 'unknown';
}

function nameToIndex(name) {
  const s = (name || '').toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 100; // randomuser has 0-99
}

function buildRandomUserUrl(gender, index) {
  if (gender === 'female') return `https://randomuser.me/api/portraits/women/${index}.jpg`;
  if (gender === 'male') return `https://randomuser.me/api/portraits/men/${index}.jpg`;
  // unknown: pick a mixed source
  return `https://i.pravatar.cc/150?u=${encodeURIComponent('user-' + index)}`;
}

async function existsUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch (e) {
    return false;
  }
}

(async () => {
  try {
    const pros = await prisma.professional.findMany({ select: { id: true, name: true, avatarUrl: true, userId: true } });
    const helpers = await prisma.user.findMany({ where: { role: 'HELPER' }, select: { id: true, name: true, avatarUrl: true } });

    let updatedP = 0;
    for (const p of pros) {
      const gender = inferGenderFromName(p.name);
      const idx = nameToIndex(p.name);
      let url = buildRandomUserUrl(gender, idx);

      if (!(await existsUrl(url))) {
        // fallback to other gender or pravatar
        if (gender === 'male') {
          const alt = buildRandomUserUrl('female', idx);
          if (await existsUrl(alt)) url = alt;
          else url = `https://i.pravatar.cc/150?u=${encodeURIComponent(p.name)}`;
        } else if (gender === 'female') {
          const alt = buildRandomUserUrl('male', idx);
          if (await existsUrl(alt)) url = alt;
          else url = `https://i.pravatar.cc/150?u=${encodeURIComponent(p.name)}`;
        } else {
          url = `https://i.pravatar.cc/150?u=${encodeURIComponent(p.name)}`;
        }
      }

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
      const gender = inferGenderFromName(u.name);
      const idx = nameToIndex(u.name);
      let url = buildRandomUserUrl(gender, idx);

      if (!(await existsUrl(url))) {
        if (gender === 'male') {
          const alt = buildRandomUserUrl('female', idx);
          if (await existsUrl(alt)) url = alt;
          else url = `https://i.pravatar.cc/150?u=${encodeURIComponent(u.name)}`;
        } else if (gender === 'female') {
          const alt = buildRandomUserUrl('male', idx);
          if (await existsUrl(alt)) url = alt;
          else url = `https://i.pravatar.cc/150?u=${encodeURIComponent(u.name)}`;
        } else {
          url = `https://i.pravatar.cc/150?u=${encodeURIComponent(u.name)}`;
        }
      }

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
