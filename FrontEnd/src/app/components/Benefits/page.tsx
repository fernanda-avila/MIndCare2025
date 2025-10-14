"use client";
import React, { useState } from 'react';
import styles from './benefit.module.css';


import { FaComment, FaUsers, FaCalendarAlt } from 'react-icons/fa';

const Benefits: React.FC = () => {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const benefits = [
    {
      title: 'Chat com Colaborador',
      description: 'Converse com colaboradores a qualquer momento e receba suporte imediato.',
      icon: <span className={styles.greenIcon}><FaComment /></span>, 
    },
    {
      title: 'Profissionais Parceiros',
      description: 'Acesso a uma rede de profissionais especializados em saúde mental.',
      icon: <span className={styles.redIcon}><FaUsers /></span>, 
    },
    {
      title: 'Agendamento Flexível',
      description: 'Agende suas consultas conforme sua disponibilidade, com flexibilidade total.',
      icon: <span className={styles.orangeIcon}><FaCalendarAlt /></span>,
    },
  ];

  return (
    <section className={styles.benefitsSection}>
      <div className={styles.container}>
        <div className={styles.imageContainer}>
          <img
            src="./sideimg.jpg"
            alt="Imagem ilustrativa"
            className={styles.image}
          />
          <div className={styles.sessionReminder}>
            <p>Saiba mais sobre o que o MindCare pode oferecer!</p>
          </div>
        </div>

       
        <div className={styles.textContainer}>
          <div className={styles.tagline}>
            MindCare: O caminho para um bem-estar mental completo.
          </div>
          <h2 className={styles.mainTitle}>O que o MindCare pode fazer por você? Venha descobrir.</h2>
          <p className={styles.description}>
            Conheça as vantagens que a nossa plataforma oferece para garantir o seu bem-estar.
          </p>

         
          <div className={styles.cardsContainer}>
            {benefits.map((item, index) => (
              <div
                key={index}
                className={`${styles.card} ${hoveredItem === index ? styles.cardHovered : ''}`}
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className={styles.cardIcon}>
                  {item.icon} 
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                {hoveredItem === index && (
                  <p className={styles.cardDescription}>{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
