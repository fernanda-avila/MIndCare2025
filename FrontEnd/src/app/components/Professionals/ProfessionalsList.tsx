"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import BookingModal from '../BookingModal/BookingModal';
import ProfessionalProfileModal from './ProfessionalProfileModal';
import { useAuth } from '../../context/AuthContext';
import styles from './ProfessionalsList.module.css';
import type { Professional } from './types';
import { api } from '../../services/api';



const ProfessionalsList: React.FC = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const { user } = useAuth();
  const apiBase = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL ?? '') : '';

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get('/professionals')
      .then((res) => {
        const data = res.data;
        // normalize response shapes
        const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
        // preencher dados fictícios para apresentação quando ausentes
        const enhanced = list.map((p: any, idx: number) => {
          const seeded = Number(p.id ?? idx);
          const price = p.price ?? (80 + (seeded % 5) * 30 + (seeded % 3) * 5); // 80..260
          const rating = p.rating ?? (3.5 + (seeded % 15) * 0.1); // 3.5..5.0
          const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre', 'Recife', 'Salvador'];
          const location = p.location ?? cities[seeded % cities.length];
          const shortBio = p.shortBio ?? (p.bio ? p.bio.slice(0, 120) : `${p.name} oferece atendimento acolhedor com foco no bem-estar emocional.`);
          return { ...p, price, rating: Math.min(5, Math.round(rating * 10) / 10), location, shortBio };
        });
        if (mounted) setProfessionals(enhanced);
      })
      .catch((err) => { console.error(err); if (mounted) setError('Não foi possível carregar colaboradores'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false };
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeProfessional, setActiveProfessional] = useState<Professional | null>(null);

  return (
    <section className={styles.container} aria-labelledby="professionals-heading">
      <div className={styles.header}>
        <h2 id="professionals-heading">Conheça nossos profissionais parceiros</h2>
        <p className={styles.sub}>Profissionais selecionados com cuidado para oferecer atendimento acolhedor e qualificado.</p>
      </div>

      <div className={styles.debugInfo}>
        <small>Usuário atual: {user ? `${user.email ?? user.name ?? 'sem email'} (${user.role})` : 'não logado'}</small>
        <div className={styles.debugLink}>
          <a href={`${apiBase.replace(/\/$/, '')}/professionals`} target="_blank" rel="noreferrer">Abrir endpoint de professionals (debug)</a>
        </div>
        {user?.role !== 'ADMIN' && (
          <div className={styles.hint}>Dica: faça login como <strong>admin@local.com</strong> para ver o botão de sincronização.</div>
        )}
      </div>

      {loading ? (
        <div className={styles.loader}>Carregando colaboradores...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <>
          {/* admin sync control */}
          {user?.role === 'ADMIN' && (
            <div className={styles.adminActions}>
              <button
                className={styles.buttonPrimary}
                disabled={syncing}
                onClick={async () => {
                  setSyncing(true);
                  setSyncResult(null);
                  try {
                    const res = await api.post('/users/sync-helpers-to-pros');
                    setSyncResult(`Sincronizados: ${res.data.created} profissionais. Pulados: ${res.data.skipped}`);
                    // reload list after sync
                    setLoading(true);
                    const r = await api.get('/users/helpers');
                    const list = Array.isArray(r.data) ? r.data : Array.isArray(r.data?.items) ? r.data.items : [];
                    setProfessionals(list);
                  } catch (e) {
                    console.error(e);
                    setSyncResult('Falha ao sincronizar');
                  } finally {
                    setSyncing(false);
                    setLoading(false);
                  }
                }}
              >
                {syncing ? 'Sincronizando...' : 'Sincronizar helpers → professionals'}
              </button>
              {syncResult && <div className={styles.syncResult}>{syncResult}</div>}
            </div>
          )}

          {professionals.length === 0 ? (
            <div className={styles.empty}>Nenhum profissional disponível no momento.</div>
          ) : (
            <div className={styles.grid}>
              {professionals.map((p) => (
                <article key={p.id} className={styles.card}>
                  <div className={styles.cardInner}>
                    <img src={'/images/terapeuta.png'} alt={p.name} className={styles.avatar} />
                    <div className={styles.info}>
                      <div className={styles.titleRow}>
                        <h3 className={styles.name}>{p.name}</h3>
                        <div className={styles.role} aria-label={`Função Profissional`}>Profissional</div>
                      </div>
                      <p className={styles.specialty}>{p.specialty ?? (p.userId ? 'Profissional (sem especialidade)' : 'Sem especialidade')}</p>

                      <p className={styles.shortBio}>{p.shortBio ?? p.bio ?? 'Profissional dedicado a cuidados humanos e acolhedores.'}</p>

                      <div className={styles.meta}>
                        <div>
                          <span className={styles.price}>{p.price ? `R$ ${p.price.toFixed(2)}` : 'A consultar'}</span>
                          <div className={styles.experience}>10+ anos de experiência</div>
                        </div>
                        <div className={styles.separator}>|</div>
                        <div>
                          <div className={styles.rating} aria-hidden>{p.rating ? p.rating.toFixed(1) : '—'}</div>
                          <div className={styles.languages}>PT, EN</div>
                        </div>
                        <div className={styles.separator}>|</div>
                        <div className={styles.location}>{p.location ?? 'Local não informado'}</div>
                      </div>

                      <div className={styles.actions}>
                        <button
                          className={styles.buttonPrimary}
                          onClick={() => { setActiveProfessional(p); setModalOpen(true); }}
                        >
                          Agendar
                        </button>
                        <button className={styles.buttonSecondary} onClick={() => { setActiveProfessional(p); setProfileOpen(true); }}>
                          Ver Perfil
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
          {modalOpen && activeProfessional && (
            <BookingModal
              professional={{ id: activeProfessional.id, name: activeProfessional.name, price: activeProfessional.price, shortBio: activeProfessional.shortBio, avatar: activeProfessional.avatarUrl ?? undefined }}
              onCloseAction={() => { setModalOpen(false); setActiveProfessional(null); }}
            />
          )}
          {profileOpen && activeProfessional && (
            <ProfessionalProfileModal
              professional={activeProfessional}
              onClose={() => { setProfileOpen(false); setActiveProfessional(null); }}
              onRequestBook={(p) => { setProfileOpen(false); setActiveProfessional(p); setModalOpen(true); }}
            />
          )}
        </>
      )}
    </section>
  );
};

export default ProfessionalsList;
