const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const defaultUrl = process.env.DEFAULT_AVATAR_URL || 'https://i.pravatar.cc/300?u=default';
  console.log('Default avatar URL:', defaultUrl);

  const profs = await prisma.professional.findMany();
  console.log(`Found ${profs.length} professionals`);

  let updated = 0;
  for (const p of profs) {
    let need = false;
    if (!p.avatarUrl) need = true;
    else {
      try {
        const res = await fetch(p.avatarUrl, { method: 'HEAD' });
        if (!res.ok) need = true;
      } catch (e) {
        need = true;
      }
    }

    if (need) {
      await prisma.professional.update({ where: { id: p.id }, data: { avatarUrl: defaultUrl } });
      console.log(`Updated professional ${p.id} (${p.name}) -> ${defaultUrl}`);
      updated++;
    }
  }

  console.log(`Done. Updated ${updated} professionals.`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
