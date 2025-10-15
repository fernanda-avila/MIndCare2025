"use client";

import React, { useState } from 'react';
import styles from './collaboratorSchedule.module.css';
import { updateAppointment } from '../../services/appointmentService';
import { updateProfessional } from '../../services/professionalService';
import { swalError, swalSuccess, swalConfirm } from '../../utils/swal';

export default function NotesFloatingPanel({
  generalNotes,
  setGeneralNotes,
  appointments,
  setAppointments,
  professionalId,
  canEdit,
}: any) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editingText, setEditingText] = useState('');

  const count = () => {
    let c = 0;
    if (generalNotes && generalNotes.trim()) c += 1;
    c += (appointments || []).filter((a: any) => (a.notes || '').trim()).length;
    return c;
  };

  const [lastCount, setLastCount] = useState<number>(count());
  const [pulse, setPulse] = useState(false);

  React.useEffect(() => {
    const c = count();
    if (c !== lastCount) {
      setPulse(true);
      setLastCount(c);
      setTimeout(() => setPulse(false), 500);
    }
  }, [generalNotes, appointments]);

  async function handleCreate() {
    if (!newNote.trim()) return;
    setCreating(true);
    try {
      // Append new note to general notes and save
      const appended = generalNotes ? `${generalNotes}\n\n${newNote.trim()}` : newNote.trim();
      await updateProfessional(Number(professionalId), { bio: appended });
      setGeneralNotes(appended);
      setNewNote('');
      setOpen(true);
      await swalSuccess('Salvo', 'Nota adicionada.');
    } catch (err: any) {
      console.error(err);
      await swalError('Erro', err?.response?.data?.message ?? err?.message ?? 'Erro ao salvar nota');
    } finally { setCreating(false); }
  }

  function notesList() {
    const list: any[] = [];
    // first item: general notes (one block)
    if (generalNotes) list.push({ id: 'general', title: 'Notas gerais', text: generalNotes });
    // then appointment notes
    (appointments || []).forEach((a: any) => {
      const text = a.notes || '';
      list.push({ id: a.id, title: `Consulta — ${a.user?.name ?? a.clientName ?? 'Paciente'}`, text, appointment: a });
    });
    return list;
  }

  async function saveEdited() {
    if (editingId == null) return;
    try {
      if (editingId === 'general') {
        await updateProfessional(Number(professionalId), { bio: editingText });
        setGeneralNotes(editingText);
        await swalSuccess('Salvo', 'Notas gerais atualizadas.');
      } else {
        // appointment note
        await updateAppointment(Number(editingId), { notes: editingText });
        setAppointments((prev: any[]) => prev.map(p => p.id === editingId ? { ...p, notes: editingText } : p));
        await swalSuccess('Salvo', 'Anotação da consulta atualizada.');
      }
    } catch (err: any) {
      console.error(err);
      await swalError('Erro', err?.response?.data?.message ?? err?.message ?? 'Erro ao salvar');
    } finally {
      setEditingId(null);
      setEditingText('');
    }
  }

  return (
    <>
      <button className={styles.notesFab} aria-label="Notas" title="Notas" onClick={() => setOpen(v => !v)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16v12H7l-3 3V4z" fill="white"/></svg>
        {count() > 0 && <span className={`${styles.notesFabBadge} ${pulse ? styles.notesFabBadgePulse : ''}`}>{count()}</span>}
      </button>

      {open && (
        <div className={styles.notesPanel} role="dialog" aria-label="Painel de notas">
          <div className={styles.notesPanelHeader}>
            <div style={{ fontWeight:700, fontSize:16 }}>Notas</div>
            <div style={{ display:'flex', gap:8 }}>
              <button className={styles.ghost} onClick={() => { setOpen(false); }}>Fechar</button>
            </div>
          </div>

          <div style={{ padding:12 }}>
            <div style={{ marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ color:'#374151' }}>Criar nova nota</div>
              <button className={styles.primary} onClick={() => { setCreating(s => !s); }}>{creating ? 'Cancelar' : 'Nova'}</button>
            </div>

            {creating && (
              <div className={styles.newNoteArea}>
                <textarea className={styles.modalTextarea} value={newNote} onChange={(e) => setNewNote(e.target.value)} />
                <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
                  <button className={styles.ghost} onClick={() => { setNewNote(''); setCreating(false); }}>Cancelar</button>
                  <button className={styles.primary} disabled={creating} onClick={handleCreate}>Salvar</button>
                </div>
              </div>
            )}

            <div className={styles.notesList}>
              {notesList().map((n) => (
                <div key={String(n.id)} className={styles.noteItem}>
                  <div style={{ display:'flex', justifyContent:'space-between', gap:8 }}>
                    <div style={{ fontWeight:600 }}>{n.title}</div>
                    <div style={{ color:'#6b7280', fontSize:12 }}>{n.appointment ? (new Date(n.appointment.startAt).toLocaleString()) : ''}</div>
                  </div>
                  {editingId === n.id ? (
                    <div>
                      <textarea className={styles.modalTextarea} value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                      <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
                        <button className={styles.ghost} onClick={() => { setEditingId(null); setEditingText(''); }}>Cancelar</button>
                        <button className={styles.primary} onClick={saveEdited}>Salvar</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className={styles.noteContent} style={{ whiteSpace:'pre-wrap', color:'#475569', marginTop:8 }}>{n.text || '—'}</div>
                      <div className={styles.noteActions} style={{ marginTop:10, display:'flex', gap:8 }}>
                        <button className={styles.ghost} onClick={() => { setEditingId(n.id); setEditingText(n.text || ''); }}>Editar</button>
                        {canEdit && (
                          <button className={styles.ghost} onClick={async () => {
                            const res = await swalConfirm({ title: 'Deletar', text: 'Deseja remover esta nota?' });
                            if (!res || !res.isConfirmed) return;
                            try {
                              if (n.id === 'general') {
                                await updateProfessional(Number(professionalId), { bio: '' });
                                setGeneralNotes('');
                                await swalSuccess('Removido', 'Notas gerais removidas.');
                              } else {
                                await updateAppointment(Number(n.id), { notes: '' });
                                setAppointments((prev:any[]) => prev.map(p => p.id === n.id ? { ...p, notes: '' } : p));
                                await swalSuccess('Removido', 'Nota da consulta removida.');
                              }
                            } catch (err:any) {
                              console.error(err);
                              await swalError('Erro', err?.response?.data?.message ?? err?.message ?? 'Erro ao remover');
                            }
                          }}>Deletar</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
