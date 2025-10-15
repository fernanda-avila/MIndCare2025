// Minimal static professionals component (reverted)
import styles from './Professionals-lgbt.module.css';
import React, { useEffect, useState } from 'react';
import { getProfessionals } from '../../services/professionalService';

export default function Profissionais() {
  const [professionals, setProfessionals] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    getProfessionals()
      .then((list) => {
        if (!mounted) return;
        // enrich like other lists
        const enhanced = list.map((p: any, idx: number) => {
          const seeded = Number(p.id ?? idx);
          const price = p.price ?? (80 + (seeded % 5) * 30 + (seeded % 3) * 5);
          const rating = p.rating ?? (3.5 + (seeded % 15) * 0.1);
          return { ...p, price, rating: Math.min(5, Math.round(rating * 10) / 10) };
        });
        setProfessionals(enhanced);
      })
      .catch(() => setProfessionals([]));
    return () => { mounted = false };
  }, []);

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
                <img src={getUploadUrl(p.avatarUrl ?? p.photo ?? '/default-avatar.svg')} alt={p.name} className={styles.photo} />
              </div>
              <div className={styles.body}>
                <h3 className={styles.name}>{p.name}</h3>
                <p className={styles.specialty}>{p.specialty}</p>
                <div className={styles.meta}>
                  <div className={styles.rating} aria-hidden>
                    <span>★★★★☆</span>
                    <small className={styles.reviews}>(45)</small>
                  </div>
                  <div className={styles.price}>{p.price ? `R$ ${p.price}` : 'A consultar'}</div>
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
