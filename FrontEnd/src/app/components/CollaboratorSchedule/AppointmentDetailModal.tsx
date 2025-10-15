"use client";

import React from 'react';
import styles from './collaboratorSchedule.module.css';
import getUploadUrl from '../../utils/getUploadUrl';
import { useRouter } from 'next/navigation';

export default function AppointmentDetailModal({ open, appointment, onClose, onOpenNotes }: any) {
  const router = useRouter();
  if (!open || !appointment) return null;

  const patient = appointment.user?.name ?? appointment.clientName ?? appointment.client?.name ?? 'Paciente';
  const prof = appointment.professional?.name ?? appointment.professionalName ?? 'Profissional';

  function formatDate(iso?: string) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString();
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard} role="dialog" aria-modal="true">
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className={styles.avatarWrap} style={{ width:56, height:56 }}>
              <img src={getUploadUrl(appointment.user?.avatarUrl ?? '/default-avatar.svg')} alt={patient} className={styles.avatar} />
            </div>
            <div>
              <div style={{ fontWeight:800 }}>{patient}</div>
              <div style={{ color:'#94a3b8' }}>{prof}</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={() => onClose()} aria-label="Fechar">×</button>
        </div>
        <div className={styles.modalBody}>
          <p><strong>Data / Hora:</strong> {formatDate(appointment.startAt)} — {appointment.endAt ? new Date(appointment.endAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}</p>
          <p><strong>Status:</strong> {appointment.status ?? '—'}</p>
          <p><strong>Anotações:</strong></p>
          <div style={{ background:'#fbfbfb', padding:12, borderRadius:8, border:'1px solid #eef3f6' }}>{appointment.notes ?? '—'}</div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.liveBtn} onClick={() => router.push(`/live/session/${appointment.id}`)}>Atuar ao vivo</button>
          <button className={styles.ghost} onClick={() => { onOpenNotes && onOpenNotes(appointment); }}>Abrir anotações</button>
          <button className={styles.btnSecondary} onClick={() => onClose()}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
