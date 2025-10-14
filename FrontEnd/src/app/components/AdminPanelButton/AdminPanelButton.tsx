"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminPanelButton.module.css';

const AdminPanelButton: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  if (!user) return null;
  if (user.role !== 'ADMIN') return null;

  return (
    <button
      aria-label="Abrir painel de controle"
      title="Painel de Controle"
      className={styles.fab}
      onClick={() => router.push('/admin/collaborators')}
    >
      {/* ícone de engrenagem (gear) - caminho mais proeminente */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
        <path d="M19.14 12.936c.036-.318.056-.639.056-.96s-.02-.642-.058-.96l2.03-1.58a.5.5 0 00.12-.64l-1.92-3.32a.5.5 0 00-.6-.22l-2.39.96a7.03 7.03 0 00-1.66-.96l-.36-2.54A.5.5 0 0013.5 2h-3a.5.5 0 00-.5.43l-.36 2.54c-.6.24-1.16.56-1.66.96l-2.39-.96a.5.5 0 00-.6.22L2.8 8.44a.5.5 0 00.12.64l2.03 1.58c-.04.318-.06.639-.06.96s.02.642.058.96L2.9 15.12a.5.5 0 00-.12.64l1.92 3.32c.14.24.44.34.7.22l2.39-.96c.5.4 1.06.72 1.66.96l.36 2.54c.05.24.26.43.5.43h3c.24 0 .45-.17.5-.43l.36-2.54c.6-.24 1.16-.56 1.66-.96l2.39.96c.26.1.56 0 .7-.22l1.92-3.32a.5.5 0 00-.12-.64l-2.03-1.58zM12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" />
      </svg>
    </button>
  );
};

export default AdminPanelButton;
