"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useRouter } from 'next/navigation';
import styles from '../AdminPanelButton/AdminPanelButton.module.css';

export default function AgendaButton() {
  const { user } = useAuth();
  const router = useRouter();
  const [profId, setProfId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    // only for helpers
    if ((user.role ?? '').toString().trim().toUpperCase() !== 'HELPER') return;
    let mounted = true;
    setLoading(true);
    // try professionals first (preferred source of truth)
    api.get('/professionals')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.items ?? res.data?.data ?? []);
        const mine = list.find((p: any) => Number(p.userId) === Number(user.id));
        if (mounted && mine) setProfId(Number(mine.id ?? mine.professionalId ?? mine.professional_id));
        // if not found, fallback to users/helpers
        if (mounted && !mine) {
          return api.get('/users/helpers');
        }
        return null;
      })
      .then((maybe) => {
        if (!maybe || !mounted) return;
        const res = maybe as any;
        const list = Array.isArray(res.data) ? res.data : (res.data?.items ?? res.data?.data ?? []);
        const mine = list.find((p: any) => Number(p.userId) === Number(user.id));
        if (mounted && mine) setProfId(Number(mine.id ?? mine.professionalId ?? mine.professional_id));
      })
      .catch((e) => { console.warn('AgendaButton: falha ao buscar profissionais/helpers', e); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [user]);

  if (!user) return null;
  if ((user.role ?? '').toString().trim().toUpperCase() !== 'HELPER') return null;

  return (
    <div>
      <button
        className={styles.fab}
        onClick={() => {
          if (profId) router.push(`/collaborator/${profId}`);
          else router.push('/professionals');
        }}
        aria-label="Abrir agenda do colaborador"
        title="Minha agenda"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M7 2v2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zM5 10h14v6H5v-6z" />
        </svg>
      </button>
    </div>
  );
}
