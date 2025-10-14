import React from 'react';
import styles from './banner.module.css';
import { FaCommentAlt } from 'react-icons/fa';
import Link from 'next/link';

const BannerZen: React.FC = () => {
  return (
    <div className={styles.bannerContainer}>
      <div className={styles.textSection}>
        <span className={styles.tagline}>
          Suporte emocional de confiança, a qualquer momento.
        </span>
        <h1 className={styles.title}>A mente saudável começa aqui</h1>
        <p className={styles.description}>
          MindCare é a plataforma que cuida da sua saúde mental com empatia e atenção. Oferecemos um chat direto, além de agendamento de consultas com profissionais parceiros, tudo para apoiar você no seu bem-estar.
        </p>

        <div className={styles.chatContainer}>

          <div className={styles.chatBubbleWrapper}>

            <div className={styles.speechBubble}>
              <div className={styles.bubbleArrow}></div>
              <p>Estamos aqui para te ouvir! 😊</p>
            </div>
            <img
              src="/images/terapeuta.png"
              alt="Assistente virtual"
              className={styles.assistantImage}
            />
          </div>
          <Link
          href="/chatAoVivo"
          className={styles.chatButton}
          target="_blank"
          rel="noopener noreferrer"
        >
          Chat com Colaborador!
        </Link>

          
        </div>
      </div>

      <div className={styles.imageSection}>
        <div className={styles.sessionReminder}>
          <p>Sua primeira sessão pode ser hoje mesmo!</p>
        </div>
        <img
          src="/img-banner.avif"
          alt="Grupo de pessoas felizes"
          className={styles.mainImage}
        />
      </div>
    </div>
  );
};

export default BannerZen;