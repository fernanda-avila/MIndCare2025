"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import styles from './collaboratorSchedule.module.css';
import { getProfessionalAppointments } from '../../services/appointmentService';
import { getProfessional, updateProfessional } from '../../services/professionalService';
import getUploadUrl from '../../utils/getUploadUrl';
import AppointmentNotesModal from './AppointmentNotesModal';
import AppointmentDetailModal from './AppointmentDetailModal';
import { swalError, swalSuccess } from '../../utils/swal';
import NotesFloatingPanel from './NotesFloatingPanel';

export default function CollaboratorScheduleClient({ professionalId }: any) {
  const router = useRouter();
  const { user } = useAuth();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [professional, setProfessional] = useState<any>(null);
  const [generalNotes, setGeneralNotes] = useState('');
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStart, setFilterStart] = useState<string | null>(null);
  const [filterEnd, setFilterEnd] = useState<string | null>(null);

  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailAppointment, setDetailAppointment] = useState<any | null>(null);
  const [highlightId, setHighlightId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    getProfessionalAppointments(Number(professionalId))
      .then((res: any) => {
        const list = Array.isArray(res) ? res : (res?.items ?? res?.data ?? []);
        if (mounted) setAppointments(list);
      })
      .catch((e: any) => {
        console.error(e);
        if (mounted) setError('Falha ao carregar atendimentos');
      })
      .finally(() => { if (mounted) setLoading(false); });

    // carregar dados do profissional (para notas gerais)
    getProfessional(Number(professionalId))
      .then((p: any) => {
        if (mounted) {
          setProfessional(p);
          setGeneralNotes(p?.bio ?? '');
        }
      })
      .catch((e: any) => { console.warn('Falha ao carregar profissional', e); });

    return () => { mounted = false; };
  }, [professionalId]);

  // escutar eventos de criação de agendamento para atualização otimista
  useEffect(() => {
    const handler = (e: any) => {
      const appt = e?.detail;
      if (!appt) return;
      if (Number(appt.professionalId) !== Number(professionalId)) return;
      setAppointments((prev) => {
        // inserir ordenado por startAt
        const next = [...prev, appt].sort((a,b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
        return next;
      });
      setHighlightId(Number(appt.id));
      setTimeout(() => setHighlightId(null), 3000);
    };
    window.addEventListener('appointment:created', handler as EventListener);
    return () => window.removeEventListener('appointment:created', handler as EventListener);
  }, [professionalId]);

  const canEdit = user?.role === 'ADMIN' || (professional && Number(professional.userId) === Number(user?.id));
  const [liveAvailable, setLiveAvailable] = useState(false);
  const [presence, setPresence] = useState<'offline'|'online'|'ocupado'|'emchamada'>('offline');
  const [presenceMenuOpen, setPresenceMenuOpen] = useState(false);

  const today = useMemo(() => new Date().toISOString().slice(0,10), []);

  const filteredAppointments = useMemo(() => {
    const q = (searchQuery || '').toString().toLowerCase().trim();
    return appointments.filter(a => {
      // filter by search (patient name / clientName)
      const name = (a.user?.name ?? a.clientName ?? a.client?.name ?? '').toString().toLowerCase();
      if (q && !name.includes(q)) return false;

      // filter by date range if provided
      if (filterStart || filterEnd) {
        const d = a.startAt ? new Date(a.startAt) : null;
        if (!d) return false;
        if (filterStart) {
          const s = new Date(filterStart + 'T00:00:00');
          if (d < s) return false;
        }
        if (filterEnd) {
          const e = new Date(filterEnd + 'T23:59:59');
          if (d > e) return false;
        }
      }

      return true;
    });
  }, [appointments, searchQuery, filterStart, filterEnd]);

  const todays = filteredAppointments.filter(a => {
    const s = a.startAt ? new Date(a.startAt).toISOString().slice(0,10) : null;
    return s === today;
  });

  const upcoming7 = useMemo(() => {
    const now = new Date();
    const soon = new Date();
    soon.setDate(now.getDate() + 7);
    return filteredAppointments.filter(a => {
      if (!a.startAt) return false;
      const d = new Date(a.startAt);
      return d >= now && d <= soon;
    }).length;
  }, [filteredAppointments]);

  function formatTime(iso?: string) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function exportCSV() {
    const rows = filteredAppointments.map(a => ({
      id: a.id,
      date: a.startAt ? new Date(a.startAt).toLocaleDateString() : '',
      time: formatTime(a.startAt),
      patient: a.user?.name ?? a.clientName ?? a.client?.name ?? '',
      status: a.status ?? '',
      notes: (a.notes || '').replace(/\r?\n/g, ' ')
    }));

    const header = ['id','date','time','patient','status','notes'];
    const csv = [header.join(',')].concat(rows.map(r => header.map(h => `"${String((r as any)[h] ?? '').replace(/"/g,'""')}"`).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = `agenda_${professionalId}_${today}.csv`;
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.page}>
      {/* diagnóstico rápido */}
      <div style={{ marginTop: 8 }}>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ color:'#475569', fontSize:13 }}>Linked professional.userId: <strong style={{ marginLeft:6 }}>{professional?.userId ?? '—'}</strong></div>
          <div style={{ color:'#475569', fontSize:13 }}>You (user.id): <strong style={{ marginLeft:6 }}>{user?.id ?? '—'}</strong></div>
          <button className={styles.ghost} onClick={async () => {
            setLoading(true);
            try {
              const res = await getProfessionalAppointments(Number(professionalId));
              const list = Array.isArray(res) ? res : (res?.items ?? res?.data ?? []);
              setAppointments(list);
              await swalSuccess('Atualizado', 'Agenda recarregada');
            } catch (e: any) {
              console.error(e);
              await swalError('Erro', e?.response?.data?.message ?? e?.message ?? 'Falha ao recarregar');
            } finally { setLoading(false); }
          }}>Atualizar agenda</button>
        </div>
      </div>
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <button className={styles.backButton} onClick={() => router.back()} aria-label="Voltar" title="Voltar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div>
            <div className={styles.title}>Agenda do Colaborador</div>
            {user && (
              <div className={styles.subtitle}>
                Você: {user.email} ({String(user.role)})
              </div>
            )}
          </div>
        </div>

        <div className={styles.actionsRow}>
          <div style={{ position:'relative' }}>
            <button
              className={
                presence === 'online' ? styles.presenceOnline : presence === 'ocupado' ? styles.presenceBusy : styles.presenceOffline
              }
              onClick={() => {
                // toggle menu
                setPresenceMenuOpen(v => !v);
              }}
              title="Status de disponibilidade"
            >
                <span className={
                  presence === 'online' ? styles.presenceDotOnline : presence === 'ocupado' ? styles.presenceDotBusy : presence === 'emchamada' ? styles.presenceDotInCall : styles.presenceDotOffline
                } aria-hidden="true" />
                <span style={{ fontWeight:700, marginRight:8, marginLeft:8 }}>{presence === 'online' ? 'Online' : presence === 'ocupado' ? 'Ocupado' : presence === 'emchamada' ? 'Em chamada' : 'Ficar online'}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke={presence === 'online' ? '#ffffff' : '#111827'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {presenceMenuOpen && (
              <div style={{ position:'absolute', right:0, marginTop:8, zIndex:160 }}>
                <div className={styles.presenceMenu}>
                  <button className={styles.presenceItem} onClick={async () => { setPresence('online'); setPresenceMenuOpen(false); await swalSuccess('Online', 'Você está disponível para atuar.'); }}>Online</button>
                  <button className={styles.presenceItem} onClick={async () => { setPresence('ocupado'); setPresenceMenuOpen(false); await swalSuccess('Ocupado', 'Você está marcado como ocupado.'); }}>Ocupado</button>
                  <button className={styles.presenceItem} onClick={async () => { setPresence('emchamada'); setPresenceMenuOpen(false); await swalSuccess('Em chamada', 'Você está em chamada agora.'); }}>Em chamada</button>
                  <button className={styles.presenceItem} onClick={async () => { setPresence('offline'); setPresenceMenuOpen(false); await swalSuccess('Offline', 'Você saiu do modo disponível.'); }}>Offline</button>
                </div>
              </div>
            )}
          </div>
          {(user?.role ?? '').toString().trim().toUpperCase() === 'HELPER' && (
            <button
              className={styles.ghost}
              aria-label="Ir para notas"
              onClick={() => {
                const el = document.getElementById('general-notes-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 6 }}>
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="#374151" strokeWidth="1.2" fill="none" />
                <path d="M16 2v4M8 2v4" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M7 11h10M7 15h6" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Notas / Agenda
            </button>
          )}
          {user?.role === 'ADMIN' && <button className={styles.ghost} onClick={() => { router.push('/admin'); }}>Painel Admin</button>}
        </div>
      </div>

      {/* notas agora gerenciadas pelo painel flutuante */}

      <div className={styles.controlsRow}>
        <input className={styles.searchInput} placeholder="Buscar por paciente..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <input className={styles.dateInput} type="date" value={filterStart ?? ''} onChange={(e) => setFilterStart(e.target.value || null)} />
          <span style={{ color:'#94a3b8' }}>—</span>
          <input className={styles.dateInput} type="date" value={filterEnd ?? ''} onChange={(e) => setFilterEnd(e.target.value || null)} />
        </div>
        <button className={styles.ghost} onClick={() => { setSearchQuery(''); setFilterStart(null); setFilterEnd(null); }}>Limpar</button>
        <button className={styles.primary} onClick={exportCSV}>Exportar CSV</button>
      </div>

      <div className={styles.summary}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Total de atendimentos</div>
          <div className={styles.cardValue}>{filteredAppointments.length}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Consultas do dia</div>
          <div className={styles.cardValue}>{todays.length}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Próximos 7 dias</div>
          <div className={styles.cardValue}>{upcoming7}</div>
        </div>
      </div>

      <section className={styles.todaySection}>
        <h2>Consultas do dia</h2>
        {loading ? <p>Carregando...</p> : todays.length === 0 ? <p>Nenhuma consulta para hoje.</p> : (
          <ul className={styles.list}>
            {todays.map((a) => (
              <li key={a.id} className={styles.item}>
                <div className={styles.left}>
                  <div className={styles.avatarWrap}>
                    <img src={getUploadUrl(a.user?.avatarUrl ?? '/default-avatar.svg')} alt={a.user?.name} className={styles.avatar} />
                  </div>
                  <div>
                    <div className={styles.time}>{formatTime(a.startAt)}</div>
                    <div className={styles.patient}>{a.user?.name ?? a.clientName ?? a.client?.name ?? 'Paciente'}</div>
                    <div className={styles.notesPreview}>{(a.notes || '').slice(0,120)}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <button className={styles.liveBtn} onClick={() => router.push(`/live/session/${a.id}`)} title="Atuar ao vivo">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 3v18l15-9L5 3z" fill="white"/></svg>
                  </button>
                  <button className={styles.ghost} onClick={() => { setActiveAppointment(a); setNotesModalOpen(true); }} title="Abrir anotações">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7a2 2 0 012-2h10l4 4v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 11h8M8 15h5" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button className={styles.secondary} onClick={() => { setDetailAppointment(a); setDetailOpen(true); }}>Detalhes</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.allSection}>
        <h2>Todos os atendimentos</h2>
        {loading ? <p>Carregando...</p> : filteredAppointments.length === 0 ? <p>Nenhum atendimento encontrado.</p> : (
          <table className={styles.table}>
            <thead>
              <tr><th>Data</th><th>Hora</th><th>Paciente</th><th>Status</th><th style={{textAlign:'right'}}>Ações</th></tr>
            </thead>
            <tbody>
              {filteredAppointments.map((a) => (
                <tr key={a.id}>
                  <td>{a.startAt ? new Date(a.startAt).toLocaleDateString() : '—'}</td>
                  <td>{formatTime(a.startAt)}</td>
                  <td>{a.user?.name ?? a.clientName ?? '—'}</td>
                  <td>{(a.status || '').toString()}</td>
                  <td style={{textAlign:'right'}}>
                    <button className={styles.liveSmall} onClick={() => router.push(`/live/session/${a.id}`)}>Atuar</button>
                    <button className={styles.ghost} onClick={() => { setActiveAppointment(a); setNotesModalOpen(true); }}>Anotações</button>
                    <button className={styles.ghost} onClick={() => { setDetailAppointment(a); setDetailOpen(true); }}>Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <AppointmentNotesModal open={notesModalOpen} appointment={activeAppointment} canEdit={canEdit} onClose={(saved?: boolean, notes?: string) => {
        setNotesModalOpen(false);
        if (saved && activeAppointment) {
          setAppointments((prev) => prev.map(p => p.id === activeAppointment.id ? { ...p, notes } : p));
        }
        setActiveAppointment(null);
      }} />

      <NotesFloatingPanel
        generalNotes={generalNotes}
        setGeneralNotes={setGeneralNotes}
        appointments={appointments}
        setAppointments={setAppointments}
        professionalId={professionalId}
        canEdit={canEdit}
      />

      {/* Appointment detail modal */}
      {detailAppointment && (
        // lazy import modal component
        <React.Suspense fallback={null}>
          {/* @ts-ignore */}
          <AppointmentDetailModal open={detailOpen} appointment={detailAppointment} onClose={() => { setDetailOpen(false); setDetailAppointment(null); }} onOpenNotes={(appt:any) => { setDetailOpen(false); setDetailAppointment(null); setActiveAppointment(appt); setNotesModalOpen(true); }} />
        </React.Suspense>
      )}

    </div>
  );
}
