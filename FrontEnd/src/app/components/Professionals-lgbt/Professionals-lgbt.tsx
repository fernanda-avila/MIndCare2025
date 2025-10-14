// Minimal static professionals component (reverted)
import styles from './Professionals-lgbt.module.css';

export default function Profissionais() {
  const professionals = [
    { id: 1, name: 'Dra. Maria Silva', specialty: 'Psicóloga Clínica', photo: '/images/terapeuta.png', price: 'R$ 150' },
    { id: 2, name: 'Dr. João Santos', specialty: 'Psiquiatra', photo: '/images/terapeuta.png', price: 'R$ 250' },
    { id: 3, name: 'Dra. Ana Costa', specialty: 'Psicóloga', photo: '/images/terapeuta.png', price: 'R$ 120' }
  ];

  return (
    <section className={styles.section} aria-labelledby="profissionais-title">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 id="profissionais-title">Profissionais parceiros</h2>
          <p className={styles.subtitle}>Profissionais selecionados com experiência em saúde mental e atendimento acolhedor.</p>
        </div>

        <div className={styles.grid}>
          {professionals.map(p => (
            <article key={p.id} className={styles.card}>
              <div className={styles.media}>
                <img src={p.photo} alt={p.name} className={styles.photo} />
              </div>
              <div className={styles.body}>
                <h3 className={styles.name}>{p.name}</h3>
                <p className={styles.specialty}>{p.specialty}</p>
                <div className={styles.meta}>
                  <div className={styles.rating} aria-hidden>
                    <span>★★★★☆</span>
                    <small className={styles.reviews}>(45)</small>
                  </div>
                  <div className={styles.price}>{p.price}</div>
                </div>
                <div className={styles.actions}>
                  <button className={styles.btnPrimary}>Agendar</button>
                  <button className={styles.btnOutline}>Ver perfil</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
