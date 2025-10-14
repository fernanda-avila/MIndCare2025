import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function Timeline() {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [timelineTrack, setTimelineTrack] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);

  useEffect(() => {
    const track = document.querySelector('.timeline-track');
    const events = document.querySelectorAll('.timeline-event');
    
    setTimelineTrack(track);
    setTimelineEvents(Array.from(events));
  }, []);

  const updateControls = () => {
    const prevBtn = document.getElementById('prevBtn') as HTMLButtonElement | null;
    const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement | null;
    const indicators = document.querySelectorAll('.indicator');
    
    if (!timelineTrack || timelineEvents.length === 0 || !prevBtn || !nextBtn) return;
    
    const eventWidth = timelineEvents[0].offsetWidth + 30;
    const maxPosition = (timelineEvents.length - 1) * eventWidth;
    
    prevBtn.disabled = currentPosition === 0;
    nextBtn.disabled = currentPosition === maxPosition;
    
    // Atualizar indicadores
    const activeIndex = Math.round(currentPosition / eventWidth);
    indicators.forEach((indicator, index) => {
      if (index === activeIndex) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
  };

  const moveTimeline = (position) => {
    if (!timelineTrack) return;
    
    timelineTrack.scrollTo({
      left: position,
      behavior: 'smooth'
    });
    setCurrentPosition(position);
    setTimeout(updateControls, 300); // Espera a animação terminar
  };

  useEffect(() => {
    updateControls();
    
    const handleScroll = () => {
      if (timelineTrack) {
        setCurrentPosition(timelineTrack.scrollLeft);
      }
    };
    
    if (timelineTrack) {
      timelineTrack.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (timelineTrack) {
        timelineTrack.removeEventListener('scroll', handleScroll);
      }
    };
  }, [timelineTrack, timelineEvents]);

  const handleNextClick = () => {
    if (timelineEvents.length === 0) return;
    
    const eventWidth = timelineEvents[0].offsetWidth + 30;
    const maxPosition = (timelineEvents.length - 1) * eventWidth;
    
    if (currentPosition < maxPosition) {
      moveTimeline(currentPosition + eventWidth);
    }
  };

  const handlePrevClick = () => {
    if (timelineEvents.length === 0) return;
    
    const eventWidth = timelineEvents[0].offsetWidth + 30;
    
    if (currentPosition > 0) {
      moveTimeline(currentPosition - eventWidth);
    }
  };

  const handleIndicatorClick = (index) => {
    if (timelineEvents.length === 0) return;
    
    const eventWidth = timelineEvents[0].offsetWidth + 30;
    moveTimeline(index * eventWidth);
  };

  return (
    <section id="timeline" className="section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Nossa História e Conquistas</h2>
          <p className="section-subtitle">Marcos importantes da comunidade LGBTQIA+ no Brasil e no mundo</p>
        </div>
        
        <div className="timeline-horizontal">
          <div className="timeline-connector"></div>
          <div className="timeline-track">
            <div className="timeline-event">
              <div className="event-year">1969</div>
              <div className="event-content">
                <h3>Revolta de Stonewall</h3>
                <p>Marco histórico da luta pelos direitos LGBT+, ocorrido em Nova York, que deu origem às Paradas do Orgulho em todo o mundo.</p>
              </div>
            </div>
            
            <div className="timeline-event">
              <div className="event-year">1978</div>
              <div className="event-content">
                <h3>Bandeira do Arco-Íris</h3>
                <p>Gilbert Baker desenhou o maior símbolo de orgulho LGBT, representando a diversidade da comunidade.</p>
              </div>
            </div>
            
            <div className="timeline-event">
              <div className="event-year">1990</div>
              <div className="event-content">
                <h3>OMS retira homossexualidade da lista de doenças</h3>
                <p>Um passo essencial contra o preconceito institucional e para a despatologização das orientações sexuais.</p>
              </div>
            </div>
            
            <div className="timeline-event">
              <div className="event-year">2004</div>
              <div className="event-content">
                <h3>1ª Parada LGBT+ no Brasil</h3>
                <p>Realizada em São Paulo, tornou-se uma das maiores do mundo, com milhões de participantes.</p>
              </div>
            </div>
            
            <div className="timeline-event">
              <div className="event-year">2013</div>
              <div className="event-content">
                <h3>Casamento Igualitário</h3>
                <p>Supremo Tribunal Federal reconhece oficialmente a união civil entre pessoas do mesmo sexo em todo o território nacional.</p>
              </div>
            </div>
            
            <div className="timeline-event">
              <div className="event-year">2019</div>
              <div className="event-content">
                <h3>Supremo criminaliza homofobia</h3>
                <p>O STF equipara a discriminação por orientação sexual e identidade de género ao crime de racismo.</p>
              </div>
            </div>
          </div>
          
          <div className="timeline-controls">
            <button className="timeline-btn" id="prevBtn" onClick={handlePrevClick}>
              <FaChevronLeft />
            </button>
            <button className="timeline-btn" id="nextBtn" onClick={handleNextClick}>
              <FaChevronRight />
            </button>
          </div>
          
          <div className="timeline-indicators">
            <div className="indicator active" data-index="0" onClick={() => handleIndicatorClick(0)}></div>
            <div className="indicator" data-index="1" onClick={() => handleIndicatorClick(1)}></div>
            <div className="indicator" data-index="2" onClick={() => handleIndicatorClick(2)}></div>
            <div className="indicator" data-index="3" onClick={() => handleIndicatorClick(3)}></div>
            <div className="indicator" data-index="4" onClick={() => handleIndicatorClick(4)}></div>
            <div className="indicator" data-index="5" onClick={() => handleIndicatorClick(5)}></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .timeline-horizontal {
          margin: 60px 0;
          position: relative;
          height: 350px;
        }
        
        .timeline-track {
          display: flex;
          overflow-x: auto;
          padding: 40px 0;
          scrollbar-width: thin;
          scrollbar-color: var(--primary-light) transparent;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }
        
        .timeline-track::-webkit-scrollbar {
          height: 8px;
        }
        
        .timeline-track::-webkit-scrollbar-track {
          background: var(--gray);
          border-radius: 10px;
        }
        
        .timeline-track::-webkit-scrollbar-thumb {
          background: var(--primary-light);
          border-radius: 10px;
        }
        
        .timeline-event {
          flex: 0 0 300px;
          scroll-snap-align: start;
          margin: 0 15px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          padding: 25px;
          position: relative;
          transition: all 0.3s ease;
        }
        
        .timeline-event:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        .event-year {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, var(--primary), var(--primary-light));
          color: white;
          padding: 8px 15px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 1.1rem;
          box-shadow: 0 4px 10px rgba(109, 40, 217, 0.3);
          z-index: 2;
        }
        
        .event-content {
          margin-top: 15px;
        }
        
        .event-content h3 {
          color: var(--primary);
          margin-bottom: 12px;
          font-size: 1.3rem;
        }
        
        .event-content p {
          color: var(--text);
          font-size: 0.95rem;
        }
        
        .timeline-connector {
          position: absolute;
          top: 150px;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(to right, var(--primary-light), var(--secondary));
          z-index: 1;
        }
        
        .timeline-controls {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-top: 30px;
        }
        
        .timeline-btn {
          background: var(--primary);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 8px rgba(109, 40, 217, 0.2);
        }
        
        .timeline-btn:hover {
          background: var(--primary-light);
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(109, 40, 217, 0.3);
        }
        
        .timeline-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .timeline-indicators {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
        }
        
        .indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ddd;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .indicator.active {
          background: var(--primary);
          transform: scale(1.2);
        }
        
        @media (max-width: 992px) {
          .timeline-event {
            flex: 0 0 280px;
          }
        }
        
        @media (max-width: 768px) {
          .timeline-event {
            flex: 0 0 250px;
          }
        }
        
        @media (max-width: 480px) {
          .timeline-event {
            flex: 0 0 220px;
            padding: 20px;
          }
          
          .event-content h3 {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </section>
  );
}