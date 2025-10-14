import { api } from './api';

export type CreateAppointmentInput = {
  professionalId: number;
  startAt: string; // ISO ex.: '2025-10-08T14:00:00.000Z'
  endAt: string;   // ISO
  notes?: string;
};

export async function createAppointment(data: CreateAppointmentInput) {
  // Token já é injetado pelo interceptor do api.ts
  const res = await api.post('/appointments', data);
  return res.data;
}

export async function getAppointments() {
  // Token já é injetado pelo interceptor do api.ts
  const res = await api.get('/appointments/me');
  return res.data;
}

export async function getProfessionalAppointments(professionalId: number) {
  // Endpoint protegido por roles (ADMIN, PROFESSIONAL)
  const res = await api.get(`/appointments/professional/${professionalId}`);
  return res.data;
}
