"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { swalConfirm, swalSuccess } from '../utils/swal';
import Link from 'next/link';
import { api } from '../services/api';
import styles from './profile.module.css';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const [professional, setProfessional] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!user) return;
    api.get('/users/helpers')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
        const mine = list.find((p: any) => p.userId === user.id);
        if (mounted) setProfessional(mine ?? null);
      })
      .catch(() => {});
    return () => { mounted = false };
  }, [user]);

  if (!user) {
    return (
      <div className={styles.container}>
        <h2>Você não está logado</h2>
        <Link href="/Login" className={styles.editButton}>Ir para Login</Link>
      </div>
    );
  }

  const initial = (user.name ?? user.email ?? 'U').charAt(0).toUpperCase();

  return (
    <div className={styles.container}>
      <div className={styles.backButtonContainer}>
        <button className={styles.backButton} onClick={() => router.back()} aria-label="Voltar" title="Voltar" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>
      <div className={styles.card}>
        <div className={styles.left}>
          {user.avatarUrl && user.avatarUrl.trim() !== "" ? (
            // mostra avatar se existir
            <img src={user.avatarUrl} alt={user.name ?? user.email} className={styles.avatar} />
          ) : (
            // placeholder com inicial
            <div className={styles.avatarPlaceholder}>
              {initial}
            </div>
          )}
        </div>
        <div className={styles.body}>
          <h1 className={styles.name}>{user.name ?? '—'}</h1>
          <p className={styles.email}>{user.email}</p>
          <p className={styles.role}><strong>Função:</strong> {user.role ?? '—'}</p>
          {professional && (
            <div className={styles.profInfo}>
              <p><strong>Especialidade:</strong> {professional.specialty ?? '—'}</p>
              {professional.bio && <p className={styles.bio}>{professional.bio}</p>}
            </div>
          )}
          <div className={styles.actions}>
            <Link href="/profile/edit" className={styles.editButton}>Editar perfil</Link>
            <button className={styles.logoutButton} onClick={async () => {
              const r = await swalConfirm({ title: 'Sair', text: 'Tem certeza que deseja sair?' });
              if (!r.isConfirmed) return;
              logout();
              await swalSuccess('Você saiu', 'Sessão encerrada com sucesso.');
            }}>Sair</button>
          </div>
        </div>
      </div>
    </div>
  );
}
