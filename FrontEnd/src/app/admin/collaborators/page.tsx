"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { getUsers, createUser, deleteUser, updateUser } from '../../services/userService';
import { api } from '../../services/api';
import getUploadUrl from '../../utils/getUploadUrl';
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
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newBio, setNewBio] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState<boolean>(false);
  const [creating, setCreating] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'ADMIN') return; // client-side guard
    setLoading(true);
    getUsers().then((data) => { setItems(data); setLoading(false); }).catch(() => setLoading(false));
    // fetch pending professional requests
    setLoadingPending(true);
    api.get('/professionals/requests/pending').then((r) => { setPending(r.data || []); setLoadingPending(false); }).catch(() => setLoadingPending(false));
  }, [user]);

  if (!user) return <div style={{ padding: 24 }}>Faça login como ADMIN para acessar.</div>;
  if (user.role !== 'ADMIN') return <div style={{ padding: 24 }}>Acesso negado.</div>;

  const handleCreate = async () => {
    setError(null); setActionMsg(null); setActionError(null);
    setCreating(true);
    try {
      let avatarUrl: string | undefined = undefined;
      if (newAvatarFile) {
        const fd = new FormData();
        fd.append('file', newAvatarFile);
        const upl = await api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        avatarUrl = upl.data.url;
      }
      await createUser({ name: newName, email: newEmail, password: newPassword, role: 'HELPER', avatarUrl, specialty: newSpecialty, bio: newBio } as any);
      const refreshed = await getUsers();
      setItems(refreshed);
      setActionMsg('Colaborador criado e ativo.');
      setNewName(''); setNewEmail(''); setNewPassword('');
      setNewSpecialty(''); setNewBio(''); setNewAvatarFile(null); setAvatarPreview(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Erro ao criar');
    } finally {
      setCreating(false);
    }
  };

  const onAvatarChange = (f?: File) => {
    if (!f) { setNewAvatarFile(null); setAvatarPreview(null); return; }
    setNewAvatarFile(f);
    const url = URL.createObjectURL(f);
    setAvatarPreview(url);
  };

  const makeHelper = async (id: number) => {
    await updateUser(id, { role: 'HELPER' });
    setItems(await getUsers());
  };

  const approveRequest = async (profId: number) => {
    if (!confirm('Aprovar essa solicitação?')) return;
    setActionMsg(null); setActionError(null);
    try {
      await api.post(`/professionals/${profId}/approve`);
      setActionMsg('Solicitação aprovada.');
      // refresh lists
      setPending((await api.get('/professionals/requests/pending')).data || []);
      setItems(await getUsers());
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Erro ao aprovar');
    }
  };

  const rejectRequest = async (profId: number) => {
    if (!confirm('Rejeitar essa solicitação?')) return;
    setActionMsg(null); setActionError(null);
    try {
      await api.post(`/professionals/${profId}/reject`);
      setActionMsg('Solicitação rejeitada.');
      setPending((await api.get('/professionals/requests/pending')).data || []);
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Erro ao rejeitar');
    }
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

  {actionMsg && <div className={styles.msg + ' ' + styles.success}>{actionMsg}</div>}
  {actionError && <div className={styles.msg + ' ' + styles.error}>{actionError}</div>}

      <div className={styles.form}>
        <input placeholder="Nome" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <input placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
        <div style={{ position: 'relative' }}>
          <input placeholder="Senha" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <button type="button" aria-label={showNewPassword ? 'Esconder senha' : 'Mostrar senha'} onClick={() => setShowNewPassword(s => !s)} style={{ position: 'absolute', right: 8, top: 14, background: 'transparent', border: 'none', cursor: 'pointer' }}>
            {showNewPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7 1.63-2.54 4.1-4.55 7.02-5.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 1l22 22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </button>
        </div>
        <input placeholder="Especialidade" value={newSpecialty} onChange={(e) => setNewSpecialty(e.target.value)} />
        <input placeholder="Bio" value={newBio} onChange={(e) => setNewBio(e.target.value)} />
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <input id="avatarFile" className={styles.hiddenFileInput} type="file" accept="image/*" onChange={(e) => onAvatarChange(e.target.files?.[0])} />
          <label htmlFor="avatarFile" className={styles.uploadBtn} aria-label="Enviar avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v10" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 12l7-9 7 9" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 21H3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ marginLeft:8 }}>Adicionar foto</span>
          </label>
          {avatarPreview && <img src={getUploadUrl(avatarPreview)} alt="preview" className={styles.avatarPreview} /> }
        </div>
        <button className={styles.primary} onClick={handleCreate} disabled={creating}>{creating ? 'Criando...' : 'Adicionar como HELPER'}</button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>

      <h3>Usuários</h3>
      {loading ? <p>Carregando...</p> : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Colaborador</th>
                <th>Email</th>
                <th>Role</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className={styles.row}>
                  <td className={styles.cellId}>#{u.id}</td>
                  <td className={styles.cellName}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <img src={getUploadUrl((u as any).avatarUrl || '/default-avatar.svg')} alt={u.name || u.email} className={styles.avatarPreview} />
                      <div>
                        <div className={styles.nameText}>{u.name || '—'}</div>
                        <div className={styles.mutedText}>ID: {u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      {u.role !== 'HELPER' && (
                        <button className={`cardBtn primarySmall`} onClick={() => makeHelper(u.id)} title="Tornar colaborador">
                          {/* user-plus icon */}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 14c2.761 0 5 2.239 5 5v1H4v-1c0-2.761 2.239-5 5-5h6z" fill="#fff"/><path d="M12 12a4 4 0 100-8 4 4 0 000 8z" fill="#fff"/></svg>
                          Tornar colaborador
                        </button>
                      )}
                      <button className={`cardBtn ghost`} onClick={() => remove(u.id)} title="Remover">
                        {/* trash icon */}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 3h6l1 2h5v2H3V5h5l1-2z" fill="currentColor" opacity="0.9"/><path d="M6 7h12v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7z" fill="currentColor" opacity="0.6"/></svg>
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3>Solicitações pendentes</h3>
      {loadingPending ? <p>Carregando solicitações...</p> : (
        pending.length === 0 ? <p>Nenhuma solicitação pendente.</p> : (
          <div className={styles.pendingList}>
            {pending.map((p) => {
              // mock values for decoration
              const mockRating = (p.id % 3) + 3; // 3..5
              const priceLow = 80 + ((p.id % 5) * 20);
              const priceHigh = priceLow + 70;
              const bioText = p.bio && p.bio.trim().length > 20
                ? p.bio
                : `Profissional ${p.name || ''} com experiência em ${p.specialty || 'atendimento clínico'}. Atua com foco no acolhimento, atenção personalizada e práticas baseadas em evidências.`;

              return (
                <div key={p.id} className={styles.pendingCard}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <img src={p.avatarUrl || '/default-avatar.svg'} alt={p.name} style={{ width:72, height:72, borderRadius:10, objectFit:'cover', flexShrink:0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                        <div>
                          <div><strong>{p.user?.name || p.user?.email || p.name}</strong> <small style={{ color: '#666' }}>#{p.id}</small></div>
                          <div style={{ color: '#444', marginTop:4 }}>{p.specialty || 'Especialidade não informada'}</div>
                          {p.crp && <div style={{ color: '#444', marginTop:6, fontSize:13 }}>CRP: {p.crp}</div>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className={styles.pricePill}>R$ {priceLow} - {priceHigh}</div>
                          <div className={styles.stars} title={`${mockRating} de 5`}> 
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < mockRating ? styles.starFilled : styles.starEmpty}>★</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: 8, color: '#444', fontSize: 13 }}>{bioText}</div>
                      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                        <button className={`cardBtn ghost`} disabled={processingId === p.id} onClick={() => { setProcessingId(p.id); approveRequest(p.id).finally(() => setProcessingId(null)); }}>{processingId === p.id ? '...' : 'Aprovar'}</button>
                        <button className={`cardBtn danger`} disabled={processingId === p.id} onClick={() => { setProcessingId(p.id); rejectRequest(p.id).finally(() => setProcessingId(null)); }}>{processingId === p.id ? '...' : 'Rejeitar'}</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
