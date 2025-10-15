import { api } from './api';

export type UserPayload = { name: string; email: string; password: string; role?: string; avatarUrl?: string; specialty?: string; bio?: string; crp?: string };

export async function getUsers() {
  const res = await api.get('/users');
  return res.data;
}

export async function createUser(payload: UserPayload) {
  const res = await api.post('/users', payload);
  return res.data;
}

export async function updateUser(id: number, payload: Partial<UserPayload>) {
  const res = await api.patch(`/users/${id}`, payload);
  return res.data;
}

export async function deleteUser(id: number) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}
