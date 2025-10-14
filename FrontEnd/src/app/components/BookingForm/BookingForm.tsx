import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './bookingForm.module.css';
import { useAuth } from '../../context/AuthContext';
import { createAppointment } from '../../services/appointmentService';
import { api } from '../../services/api';

type Professional = { id: number; name: string; photo?: string; specialty?: string; experience?: string; rating?: number };

const BookingForm: React.FC = () => {
  const { user, token } = useAuth();

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [errorList, setErrorList] = useState<string | null>(null);

  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState<'30' | '60'>('60');
  const [notes, setNotes] = useState('');
  const [showModal, setShowModal] = useState(false);

  // 🔒 evita dupla execução do efeito em dev
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    (async () => {
      setLoadingList(true);
      setErrorList(null);
      try {
        const res = await api.get('/professionals'); // 🔁 usa cliente API
        const data = res.data;

        // normaliza e deduplica (por id; se faltar id, usa name)
        const raw: Professional[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
          ? data.data
          : [];

        const map = new Map<number | string, Professional>();
        for (const p of raw) {
          const key = (p as any).id ?? (p as any).name;
          if (!map.has(key)) map.set(key, p);
        }
        setProfessionals(Array.from(map.values()));
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
    // soma a duração à data/hora inicial
    const base = new Date(`${date}T${time}:00`);
    const plus = new Date(base.getTime() + (duration === '60' ? 60 : 30) * 60000);
    // converter para ISO coerente com local
    const tzOffsetMin = plus.getTimezoneOffset();
    const utcMs = plus.getTime() - tzOffsetMin * 60000;
    return new Date(utcMs).toISOString();
  }, [date, time, duration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      alert('Você precisa estar logada para agendar.');
      return;
    }
    if (!selectedProfessional || !date || !time) {
      alert('Selecione um profissional, data e hora.');
      return;
    }

    try {
      const startAt = toIsoLocal(date, time);
      const endAt = endTimeIso || startAt; // fallback: mesma hora

      await createAppointment({
        professionalId: selectedProfessional.id,
        startAt,
        endAt,
        notes: notes?.trim() || undefined,
      });

      alert('Consulta agendada com sucesso!');
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert('Erro ao agendar consulta.');
    }
  };

  return (
    <section className={styles.formContainer}>
      <h2 className={styles.header}>Agendar Consulta</h2>
      <p className={styles.headerDescription}>
        Escolha um psicólogo ou psicóloga e agende sua consulta online com facilidade.
      </p>
      <p className={styles.headerDescription}>
        Preencha os dados e tenha um atendimento especializado.
      </p>

      {/* feedback de listagem */}
      {loadingList && <p>Carregando profissionais...</p>}
      {errorList && <p className={styles.headerDescription} style={{ color: '#e11d48' }}>{errorList}</p>}

      {/* Lista de Psicólogos e Psicólogas */}
      <div className={styles.professionalList}>
        {Array.isArray(professionals) && professionals.length > 0 ? (
          professionals.map((professional) => (
            <div
              key={professional.id}
              className={styles.card}
              onClick={() => handleSelectProfessional(professional)}
            >
              <img
                src={professional.photo || '/avatar.png'}
                alt={professional.name}
                className={styles.photo}
              />
              <div className={styles.cardInfo}>
                <h3>{professional.name}</h3>
                {professional.specialty && <p>{professional.specialty}</p>}
                {professional.experience && <p>{professional.experience}</p>}
                {typeof professional.rating === 'number' && <p>⭐ {professional.rating}</p>}
              </div>
            </div>
          ))
        ) : (
          !loadingList && <p>Nenhum profissional disponível.</p>
        )}
      </div>

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
function toIsoLocal(date: string, time: string): string {
  // Converte data e hora local para ISO string
  const localDate = new Date(`${date}T${time}:00`);
  const tzOffsetMin = localDate.getTimezoneOffset();
  const utcMs = localDate.getTime() - tzOffsetMin * 60000;
  return new Date(utcMs).toISOString();
}

