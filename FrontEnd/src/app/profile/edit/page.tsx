"use client"
import React, { useEffect, useState, useRef } from 'react';
import { api } from '../../services/api';
import getUploadUrl from '../../utils/getUploadUrl';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './edit.module.css';

export default function ProfileEditPage() {
  const { user: authUser, updateUser } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [professional, setProfessional] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [active, setActive] = useState<boolean>(true);
  const initialStateRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function openFilePicker() { fileInputRef.current?.click(); }
  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setAvatarFile(files[0]);
  }
  function handleDrop(e: React.DragEvent) { e.preventDefault(); handleFiles(e.dataTransfer.files); }
  function handleDragOver(e: React.DragEvent) { e.preventDefault(); }

  useEffect(() => {
    let mounted = true;
    Promise.all([api.get('/auth/me'), api.get('/users/helpers')])
      .then(([uRes, pRes]) => {
        if (!mounted) return;
        const u = uRes.data;
        setUser(u);
        setName(u.name ?? '');
  const pros = Array.isArray(pRes.data) ? pRes.data : (pRes.data?.items ?? []);
        const mine = pros.find((p: any) => p.userId === u.id);
        if (mine) {
          setProfessional(mine);
          setSpecialty(mine.specialty ?? '');
          setBio(mine.bio ?? '');
          setActive(typeof mine.active === 'boolean' ? mine.active : true);
          setAvatarPreview(getUploadUrl(mine.avatarUrl ?? null));
        } else {
          setAvatarPreview(null);
        }
        initialStateRef.current = {
          name: u.name ?? '',
          specialty: mine?.specialty ?? '',
          bio: mine?.bio ?? '',
          avatarUrl: mine?.avatarUrl ?? null,
          active: typeof mine?.active === 'boolean' ? mine.active : true
        };
      })
      .catch(console.error)
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false };
  }, []);

  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
  let avatarUrl = initialStateRef.current?.avatarUrl ?? null;

      if (avatarFile) {
        if (!avatarFile.type.startsWith('image/')) throw new Error('Apenas imagens são permitidas');
        const maxMB = 2;
        if (avatarFile.size > maxMB * 1024 * 1024) throw new Error(`Imagem muito grande (máx ${maxMB}MB)`);

        const fd = new FormData();
        fd.append('file', avatarFile);

        const up = await api.post('/uploads', fd, {
          onUploadProgress: (ev: any) => {
            if (ev.total) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
          },
        });

        avatarUrl = up.data?.url ?? up.data;
        setUploadProgress(null);
      }

      const userPatch = { name, ...(avatarUrl ? { avatarUrl } : {}) };
      const userRes = await api.patch(`/users/me`, userPatch);

      const updatedUser = userRes?.data ?? null;
      if (updatedUser) updateUser(updatedUser);
      setUser(updatedUser ?? { ...user, ...userPatch });

      if (professional) {
        await api.patch(`/professionals/${professional.id}`, {
          specialty, bio, active, ...(avatarUrl ? { avatarUrl } : {})
        });
      }

      setMessage('Perfil atualizado com sucesso');
      router.back();
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Falha ao salvar perfil');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (!initialStateRef.current) return;
    const s = initialStateRef.current;
    setName(s.name);
    setSpecialty(s.specialty);
    setBio(s.bio);
    setActive(s.active);
    setAvatarFile(null);
  setAvatarPreview(getUploadUrl(s.avatarUrl));
    setMessage(null);
    setErrorMessage(null);
  }

  if (loading) return <div className={styles.container}>Carregando...</div>;
  if (!user) return <div className={styles.container}>Você precisa estar logado para editar o perfil.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.avatarCol}>
          <div className={styles.avatarWrap} onDrop={handleDrop} onDragOver={handleDragOver}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
              style={{ display: 'none' }}
            />
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className={styles.avatar} onClick={openFilePicker} />
            ) : (
              <div className={styles.avatarPlaceholder} onClick={openFilePicker}>
                {user?.name ? user.name.split(' ').map(n => n[0]).join('') : '+'}
              </div>
            )}
            <div className={styles.avatarOverlay}>
              <button type="button" className={styles.changePhotoBtn} onClick={openFilePicker}>Alterar foto</button>
              <button type="button" className={styles.cancelBtn} onClick={() => {
                setAvatarFile(null);
                setAvatarPreview(initialStateRef.current?.avatarUrl ?? null);
              }}>Cancelar</button>
            </div>
          </div>
          <div className={styles.smallNote}>Seu avatar será publicado publicamente</div>
        </div>

        <form onSubmit={handleSave} className={styles.form}>
          <label className={styles.label}>Nome</label>
          <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />

          <label className={styles.label}>Email</label>
          <input className={styles.input} value={user.email} disabled />

          {professional && (
            <>
              <label className={styles.label}>Especialidade</label>
              <input className={styles.input} value={specialty} onChange={(e) => setSpecialty(e.target.value)} />

              <label className={styles.label}>Bio</label>
              <textarea className={styles.textarea} value={bio} onChange={(e) => setBio(e.target.value)} />

              <label className={styles.labelRow}>
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Ativo
              </label>
            </>
          )}

          {uploadProgress !== null && (
            <div className={styles.progress}><div className={styles.progressBar} style={{ width: `${uploadProgress}%` }} /></div>
          )}

          {message && <div className={styles.message}>{message}</div>}
          {errorMessage && <div className={styles.error}>{errorMessage}</div>}

          <div className={styles.actions}>
            <button className={styles.buttonPrimary} type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
            <button type="button" className={styles.buttonSecondary} onClick={handleCancel}>
              Reverter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
