"use client";

import React from 'react';
import styles from './ProfessionalsList.module.css';
import BookingModal from '../BookingModal/BookingModal';
import type { Professional } from './types';

export default function ProfessionalProfileModal({ professional, onClose, onRequestBook } : { professional: Professional; onClose: () => void; onRequestBook: (p: Professional) => void; }) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal} style={{ maxWidth: 760 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <img src={getUploadUrl((professional as any).avatarUrl ?? '/default-avatar.svg')} alt={professional.name} className={styles.avatar} style={{ width: 120, height: 120, borderRadius: 16 }} />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0 }}>{professional.name}</h2>
            <div style={{ color: '#475569', marginTop: 6 }}>{professional.specialty ?? 'Especialidade não informada'}</div>
            <div style={{ marginTop: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className={styles.price}>{professional.price ? `R$ ${professional.price.toFixed(2)}` : 'A consultar'}</div>
              <div className={styles.rating}>{professional.rating ? professional.rating.toFixed(1) : '—'}</div>
              <div style={{ color: '#6b7280' }}>{professional.location ?? 'Local não informado'}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, color: '#374151' }}>{professional.shortBio ?? 'Profissional dedicado a oferecer atendimento acolhedor e centrado no paciente.'}</div>

        <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className={styles.btnSecondary} onClick={onClose}>Fechar</button>
          <button className={styles.btnPrimary} onClick={() => onRequestBook(professional)}>Agendar</button>
        </div>
      </div>
    </div>
  );
}
