"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './UserMenu.module.css';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast/ToastContext';
import { swalConfirm, swalSuccess } from '../../utils/swal';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <div className={styles.container} onMouseLeave={() => setOpen(false)}>
      <button className={styles.avatarButton} onClick={() => setOpen((s) => !s)}>
        <span className={styles.avatar}>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
      </button>
      {open && (
        <div className={styles.dropdown} role="menu">
          <Link href="/profile" className={styles.item}>Meu Perfil</Link>
          <Link href="/appointments" className={styles.item}>Meus Agendamentos</Link>
          <Link href="/settings" className={styles.item}>Configurações</Link>
          <div className={styles.divider} />
          <button
            className={styles.item}
            onClick={async () => {
              const res = await swalConfirm({ title: 'Sair', text: 'Tem certeza que deseja sair?', confirmButtonText: 'Sair', cancelButtonText: 'Cancelar' });
              if (!res.isConfirmed) return;
              logout();
              setOpen(false);
              router.push('/');
              showToast('Você saiu da conta');
              await swalSuccess('Você saiu', 'Sessão encerrada com sucesso.');
            }}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
