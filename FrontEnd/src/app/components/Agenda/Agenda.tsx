import { useEffect, useState } from "react";
import { api } from '../../services/api';
import { swalError, swalSuccess, swalConfirm } from '../../utils/swal';

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: string;
  professional: {
    avatarUrl: any;
    name: string;
    specialty: string;
  };
}

interface AgendaProps {
  userId: string;
}

export default function Agenda({ userId }: AgendaProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<Record<string, boolean>>({});
  

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api
      .get('/appointments/me')
      .then((res) => {
        const data = res.data;
        let list: any[] = [];
        if (Array.isArray(data)) list = data;
        else if (Array.isArray(data?.items)) list = data.items;
        else if (Array.isArray(data?.data)) list = data.data;
        else if (Array.isArray(data?.appointments)) list = data.appointments;
        else list = [];

        // Map backend appointment shape to the component's Appointment interface
        const mapAppointment = (a: any): Appointment => {
          const start = a.startAt ? new Date(a.startAt) : a.startAt;
          const date = start instanceof Date && !isNaN(start.getTime()) ? start.toISOString().split('T')[0] : (a.startAt || '');
          const time = start instanceof Date && !isNaN(start.getTime()) ? start.toTimeString().slice(0,5) : (a.time || '');
          const professional = a.professional || a.professionalId ? (a.professional ?? { name: a.professionalName ?? 'Profissional', specialty: a.professionalSpecialty ?? '' }) : { name: 'Profissional', specialty: '' };
          return {
            id: String(a.id),
            date,
            time,
            status: a.status || '',
            professional,
          };
        };

        const mapped = list.map(mapAppointment);

        // Remove appointments that are already cancelled on the backend
        const filtered = mapped.filter((a) => {
          const st = (a.status || '').toLowerCase();
          return st !== 'cancelled' && st !== 'canceled';
        });

        setAppointments(filtered);
      })
      .catch((err) => {
        console.error('Failed to load appointments', err);
        setAppointments([]);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  async function handleCancel(id: string) {
    if (!id) return;
    const res = await swalConfirm({ title: 'Confirmar cancelamento', text: 'Tem certeza que deseja cancelar este agendamento?' });
    if (!res.isConfirmed) return;

    try {
      setCancelling((s) => ({ ...s, [id]: true }));
      await api.patch(`/appointments/${id}/cancel`);
      setAppointments((prev) => prev.filter((p) => p.id !== id));
      await swalSuccess('Agendamento cancelado com sucesso.');
    } catch (err) {
      console.error('Erro ao cancelar agendamento', err);
      await swalError('Falha ao cancelar. Tente novamente.');
    } finally {
      setCancelling((s) => ({ ...s, [id]: false }));
    }
  }

  return (
    <div className="agenda-wrapper">
      <h2>Minha Agenda</h2>
      {loading ? (
        <p>Carregando...</p>
      ) : appointments.length === 0 ? (
        <p>Você não possui agendamentos.</p>
      ) : (
        <div className="agenda-list">
          {appointments.map((appt) => (
            <article key={appt.id} className="agenda-item">
              <div className="left">
                <time className="date">{appt.date} <span className="time">às {appt.time}</span></time>
                        {/* Normalize status text to Portuguese and classes */}
                        {(() => {
                          const st = (appt.status || '').toLowerCase();
                          let label = appt.status;
                          let cls = st;
                          if (st === 'scheduled' || st === 'agendado') { label = 'Agendado'; cls = 'agendado'; }
                          if (st === 'cancelled' || st === 'canceled' || st === 'cancelado') { label = 'Cancelado'; cls = 'cancelled'; }
                          return <div className={`status ${cls}`}>{label}</div>
                        })()}
                {/* Cancel button */}
                {appt.status.toLowerCase() !== 'cancelled' && (
                  <div style={{marginTop:8}}>
                    <button
                      className="cancel-btn"
                      onClick={() => handleCancel(appt.id)}
                      disabled={!!cancelling[appt.id]}
                    >
                      {cancelling[appt.id] ? 'Cancelando...' : 'Cancelar'}
                    </button>
                  </div>
                )}
              </div>

              <div className="right">
                <div className="professional">
                  <div className="avatar">
                    {appt.professional?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={require('../../utils/getUploadUrl').default(appt.professional.avatarUrl)} alt={appt.professional?.name || 'Profissional'} />
                    ) : (
                      (appt.professional?.name || 'P').slice(0,1)
                    )}
                  </div>
                  <div>
                    <div className="prof-name">{appt.professional?.name || 'Profissional'}</div>
                    <div className="prof-spec">{appt.professional?.specialty || ''}</div>
                  </div>
                </div>
                <div className="notes">{(appt as any).notes || ''}</div>
              </div>
            </article>
          ))}
        </div>
      )}
      <style jsx>{`
        .agenda-wrapper { padding: 28px; background: #fff; border-radius: 14px; box-shadow: 0 6px 24px rgba(15,23,42,0.06); }
        h2 { margin:0 0 12px 0; color:#0f172a }
        .agenda-list { display:flex; flex-direction:column; gap:12px; }
        .agenda-item { display:flex; gap:18px; align-items:center; padding:14px; border-radius:10px; border:1px solid #f1f5f9; background:linear-gradient(180deg, #fff, #fbfbff); }
        .left { width:180px; flex-shrink:0 }
        .date { display:block; font-weight:700; color:#0f172a }
        .time { font-weight:600; color:#374151; margin-left:6px }
        .status { margin-top:6px; display:inline-block; padding:6px 8px; border-radius:8px; font-weight:700; font-size:0.8rem }
  .status.agendado { background:#eef2ff;color:#3730a3 }
        .status.cancelled { background:#fff1f2;color:#9f1239 }
        .right { flex:1; display:flex; flex-direction:column }
        .professional { display:flex; gap:12px; align-items:center }
  .avatar { width:48px;height:48px;border-radius:12px;background:linear-gradient(90deg,#8b5cf6,#6d28d9);color:white;display:flex;align-items:center;justify-content:center;font-weight:800;overflow:hidden }
  .avatar img { width:100%; height:100%; object-fit:cover; display:block }
        .prof-name { font-weight:700;color:#0f172a }
        .prof-spec { color:#6b7280;font-size:0.95rem }
        .notes { margin-top:10px;color:#374151 }
        .cancel-btn { margin-top:6px; background:#fff1f2; color:#9f1239; border:1px solid #fee2e2; padding:6px 10px; border-radius:8px; font-weight:700; cursor:pointer }
        .cancel-btn:disabled { opacity:0.6; cursor:default }
  /* Modal styles */
  .mc-modal-backdrop { position:fixed; inset:0; background:rgba(2,6,23,0.45); display:flex; align-items:center; justify-content:center; z-index:50 }
  .mc-modal { background:white; padding:18px; border-radius:12px; width:min(420px,95%); box-shadow:0 10px 30px rgba(2,6,23,0.2) }
  .mc-modal h3 { margin:0 0 8px 0 }
  .mc-modal .actions { margin-top:12px; display:flex; gap:8px; justify-content:flex-end }
  .mc-btn { padding:8px 12px; border-radius:8px; font-weight:700; cursor:pointer }
  .mc-btn.secondary { background:#f1f5f9; color:#0f172a; border:1px solid #e2e8f0 }
  .mc-btn.danger { background:#fff1f2; color:#9f1239; border:1px solid #fee2e2 }
        @media (max-width:640px){ .left{width:120px} .agenda-item{flex-direction:column;align-items:flex-start} .right{width:100%} }
      `}</style>
      {/* Confirmation modal */}
      
    </div>
  );
}
