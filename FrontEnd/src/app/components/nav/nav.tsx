import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="logo">
        <i className="fas fa-rainbow"></i> Guia Arco-Íris
      </div>
      <nav>
        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li><a href="#home">Início</a></li>
          <li><a href="#timeline">Linha do Tempo</a></li>
          <li><a href="#depoimentos">Depoimentos</a></li>
          <li><a href="#textos">Leituras</a></li>
          <li><a href="#eventos">Eventos</a></li>
          <li><a href="#mapa">Mapa</a></li>
          <li><Link href="/profissionais">Profissionais</Link></li>
        </ul>
      </nav>
      <a href="#chatbot" className="btn-nav">Falar com Especialista</a>
      <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <i className="fas fa-bars"></i>
      </div>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 40px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          transition: all 0.3s ease;
        }
        
        .navbar.scrolled {
          padding: 10px 40px;
        }
        
        .logo {
          display: flex;
          align-items: center;
          font-weight: 700;
          font-size: 1.4rem;
          color: var(--primary);
        }
        
        .logo i {
          margin-right: 8px;
        }
        
        .nav-menu {
          display: flex;
          gap: 30px;
          list-style: none;
        }
        
        .nav-menu a {
          text-decoration: none;
          color: var(--dark);
          font-weight: 500;
          transition: color 0.3s;
          position: relative;
        }
        
        .nav-menu a:after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -4px;
          left: 0;
          background-color: var(--primary);
          transition: width 0.3s;
        }
        
        .nav-menu a:hover {
          color: var(--primary);
        }
        
        .nav-menu a:hover:after {
          width: 100%;
        }
        
        .btn-nav {
          background: linear-gradient(135deg, var(--primary), var(--primary-light));
          color: white;
          padding: 10px 20px;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
          box-shadow: 0 4px 6px rgba(109, 40, 217, 0.2);
        }
        
        .btn-nav:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(109, 40, 217, 0.3);
        }
        
        .hamburger {
          display: none;
          cursor: pointer;
        }
        
        @media (max-width: 768px) {
          .navbar {
            padding: 15px 20px;
          }
          
          .nav-menu {
            position: fixed;
            top: 70px;
            left: -100%;
            flex-direction: column;
            background: white;
            width: 100%;
            height: calc(100vh - 70px);
            padding: 40px;
            box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
            transition: left 0.3s;
          }
          
          .nav-menu.active {
            left: 0;
          }
          
          .hamburger {
            display: block;
            font-size: 1.5rem;
          }
        }
      `}</style>
    </header>
  )
}