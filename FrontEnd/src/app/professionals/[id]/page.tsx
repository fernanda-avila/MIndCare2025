import React from 'react';

import styles from './professional.module.css';

async function getProfessional(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/professionals/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export default async function ProfessionalPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const p = await getProfessional(id) || { id, name: `Profissional ${id}`, specialty: 'Terapia geral', shortBio: 'Profissional experiente com foco em acolhimento.', price: 120, rating: 4.6, location: 'São Paulo', avatar: '/images/terapeuta.png' };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <img src={p.avatar ?? '/images/terapeuta.png'} alt={p.name} className={styles.avatar} />
        <div className={styles.info}>
          <h1 className={styles.name}>{p.name}</h1>
          <p className={styles.specialty}>{p.specialty}</p>
          <p className={styles.bio}>{p.shortBio ?? p.bio}</p>
          <div className={styles.meta}>
            <div className={styles.price}>{p.price ? `R$ ${p.price.toFixed(2)}` : 'A consultar'}</div>
            <div className={styles.location}>{p.location}</div>
            <div className={styles.rating}>{p.rating ?? '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
