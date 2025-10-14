"use client";

import React, { useState } from 'react';
import styles from './BookingModal.module.css';
import { createAppointment, getProfessionalAppointments } from '../../services/appointmentService';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast/ToastContext';

type ProfessionalLite = { id: number; name: string; price?: number | null; shortBio?: string | null; avatar?: string | null };

function toIsoLocal(date: string, time: string) {
  const localDate = new Date(`${date}T${time}:00`);
  const tzOffsetMin = localDate.getTimezoneOffset();
  const utcMs = localDate.getTime() - tzOffsetMin * 60000;
  return new Date(utcMs).toISOString();
}

export default function BookingModal({ professional, onCloseAction }: { professional: ProfessionalLite; onCloseAction: () => void }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState<'30' | '60'>('60');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const minDate = () => new Date().toISOString().slice(0, 10);

  const isPast = () => {
    if (!date || !time) return false;
    const sel = new Date(`${date}T${time}:00`);
    return sel.getTime() < Date.now();
  };

  const handleConfirm = async () => {
    setError(null);
    if (!user) {
      showToast('Você precisa estar logada para agendar.');
      return;
    }
    if (!date || !time) return setError('Selecione data e hora');
    if (isPast()) return setError('Não é possível agendar em data/hora passada');
    setLoading(true);
    try {
      const startAt = toIsoLocal(date, time);
      const durMin = duration === '60' ? 60 : 30;
      const endAt = new Date(new Date(startAt).getTime() + durMin * 60000).toISOString();

  // Se usuário for ADMIN, PROFESSIONAL ou HELPER, pré-checar agenda do profissional para evitar conflitos
  const role = user?.role;
  if (role === 'ADMIN' || role === 'PROFESSIONAL' || role === 'HELPER') {
        try {
          const existing = await getProfessionalAppointments(professional.id);
          // existing esperado: lista de appointments com startAt/endAt
          const conflict = existing.some((a: any) => {
            const aStart = new Date(a.startAt).getTime();
            const aEnd = new Date(a.endAt).getTime();
            const s = new Date(startAt).getTime();
            const e = new Date(endAt).getTime();
            return Math.max(aStart, s) < Math.min(aEnd, e); // overlap
          });
          if (conflict) {
            const msg = 'O profissional já possui um agendamento nesse horário. Escolha outro horário.';
            setError(msg);
            showToast(msg);
            setLoading(false);
            return;
          }
        } catch (err) {
          // se falhar a checagem, continua e deixa o backend validar
          console.warn('Falha ao checar disponibilidade:', err);
        }
      }

      await createAppointment({ professionalId: professional.id, startAt, endAt, notes: notes?.trim() || undefined });
  // sucesso: toast, fechar modal e redirecionar para meus agendamentos
  showToast('Agendamento criado com sucesso');
  onCloseAction();
      router.push('/appointments');
    } catch (e: any) {
      console.error(e);
      const msg = e?.response?.data?.message ?? e?.message ?? 'Erro ao criar agendamento';
      setError(msg);
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.overlay} ${styles.mcBooking ?? ''}`} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <img src={professional.avatar ?? '/images/terapeuta.png'} alt={professional.name} className={styles.avatar} />
          <div>
            <div className={styles.title}>{professional.name}</div>
            <div className={styles.details}>{professional.price ? `R$ ${professional.price.toFixed(2)}` : 'A consultar'}</div>
          </div>
        </div>

        <div className={styles.details}>{professional.shortBio}</div>

        <div className={styles.form}>
          <input className={styles.input} type="date" min={minDate()} value={date} onChange={(e) => setDate(e.target.value)} />
          <input className={styles.input} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>

        <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 14, color: '#374151' }}>Duração</label>
          <select className={styles.input} value={duration} onChange={(e) => setDuration(e.target.value as '30'|'60')}>
            <option value="60">60 minutos</option>
            <option value="30">30 minutos</option>
          </select>
          <label style={{ fontSize: 14, color: '#374151' }}>Observações</label>
          <input className={styles.input} placeholder="Notas (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {error && <div style={{ color: '#b91c1c', marginTop: 8 }}>{error}</div>}

        <div className={styles.actions}>
          <button className={styles.btnPrimary} disabled={loading} onClick={handleConfirm}>
            {loading ? 'Agendando...' : 'Confirmar'}
          </button>
          <button className={styles.btnSecondary} onClick={onCloseAction}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
