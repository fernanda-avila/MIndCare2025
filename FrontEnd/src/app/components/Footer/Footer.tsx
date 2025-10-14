import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { MdEmail, MdPhone } from 'react-icons/md';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Sobre Nós</h3>
          <p className={styles.footerText}>
            Somos uma empresa dedicada a oferecer as melhores soluções para nossos clientes, com qualidade e inovação.
          </p>
          <div className={styles.socialIcons}>
            <a href="#" aria-label="Facebook"><FaFacebook /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="#" aria-label="YouTube"><FaYoutube /></a>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Links Úteis</h3>
          <ul className={styles.footerLinks}>
            <li><a href="#">Home</a></li>
            <li><a href="#">Serviços</a></li>
            <li><a href="#">Planos</a></li>
            <li><a href="#">Sobre</a></li>
            <li><a href="#">Contato</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Contato</h3>
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <MdEmail className={styles.contactIcon} />
              <span>contato@empresa.com</span>
            </div>
            <div className={styles.contactItem}>
              <MdPhone className={styles.contactIcon} />
              <span>(11) 1234-5678</span>
            </div>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Quer saber mais?!</h3>
          <p className={styles.footerText}>Adicione seu e-mail e receba novidades e informações sobre o MindCare.</p>
          <form className={styles.newsletterForm}>
            <input type="email" placeholder="Seu e-mail" required />
            <button type="submit">Assinar</button>
          </form>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} MindCare. Todos os direitos reservados.</p>
        <div className={styles.legalLinks}>
          <a href="#">Termos de Serviço</a>
          <a href="#">Política de Privacidade</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
