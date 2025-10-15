const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');
const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3001';

function listUploadFiles() {
  try {
    return fs.readdirSync(UPLOADS_DIR).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
  } catch (e) {
    console.error('Erro lendo uploads dir', e);
    return [];
  }
}

function buildUrl(filename) {
  return `${BASE_URL.replace(/\/$/, '')}/uploads/${filename}`;
}

function findBestMatchForName(files, name) {
  if (!name) return null;
  const lower = name.toLowerCase();
  const parts = lower.split(/\s+/).filter(Boolean);
  // try exact contains on any part
  for (const p of parts) {
    const found = files.find(f => f.toLowerCase().includes(p));
    if (found) return found;
  }
  // try first letter
  const first = parts[0];
  if (first) {
    const found = files.find(f => f.toLowerCase().startsWith(first));
    if (found) return found;
  }
  return null;
}

(async () => {
  const prisma = new PrismaClient();
  const files = listUploadFiles();
  console.log('Found upload files:', files.length);

  try {
    const pros = await prisma.professional.findMany({ select: { id: true, name: true, avatarUrl: true, userId: true } });
    let updatedP = 0;
    for (const p of pros) {
      const best = findBestMatchForName(files, p.name);
      if (best) {
        const url = buildUrl(best);
        if (p.avatarUrl !== url) {
          await prisma.professional.update({ where: { id: p.id }, data: { avatarUrl: url } });
          updatedP++;
          // propagate to user if linked
          if (p.userId) {
            await prisma.user.update({ where: { id: p.userId }, data: { avatarUrl: url } }).catch(() => {});
          }
        }
      }
    }

    const helpers = await prisma.user.findMany({ where: { role: 'HELPER' }, select: { id: true, name: true, avatarUrl: true } });
    let updatedU = 0;
    for (const u of helpers) {
      const best = findBestMatchForName(files, u.name);
      if (best) {
        const url = buildUrl(best);
        if (u.avatarUrl !== url) {
          await prisma.user.update({ where: { id: u.id }, data: { avatarUrl: url } });
          updatedU++;
        }
      }
    }

    console.log(`Updated professionals: ${updatedP}, Updated helper users: ${updatedU}`);
  } catch (e) {
    console.error('Erro ao atualizar avatars', e);
  } finally {
    await prisma.$disconnect();
  }
})();
