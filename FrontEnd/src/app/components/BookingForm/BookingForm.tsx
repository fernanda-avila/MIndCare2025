import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './bookingForm.module.css';
import { useAuth } from '../../context/AuthContext';
import { createAppointment } from '../../services/appointmentService';
import { api } from '../../services/api';
import { getProfessionals } from '../../services/professionalService';
import { swalInfo, swalSuccess, swalError } from '../../utils/swal';
import ContactModal from '../ContactModal/ContactModal';
import { localDateTimeToIso, addMinutesToIso } from '../../utils/datetime';

type Professional = { id: number | string; name: string; avatarUrl?: string; photo?: string; specialty?: string; experience?: string; rating?: number };

const BookingForm: React.FC = () => {
  const { user, token } = useAuth();

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [errorList, setErrorList] = useState<string | null>(null);

  // filtros e busca locais (UI)
  const [selectedSpecialty, setSelectedSpecialty] = useState('Todos');
  const [selectedApproach, setSelectedApproach] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [specialties, setSpecialties] = useState<string[]>(['Todos']);

  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState<'30' | '60'>('60');
  const [notes, setNotes] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // 🔒 evita dupla execução do efeito em dev
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    (async () => {
      setLoadingList(true);
      setErrorList(null);
      try {
        const raw = await getProfessionals();
        const map = new Map<number | string, Professional>();
        for (const p of raw) {
          const key = (p as any).id ?? (p as any).name;
          if (!map.has(key)) map.set(key, p as Professional);
        }
        const profs = Array.from(map.values());
        setProfessionals(profs);

        // popular lista de especialidades dinamicamente a partir dos profissionais
        try {
          const uniq = Array.from(new Set(profs.map((x) => (x.specialty || '').trim()).filter(Boolean)));
          if (uniq.length > 0) setSpecialties(['Todos', ...uniq]);
        } catch (err) {
          // ignore
        }
      } catch (e) {
        setErrorList('Falha ao carregar profissionais.');
        setProfessionals([]);
      } finally {
        setLoadingList(false);
      }
    })();
  }, []);

  const handleSelectProfessional = (professional: Professional) => {
    setSelectedProfessional(professional);
    setShowModal(true);
  };

  const approaches = ['Todos', 'TCC', 'Humanista', 'Psicanálise', 'Gestalt', 'EMDR', 'Mindfulness'];

  const filteredProfessionals = professionals.filter((pro) => {
    const name = (pro.name || '').toLowerCase();
    const specialty = ((pro as any).specialty || '').toLowerCase();
    const approach = ((pro as any).approach || '').toLowerCase();

    const matchesSpecialty = selectedSpecialty === 'Todos' || specialty.includes(selectedSpecialty.toLowerCase());
    const matchesApproach = selectedApproach === 'Todos' || approach.includes(selectedApproach.toLowerCase());
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || specialty.includes(searchTerm.toLowerCase()) || ((pro as any).expertise || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSpecialty && matchesApproach && matchesSearch;
  });

  function buildAvatar(professional: Professional) {
    const name = professional?.name || 'Profissional';
    const avatar = (professional as any).avatarUrl || professional.photo;
    if (avatar) return avatar;
    // Infer gender from name (simple heuristic: names ending with 'a' treated as female)
    // and pick a deterministic portrait from randomuser.me
    const idStr = String((professional as any).id ?? name);
    let sum = 0;
    for (let i = 0; i < idStr.length; i++) sum += idStr.charCodeAt(i);
    const idx = (sum % 99) + 1; // randomuser has portraits 1..99
    const lastChar = name.trim().slice(-1).toLowerCase();
    const gender = lastChar === 'a' ? 'women' : 'men';
    return `https://randomuser.me/api/portraits/${gender}/${idx}.jpg`;
  }

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProfessional(null);
    setDate('');
    setTime('');
    setDuration('60');
    setNotes('');
  };

  const endTimeIso = useMemo(() => {
    if (!date || !time) return '';
    const start = localDateTimeToIso(date, time);
    const minutes = duration === '60' ? 60 : 30;
    return addMinutesToIso(start, minutes);
  }, [date, time, duration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      await swalInfo('Você precisa estar logada para agendar.');
      return;
    }
    if (!selectedProfessional || !date || !time) {
      await swalInfo('Selecione um profissional, data e hora.');
      return;
    }

    try {
  const startAt = localDateTimeToIso(date, time);
  const endAt = endTimeIso || startAt; // fallback: mesma hora

      const payload = {
        professionalId: Number(selectedProfessional.id),
        startAt,
        endAt,
        notes: notes?.trim() || undefined,
      };
      console.log('Agendamento payload:', payload);
      await createAppointment(payload);

      await swalSuccess('Consulta agendada com sucesso!');
      handleCloseModal();
    } catch (err) {
      console.error(err);
      await swalError('Erro ao agendar consulta.');
    }
  };

  return (
    <section className={styles.formContainer}>
      <h2 className={styles.header}>Agendar Consulta</h2>
      {/* descrição removida conforme solicitado */}

      {/* feedback de listagem */}
      {loadingList && <p>Carregando profissionais...</p>}
      {errorList && <p className={styles.headerDescription} style={{ color: '#e11d48' }}>{errorList}</p>}

      {/* Filtros e Busca */}
      <div className={styles.filters}>
        <div>
          <input
            className={styles.filterInput}
            placeholder="Buscar por nome, especialidade ou expertise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar profissionais"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 700 }}>Especialidade</label>
          <select className={styles.filterInput} value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)}>
            {specialties.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 700 }}>Abordagem</label>
          <select className={styles.filterInput} value={selectedApproach} onChange={(e) => setSelectedApproach(e.target.value)}>
            {approaches.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Psicólogos e Psicólogas */}
      <div className={styles.professionalList}>
        {Array.isArray(filteredProfessionals) && filteredProfessionals.length > 0 ? (
          filteredProfessionals.map((professional) => {
            const avatarSrc = buildAvatar(professional);
            const mockRating = (Number(professional.id) % 3) + 3; // 3..5
            const priceLow = 80 + ((Number(professional.id) % 5) * 20);
            const priceHigh = priceLow + 70;
            const bioText = professional && professional.rating == null
              ? (professional as any).bio || `Profissional ${professional.name} com ampla experiência em ${professional.specialty || 'atendimento clínico'}. Atendimento acolhedor e focado em resultados.`
              : (professional as any).bio || '';

            return (
              <div
                key={professional.id}
                className={styles.card}
                onClick={() => handleSelectProfessional(professional)}
              >
                <img
                  src={avatarSrc}
                  alt={professional.name}
                  className={styles.photo}
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    // prevent infinite loop
                    el.onerror = null;
                    el.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.name)}&background=8b5cf6&color=fff&rounded=true&size=128`;
                  }}
                />
                <div className={styles.cardInfo}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ marginRight: 12 }}>{professional.name}</h3>
                    <div style={{ textAlign: 'right' }}>
                      <div className={styles.priceRow}>
                        <small className={styles.priceLabel}>a partir de</small>
                        <div className={styles.pricePill}>R$ {priceLow}</div>
                      </div>
                      <div className={styles.stars} aria-hidden>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < mockRating ? styles.starFilled : styles.starEmpty}>★</span>
                        ))}
                        <span className={styles.ratingNumber}>{mockRating}.0</span>
                      </div>
                    </div>
                  </div>
                  {professional.specialty && <p className={styles.specialty}>{professional.specialty}</p>}
                  <p className={styles.bioText}>{bioText}</p>
                </div>
              </div>
            );
          })
        ) : (
          !loadingList && <p>Nenhum profissional disponível com os filtros selecionados.</p>
        )}
      </div>

      {/* CTA — contato se não encontrou */}
        <div style={{ marginTop: 28, background: '#f3f4f6', padding: 20, borderRadius: 12 }}>
        <h3 style={{ margin: 0, color: '#111827' }}>Não encontrou o profissional ideal?</h3>
        <p style={{ margin: '8px 0 12px', color: '#374151' }}>Nossa equipe pode ajudar a encontrar o especialista perfeito para suas necessidades.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className={styles.btnPrimary} onClick={() => { setContactOpen(true) }}>Falar com Nossa Equipe</button>
          <button className={styles.btnSecondary} onClick={() => { window.location.href = '/faq' }}>Tirar Dúvidas</button>
        </div>
      </div>

      {/* Contact modal (CTA) */}
      <ContactModal isOpen={contactOpen} onCloseAction={() => setContactOpen(false)} />

      {/* Modal para agendamento */}
      {showModal && selectedProfessional && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Agendar consulta com {selectedProfessional.name}</h3>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Data:</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
              <div>
                <label>Hora:</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
              <div>
                <label>Duração:</label>
                <select
                  className={styles.input}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value as '30' | '60')}
                >
                  <option value="30">30 minutos</option>
                  <option value="60">60 minutos</option>
                </select>
              </div>
              <div>
                <label>Observações (opcional):</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={styles.input}
                  placeholder="Preferências, objetivos, etc."
                />
              </div>
              <button type="submit" className={styles.button}>Confirmar Agendamento</button>
            </form>
            <button onClick={handleCloseModal} className={styles.closeButton}>Fechar</button>
          </div>
        </div>
      )}
    </section>
  );
}

export default BookingForm;
// removida: agora usamos util de datetime (localDateTimeToIso)

