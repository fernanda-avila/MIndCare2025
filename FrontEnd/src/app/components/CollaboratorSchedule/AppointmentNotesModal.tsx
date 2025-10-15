"use client";

import React, { useState } from 'react';
import styles from './collaboratorSchedule.module.css';
import { updateAppointment } from '../../services/appointmentService';
import { swalError, swalSuccess, swalConfirm } from '../../utils/swal';

export default function AppointmentNotesModal({ open, onClose, appointment, canEdit }: any) {
  const [value, setValue] = useState(appointment?.notes ?? '');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} role="dialog">
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <h3>Anotações - {appointment?.user?.name ?? appointment?.clientName ?? 'Paciente'}</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">×</button>
        </div>
        <div className={styles.modalBody}>
          <textarea className={styles.modalTextarea} value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.ghost} onClick={onClose}>Cancelar</button>
          <button className={styles.ghost} disabled={saving} onClick={async () => {
            // delete notes -> set to empty
            if (!canEdit) return await swalError('Sem permissão', 'Você não tem permissão para deletar esta anotação.');
            const res = await swalConfirm({ title: 'Deletar', text: 'Deseja remover esta anotação?' });
            if (!res || !res.isConfirmed) return;
            setSaving(true);
            try {
              await updateAppointment(appointment.id, { notes: '' });
              await swalSuccess('Removido', 'Anotação removida.');
              onClose(true, '');
            } catch (err: any) {
              console.error(err);
              await swalError('Erro', err?.response?.data?.message ?? err?.message ?? 'Erro ao remover');
            } finally { setSaving(false); }
          }}>Deletar</button>
          <button className={styles.primary} disabled={saving || !canEdit} onClick={async () => {
            setSaving(true);
            try {
              await updateAppointment(appointment.id, { notes: value });
              await swalSuccess('Salvo', 'Anotação atualizada.');
              onClose(true, value);
            } catch (err: any) {
              console.error(err);
              await swalError('Erro', err?.response?.data?.message ?? err?.message ?? 'Erro ao salvar');
            } finally { setSaving(false); }
          }}>
            {saving ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.2"/><path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            ) : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
