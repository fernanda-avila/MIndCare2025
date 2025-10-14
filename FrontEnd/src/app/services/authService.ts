import { api } from './api';

export type AuthResponse = { access_token: string };
export type RegisterPayload = { name: string; email: string; password: string };
export type MeResponse = { id: number; email: string; role: string; name?: string };

export async function register(data: RegisterPayload) {
  const payload: RegisterPayload = {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password,
  };
  const res = await api.post('/auth/register', payload);
  return res.data as { id: number; email: string; name: string; role: string };
}

export async function login(email: string, password: string) {
  const res = await api.post<AuthResponse>('/auth/login', {
    email: email.trim().toLowerCase(),
    password,
  });
  return res.data; // { access_token }
}

export async function getMe() {
  const res = await api.get<MeResponse>('/auth/me');
  return res.data;
}
