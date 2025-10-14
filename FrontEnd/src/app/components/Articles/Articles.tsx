import Link from 'next/link';
import Styles from '../../GuiaArcoIris/rainbow.module.css'
import '../../globals.css'


export default function Articles() {
  const articles = [
    {
      id: 1,
      title: "Saúde Mental na Comunidade LGBT+",
      excerpt: "Reflexões sobre autocuidado, depressão e ansiedade em contextos de preconceito e estratégias de enfrentamento.",
      image: "https://media.istockphoto.com/id/2181897384/pt/fotoholding-puzzle-piece-shaped-like-brain-with-sunlight-background.webp?a=1&b=1&s=612x612&w=0&k=20&c=P9QbUL6gVQW-gnYdUAx-eOE7n9QUri5AIsK848oEkmE=",
      category: "Saúde Mental",
      readTime: "5 min de leitura"
    },
    {
      id: 2,
      title: "História do Movimento LGBT no Brasil",
      excerpt: "Uma linha do tempo detalhada de avanços e resistências na luta por direitos e visibilidade no país.",
      image: "https://as2.ftcdn.net/v2/jpg/04/55/80/63/1000_F_455806346_pU9wkPlB5OxCQot6m2d1TyBSEVtY5lvY.jpg",
      category: "História",
      readTime: "7 min de leitura"
    },
    {
      id: 3,
      title: "Como encontrar apoio seguro",
      excerpt: "Organizações, ONGs e grupos de acolhimento para diferentes realidades dentro do espectro LGBTQIA+.",
      image: "https://media.istockphoto.com/id/656146176/pt/foto/professional-female-psychologist-holding-a-tablet.webp?a=1&b=1&s=612x612&w=0&k=20&c=iQEr2yRTNuzGmZ_0B0Vilr8_pm5YpgsjOKMQPlL1BCc=",
      category: "Apoio",
      readTime: "4 min de leitura"
    },
    {
      id: 4,
      title: "Direitos LGBTQIA+ no Local de Trabalho",
      excerpt: "Guia completo sobre seus direitos trabalhistas e como combater discriminação no ambiente profissional.",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      category: "Direitos",
      readTime: "6 min de leitura"
    },
    {
      id: 5,
      title: "Processo de Transição de Gênero no Brasil",
      excerpt: "Entenda as etapas, direitos e recursos disponíveis para pessoas trans no sistema de saúde brasileiro.",
      image: "https://media.istockphoto.com/id/2163571776/pt/foto/transman-raising-the-transgender-flag-outdoors-confident-young-transgender-man-celebrating-gay.webp?a=1&b=1&s=612x612&w=0&k=20&c=4JFuQZxw8usg01C19eDvrPLLd6TfUudS2LnDhUkpdiw=",
      category: "Saúde",
      readTime: "8 min de leitura"
    },
    {
      id: 6,
      title: "Pais e Familiares: Como Apoiar",
      excerpt: "Guia para familiares de pessoas LGBTQIA+ que buscam entender e apoiar seus entes queridos.",
      image: "https://media.istockphoto.com/id/2215068482/pt/foto/mother-and-adult-daughter-relaxing-at-a-luxury-hotel-spa.webp?a=1&b=1&s=612x612&w=0&k=20&c=5TmHnJq6azASrqrQLfq7S4C7pnGs-Dyd6pgvMPnkwTE=",
      category: "Família",
      readTime: "5 min de leitura"
    }
  ];

  return (
    <section id="textos" className="section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Conteúdos para Reflexão</h2>
          <p className="section-subtitle">Artigos, pesquisas e materiais educativos para apoiar sua jornada</p>
        </div>
        
        <div className="articles-grid">
          {articles.map((article) => (
            <article key={article.id} className="article-card">
              <img 
                src={article.image} 
                alt={article.title} 
                className="article-image" 
              />
              <div className="article-content">
                <span className="article-category">{article.category}</span>
                <h3 className="article-title">{article.title}</h3>
                <p className="article-excerpt">{article.excerpt}</p>
                <div className="article-meta">
                  <span className="article-read-time">{article.readTime}</span>
                  <Link href="#" className="article-link">
                    Ler mais <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="articles-cta">
          <p>Quer ver mais artigos e conteúdos exclusivos?</p>
          <Link href="/artigos" className="btn-articles">
            Ver todos os artigos
          </Link>
        </div>
      </div>

      <style jsx>{`
        .articles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-bottom: 50px;
        }
        
        .article-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s, box-shadow 0.3s;
          display: flex;
          flex-direction: column;
        }
        
        .article-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
        }
        
        .article-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }
        
        .article-content {
          padding: 25px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .article-category {
          display: inline-block;
          background: var(--primary-light);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 15px;
        }
        
        .article-title {
          font-size: 1.3rem;
          color: var(--dark);
          margin-bottom: 15px;
          line-height: 1.4;
        }
        
        .article-excerpt {
          color: var(--text);
          margin-bottom: 20px;
          line-height: 1.6;
          flex: 1;
        }
        
        .article-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .article-read-time {
          color: var(--text);
          font-size: 0.9rem;
          opacity: 0.7;
        }
        
        .article-link {
          display: inline-flex;
          align-items: center;
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s;
        }
        
        .article-link i {
          margin-left: 5px;
          transition: transform 0.3s;
        }
        
        .article-link:hover {
          color: var(--primary-light);
        }
        
        .article-link:hover i {
          transform: translateX(5px);
        }
        
        .articles-cta {
          text-align: center;
          padding: 40px 0;
          background: var(--gray);
          border-radius: 12px;
          margin-top: 30px;
        }
        
        .articles-cta p {
          font-size: 1.2rem;
          margin-bottom: 20px;
          color: var(--dark);
        }
        
        .btn-articles {
          display: inline-block;
          background: linear-gradient(135deg, var(--primary), var(--primary-light));
          color: white;
          padding: 12px 30px;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(109, 40, 217, 0.3);
        }
        
        .btn-articles:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(109, 40, 217, 0.4);
        }
        
        @media (max-width: 768px) {
          .articles-grid {
            grid-template-columns: 1fr;
          }
          
          .article-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .articles-cta {
            padding: 30px 20px;
          }
          
          .articles-cta p {
            font-size: 1.1rem;
          }
        }
        
        @media (max-width: 480px) {
          .article-content {
            padding: 20px;
          }
          
          .article-title {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </section>
  );
}