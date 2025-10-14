"use client";

import React from 'react';
import Agenda from '../components/Agenda/Agenda';
import { useAuth } from '../context/AuthContext';
import styles from './appointments.module.css';
import { useRouter } from 'next/navigation';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return <div style={{ padding: 24 }}>Você precisa estar logado para ver seus agendamentos.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.backButtonContainer}>
        <button aria-label="Voltar" className={styles.backButton} onClick={() => router.back()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>Meus Agendamentos</h1>
        <Agenda userId={String(user.id)} />
      </div>
    </div>
  );
}
