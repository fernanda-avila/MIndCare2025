'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'


const MapWithNoSSR = dynamic(() => import('../Map/Map'), {
  ssr: false,
  loading: () => <div className="map-loading">Carregando mapa...</div>
})

export default function ResourcesMap() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos')
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  const categories = ['Todos', 'Saúde', 'Apoio Legal', 'Comunidade', 'Cultura', 'Educação']

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocalização não é suportada pelo seu navegador')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude])
        setLocationError(null)
      },
      (error) => {
        console.error('Erro ao obter localização:', error)
        setLocationError('Não foi possível obter sua localização')
      }
    )
  }

  useEffect(() => {
    getLocation()
  }, [])

  return (
    <section id="mapa" className="section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Mapa de Recursos</h2>
          <p className="section-subtitle">Encontre serviços e espaços seguros  de apoio à Saúde Mental próximos a você</p>
        </div>

        <div className="map-controls">
          <div className="map-filter">
            <label>Filtrar por categoria:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <button className="location-button" onClick={getLocation}>
            <i className="fas fa-location-arrow"></i> Minha Localização
          </button>
        </div>

        {locationError && (
          <div className="location-error">
            <i className="fas fa-exclamation-triangle"></i> {locationError}
          </div>
        )}

        <div className="map-container">
          <MapWithNoSSR 
            userLocation={userLocation} 
            selectedCategory={selectedCategory} 
          />
        </div>

        <style jsx>{`
          .map-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 15px;
          }
          .map-filter {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .map-filter label {
            font-weight: 600;
            color: var(--dark);
          }
          .map-filter select {
            padding: 10px 15px;
            border-radius: 8px;
            border: 1px solid #ddd;
            background: white;
            font-size: 1rem;
          }
          .location-button {
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--primary);
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
          }
          .location-button:hover {
            background: var(--primary-light);
            transform: translateY(-2px);
          }
          .location-error {
            background: #ffebee;
            color: #c62828;
            padding: 10px 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .map-container {
            height: 500px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          }
          .map-loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            font-weight: 600;
            color: var(--text);
          }
          @media (max-width: 768px) {
            .map-controls {
              flex-direction: column;
              align-items: stretch;
            }
            .map-filter {
              justify-content: space-between;
            }
          }
        `}</style>
      </div>
    </section>
  )
}
