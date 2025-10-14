import { api } from '../services/api';
import type { Professional } from '../components/Professionals/types';

export type { Professional };

export async function getProfessionals(): Promise<Professional[]> {
  const res = await api.get('/professionals'); // ajuste a rota se no back for diferente
  // Normaliza: pode vir array direto ou {items: [...]}
  const data = res.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return []; // evita quebrar
}
