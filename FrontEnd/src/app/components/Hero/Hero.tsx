
export function scrollToProfessionals() {
  const section = document.getElementById('professionals-section');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
    section.classList.add('highlight-section');
    setTimeout(() => {
      section.classList.remove('highlight-section');
    }, 2000);
  }
}

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="container">
        <div className="hero-content">
          <h1>Saúde mental e bem-estar para a comunidade LGBTQIA+</h1>
          <p>O MindCare conecta você a profissionais especializados e conteúdos relevantes para sua jornada de autocuidado e descoberta.</p>
          <button className="btn-hero" onClick={scrollToProfessionals}>
            Conversar com um especialista
          </button>
        </div>
      </div>

      <style jsx>{`
        .highlight-section {
          box-shadow: 0 0 0 4px var(--primary-light), 0 0 20px 8px var(--primary-light);
          transition: box-shadow 0.3s;
        }
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          background: linear-gradient(135deg, rgba(224, 187, 255, 0.7), rgba(193, 225, 236, 0.7), rgba(253, 226, 228, 0.7)), url('https://images.unsplash.com/photo-1637631531662-cea0fb4b1d97?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
          background-size: cover;
          background-position: center;
          padding: 100px 0 80px;
          position: relative;
        }
        
        .hero-content {
          max-width: 650px;
          padding: 40px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .hero h1 {
          font-size: 3rem;
          color: var(--dark);
          margin-bottom: 20px;
          line-height: 1.2;
        }
        
        .hero p {
          font-size: 1.2rem;
          margin-bottom: 30px;
          color: var(--text);
        }
        
        .btn-hero {
          display: inline-block;
          background: linear-gradient(135deg, var(--primary), var(--primary-light));
          color: white;
          padding: 15px 35px;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s;
        }
        
        .btn-hero:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(109, 40, 217, 0.4);
        }
        
        @media (max-width: 992px) {
          .hero h1 {
            font-size: 2.5rem;
          }
        }
        
        @media (max-width: 768px) {
          .hero-content {
            padding: 30px;
          }
          
          .hero h1 {
            font-size: 2rem;
          }
        }
        
        @media (max-width: 480px) {
          .hero h1 {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </section>
  );
}