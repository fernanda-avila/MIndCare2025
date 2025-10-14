import { useState, useEffect } from 'react'
import { format, parseISO, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Locale } from 'date-fns'

const locale: Locale = (ptBR as any).default || ptBR;

export default function Events() {
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [selectedCity, setSelectedCity] = useState('Todas')
  const [cities, setCities] = useState(['Todas'])

  useEffect(() => {
    // Simulação de dados de eventos - em uma aplicação real, isso viria de uma API
    const mockEvents = [
      {
        id: 1,
        title: 'Parada do Orgulho LGBT+',
        date: '2023-06-25',
        location: 'São Paulo, SP',
        description: 'Maior evento do orgulho LGBT+ da América Latina',
        category: 'Evento Público',
        image: 'https://images.unsplash.com/photo-1573339584805-6ed85958b6e8?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        id: 2,
        title: 'Workshop de Saúde Mental',
        date: '2023-07-15',
        location: 'Rio de Janeiro, RJ',
        description: 'Workshop sobre saúde mental para a comunidade LGBTQIA+',
        category: 'Workshop',
        image: 'https://media.istockphoto.com/id/1394449576/pt/foto/young-multiracial-latina-woman-meditating-at-home-with-online-video-meditation-lesson-using.jpg?s=612x612&w=0&k=20&c=rbjBZlDO5BPB3K9Z5yaWH9r73cGsahjsDv3B17VntBE='
      },
      {
        id: 3,
        title: 'Palestra sobre Direitos Trans',
        date: '2023-07-20',
        location: 'Belo Horizonte, MG',
        description: 'Discussão sobre os direitos da população trans no Brasil',
        category: 'Palestra',
        image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 4,
        title: 'Festival de Cinema LGBT+',
        date: '2023-08-05',
        location: 'São Paulo, SP',
        description: 'Mostra de cinema com temática LGBTQIA+',
        category: 'Cultural',
        image: 'https://media.istockphoto.com/id/1272422934/pt/foto/movie-clapper.webp?a=1&b=1&s=612x612&w=0&k=20&c=yGCxx47dyN93p-PrAb_sJQQw8U_ZA2M1gL8VjIQl_n4='
      },
      {
        id: 5,
        title: 'Grupo de Apoio para Pais',
        date: '2023-07-10',
        location: 'Porto Alegre, RS',
        description: 'Grupo de apoio para pais de pessoas LGBTQIA+',
        category: 'Suporte',
        image: 'https://portalartmed-public.grupoa.education/artmed_blog/efb68d4b-5b0c-479d-95c4-bbc53ad89085.jpg'
      },
      {
        id: 6,
        title: 'Feira de Empregos Inclusivos',
        date: '2023-08-20',
        location: 'Salvador, BA',
        description: 'Feira de empregos para a comunidade LGBTQIA+',
        category: 'Oportunidade',
        image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
      }
    ]

    setEvents(mockEvents)
    setFilteredEvents(mockEvents)
    
 
    const uniqueCities = ['Todas', ...new Set(mockEvents.map(event => {
      const city = event.location.split(',')[0]
      return city
    }))]
    setCities(uniqueCities)
  }, [])

  const filterEventsByCity = (city) => {
    setSelectedCity(city)
    if (city === 'Todas') {
      setFilteredEvents(events)
    } else {
      setFilteredEvents(events.filter(event => event.location.startsWith(city)))
    }
  }

  return (
    <section id="eventos" className="section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Eventos da Comunidade</h2>
          <p className="section-subtitle">Encontre eventos, palestras e encontros LGBTQIA+ próximos a você</p>
        </div>

        <div className="events-filter">
          <label>Filtrar por cidade:</label>
          <select 
            value={selectedCity} 
            onChange={(e) => filterEventsByCity(e.target.value)}
          >
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="events-grid">
          {filteredEvents.map(event => (
            <div key={event.id} className="event-card">
              <img src={event.image} alt={event.title} className="event-image" />
              <div className="event-content">
                <span className="event-date">
                  {format(parseISO(event.date), "dd 'de' MMMM", { locale })}
                </span>
                <h3 className="event-title">{event.title}</h3>
                <p className="event-location">
                  <i className="fas fa-map-marker-alt"></i> {event.location}
                </p>
                <p className="event-description">{event.description}</p>
                <span className="event-category">{event.category}</span>
                <button className="event-button">Saiba mais</button>
              </div>
            </div>
          ))}
        </div>

        <style jsx>{`
          .events-filter {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 40px;
            gap: 15px;
          }
          
          .events-filter label {
            font-weight: 600;
            color: var(--dark);
          }
          
          .events-filter select {
            padding: 10px 15px;
            border-radius: 8px;
            border: 1px solid #ddd;
            background: white;
            font-size: 1rem;
          }
          
          .events-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 30px;
          }
          
          .event-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
            transition: transform 0.3s, box-shadow 0.3s;
          }
          
          .event-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
          }
          
          .event-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
          }
          
          .event-content {
            padding: 25px;
          }
          
          .event-date {
            display: block;
            color: var(--primary);
            font-weight: 600;
            margin-bottom: 10px;
          }
          
          .event-title {
            font-size: 1.3rem;
            color: var(--dark);
            margin-bottom: 10px;
          }
          
          .event-location {
            color: var(--text);
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 5px;
          }
          
          .event-description {
            color: var(--text);
            margin-bottom: 20px;
            line-height: 1.6;
          }
          
          .event-category {
            display: inline-block;
            background: var(--gray);
            color: var(--primary);
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 20px;
          }
          
          .event-button {
            display: block;
            width: 100%;
            background: linear-gradient(135deg, var(--primary), var(--primary-light));
            color: white;
            border: none;
            padding: 12px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
          }
          
          .event-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(109, 40, 217, 0.3);
          }
          
          @media (max-width: 768px) {
            .events-grid {
              grid-template-columns: 1fr;
            }
            
            .events-filter {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </section>
  )
}