"use client";

import React from 'react';
import Link from 'next/link'; // Importe o Link do Next.js
import styles from './NavBar.module.css';
import { useAuth } from '../../context/AuthContext';
import UserMenu from '../UserMenu/UserMenu';

const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <a href="/">
          <img src="/logo.png" alt="Logo" className={styles.logoImage} />
        </a>
      </div>

      <div className={styles.navLinks}>
        <a href="/Booking" className={styles.agendarButton}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-4 14h4m4-10H4m16 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7h16z" />
          </svg>
          Agendar Consulta
        </a>

        {user ? (
          <UserMenu />
        ) : (
          <Link href="/Login">
            <button className={styles.loginButton}>Entrar</button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
