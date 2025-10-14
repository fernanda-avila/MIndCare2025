"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { getUsers, createUser, deleteUser, updateUser } from '../../services/userService';
import styles from './adminCollaborators.module.css';

type User = { id: number; name?: string; email: string; role: string };

export default function AdminCollaborators() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'ADMIN') return; // client-side guard
    setLoading(true);
    getUsers().then((data) => { setItems(data); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  if (!user) return <div style={{ padding: 24 }}>Faça login como ADMIN para acessar.</div>;
  if (user.role !== 'ADMIN') return <div style={{ padding: 24 }}>Acesso negado.</div>;

  const handleCreate = async () => {
    setError(null);
    try {
      await createUser({ name: newName, email: newEmail, password: newPassword, role: 'HELPER' });
      const refreshed = await getUsers();
      setItems(refreshed);
      setNewName(''); setNewEmail(''); setNewPassword('');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Erro ao criar');
    }
  };

  const makeHelper = async (id: number) => {
    await updateUser(id, { role: 'HELPER' });
    setItems(await getUsers());
  };

  const remove = async (id: number) => {
    if (!confirm('Remover usuário?')) return;
    await deleteUser(id);
    setItems(await getUsers());
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className={styles.backButton} onClick={() => router.back()} aria-label="Voltar" title="Voltar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1>Gerenciar Colaboradores</h1>
        </div>
      </div>

      <div className={styles.form}>
        <input placeholder="Nome" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <input placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
        <input placeholder="Senha" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <button className={styles.primary} onClick={handleCreate}>Adicionar como HELPER</button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>

      <h3>Usuários</h3>
      {loading ? <p>Carregando...</p> : (
        <table className={styles.table}>
          <thead><tr><th>ID</th><th>Nome</th><th>Email</th><th>Role</th><th>Ações</th></tr></thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}><td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td className={styles.actions}>
                {u.role !== 'HELPER' && <button onClick={() => makeHelper(u.id)}>Tornar colaborador</button>}
                <button className="danger" onClick={() => remove(u.id)} style={{ marginLeft: 8 }}>Remover</button>
              </td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
