import { api } from '../services/api';

export type Professional = {
  id: number;
  userId?: number;
  name: string;
  specialty?: string | null;
  bio?: string | null;
  shortBio?: string | null;
  price?: number | null;
  rating?: number | null;
  location?: string | null;
  active?: boolean;
  createdAt?: string | Date;
  avatarUrl?: string | null;
};

// Fetch professionals but only include those whose linked user is a HELPER
export async function getProfessionals(): Promise<Professional[]> {
  // fetch both lists in parallel
  const [prosRes, helpersRes] = await Promise.all([
    api.get('/professionals'),
    api.get('/users/helpers'),
  ]);

  const prosData = prosRes.data;
  const helpersData = helpersRes.data;

  const pros: any[] = Array.isArray(prosData)
    ? prosData
    : Array.isArray(prosData?.items)
    ? prosData.items
    : Array.isArray(prosData?.data)
    ? prosData.data
    : [];
  const helpers: any[] = Array.isArray(helpersData)
    ? helpersData
    : Array.isArray(helpersData?.items)
    ? helpersData.items
    : Array.isArray(helpersData?.data)
    ? helpersData.data
    : [];

  // Build a map of helper users by id to enrich professionals
  const helperById = new Map<number, any>();
  for (const h of helpers) {
    helperById.set(Number(h.id), h);
  }

  const out: Professional[] = [];
  for (const p of pros) {
    const userId = Number(p.userId ?? p.user_id ?? p.userId ?? 0);
    const helper = helperById.get(userId);
    if (!helper) continue; // only helpers

    // compute avatar: prefer helper.user avatar, then professional record, otherwise pick a curated local fallback
    let avatar = helper.avatarUrl ?? p.avatarUrl ?? p.photo ?? undefined;
    if (!avatar) {
      // curated local uploads (picked from existing BackEnd/public/uploads)
      const femaleImgs = [
        '1759973747120-w1aek0.jpg', '1759973750378-t0mz59.jpg', '1759973751288-024cqi.jpg', '1759973751497-3yvj0c.jpg', '1759973751695-whvq8t.jpg', '1759973751906-5oc4g7.jpg', '1759973752123-ydivyy.jpg'
      ];
      const maleImgs = [
        '1759973752270-wdv6fb.jpg', '1759973752498-0x7j5q.jpg', '1759973961552-cngrwu.jpg', '1759973964204-guhoyh.jpg', '1759973965343-qlhrws.jpg', '1759974305190-t1ikgo.jpg', '1759974485931-xz9mdw.jpg'
      ];
      const name = String(helper.name || p.name || '');
      const lastChar = name.trim().slice(-1).toLowerCase();
      const isFemale = lastChar === 'a';
      const pool = isFemale ? femaleImgs : maleImgs;
      const seed = String(userId || name || '').split('').reduce((s, ch) => s + ch.charCodeAt(0), 0);
      const pick = pool[seed % pool.length];
      avatar = `/uploads/${pick}`;
    }

    const prof: Professional = {
      id: Number(p.id ?? p.professionalId ?? p.id),
      userId: userId || undefined,
      name: helper.name || p.name || `${helper.firstName || ''} ${helper.lastName || ''}`.trim() || 'Profissional',
      specialty: p.specialty ?? p.speciality ?? undefined,
      bio: p.bio ?? null,
      shortBio: p.shortBio ?? null,
      price: p.price ?? null,
      rating: p.rating ?? null,
      location: p.location ?? null,
      active: p.active ?? true,
      createdAt: p.createdAt ?? p.created_at ?? undefined,
      // Prefer the user's avatarUrl (uploaded) over professional record
      avatarUrl: avatar,
    };

    out.push(prof);
  }

  return out;
}

export async function getProfessional(id: number) {
  const res = await api.get(`/professionals/${id}`);
  return res.data;
}

export async function updateProfessional(id: number, data: { bio?: string; name?: string; specialty?: string; avatarUrl?: string; active?: boolean }) {
  const res = await api.patch(`/professionals/${id}`, data);
  return res.data;
}
