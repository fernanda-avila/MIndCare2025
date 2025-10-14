'use client'

import { useEffect, useRef } from 'react'

import Map from 'ol/Map.js'
import View from 'ol/View.js'
import TileLayer from 'ol/layer/Tile.js'
import VectorLayer from 'ol/layer/Vector.js'
import OSM from 'ol/source/OSM.js'
import VectorSource from 'ol/source/Vector.js'
import Feature from 'ol/Feature.js'
import Point from 'ol/geom/Point.js'
import CircleGeom from 'ol/geom/Circle.js'
import { fromLonLat } from 'ol/proj.js'
import Style from 'ol/style/Style.js'
import Icon from 'ol/style/Icon.js'
import Fill from 'ol/style/Fill.js'
import Stroke from 'ol/style/Stroke.js'
import Overlay from 'ol/Overlay.js'

type MapProps = {
  userLocation: [number, number] | null // [lat, lng]
  selectedCategory: string
}

type Resource = {
  id: number
  name: string
  category: string
  position: [number, number] // [lat, lng]
  address: string
  description: string
  phone: string
}

const resourcesData: Resource[] = [
  {
    id: 1,
    name: 'Centro de Referência LGBT',
    category: 'Saúde',
    position: [-23.5505, -46.6333],
    address: 'Rua Major Sertório, 292 - República',
    description: 'Atendimento psicológico, jurídico e social para a comunidade LGBT+',
    phone: '(11) 3333-3333'
  },
  {
    id: 2,
    name: 'Casa 1',
    category: 'Comunidade',
    position: [-23.5580, -46.6405],
    address: 'Rua Condessa de São Joaquim, 277 - Liberdade',
    description: 'Centro de cultura e acolhimento para jovens LGBT+',
    phone: '(11) 4444-4444'
  },
  {
    id: 3,
    name: 'ONG Aliança Nacional LGBTI',
    category: 'Apoio Legal',
    position: [-23.5489, -46.6388],
    address: 'Av. São Luís, 165 - República',
    description: 'Organização de defesa de direitos LGBTI',
    phone: '(11) 5555-5555'
  },
  {
    id: 4,
    name: 'Instituto Cultural LGBT',
    category: 'Cultura',
    position: [-23.5435, -46.6435],
    address: 'Rua Augusta, 123 - Consolação',
    description: 'Espaço cultural com programação diversa e inclusiva',
    phone: '(11) 6666-6666'
  },
  {
    id: 5,
    name: 'Ambulatório Trans',
    category: 'Saúde',
    position: [-22.9068, -43.1729],
    address: 'Av. Pedro II, 111 - São Cristóvão',
    description: 'Serviço de saúde especializado para pessoas trans',
    phone: '(21) 7777-7777'
  },
  {
    id: 6,
    name: 'Grupo Dignidade',
    category: 'Educação',
    position: [-25.4284, -49.2733],
    address: 'Rua Visconde do Rio Branco, 1000 - Centro',
    description: 'Organização que promove educação em diversidade sexual',
    phone: '(41) 8888-8888'
  }
]

// helpers
const toMercator = ([lat, lng]: [number, number]) => fromLonLat([lng, lat])

export default function MapOL({ userLocation, selectedCategory }: MapProps) {
  const mapEl = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)
  const resourcesLayerRef = useRef<VectorLayer<VectorSource> | null>(null)
  const userLayerRef = useRef<VectorLayer<VectorSource> | null>(null)
  const circleLayerRef = useRef<VectorLayer<VectorSource> | null>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)
  const overlayRef = useRef<Overlay | null>(null)

  // estilos dos ícones / círculo
  const resourceStyle = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      crossOrigin: 'anonymous'
    })
  })

  const userStyle = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      crossOrigin: 'anonymous',
      // o ícone é 2x; reduz para um tamanho ok
      scale: 0.5
    })
  })

  const circleStyle = new Style({
    fill: new Fill({ color: 'rgba(0, 0, 255, 0.1)' }),
    stroke: new Stroke({ color: 'rgba(0, 0, 255, 0.6)', width: 1 })
  })

  // cria o mapa uma única vez
  useEffect(() => {
    if (!mapEl.current) return

    const base = new TileLayer({ source: new OSM() })

    const resourcesSource = new VectorSource()
    const userSource = new VectorSource()
    const circleSource = new VectorSource()

    resourcesLayerRef.current = new VectorLayer({ source: resourcesSource, style: resourceStyle })
    userLayerRef.current = new VectorLayer({ source: userSource, style: userStyle })
    circleLayerRef.current = new VectorLayer({ source: circleSource, style: circleStyle })

    mapRef.current = new Map({
      target: mapEl.current,
      layers: [base, circleLayerRef.current, resourcesLayerRef.current, userLayerRef.current],
      view: new View({
        center: toMercator(userLocation || [-23.5505, -46.6333]),
        zoom: userLocation ? 12 : 5
      })
    })

    // popup
    if (popupRef.current) {
      overlayRef.current = new Overlay({
        element: popupRef.current,
        autoPan: { animation: { duration: 250 } },
        offset: [0, -15],
        positioning: 'bottom-center'
      })
      mapRef.current.addOverlay(overlayRef.current)
    }

    // clique em features para abrir popup
    const handleClick = (evt: any) => {
      let found = false
      mapRef.current?.forEachFeatureAtPixel(evt.pixel, (feature: Feature) => {
        const data = feature.get('data')
        if (data) {
          found = true
          if (popupRef.current && overlayRef.current) {
            popupRef.current.innerHTML = `
              <div class="popup-content">
                <h3>${data.name}</h3>
                <p><strong>Categoria:</strong> ${data.category}</p>
                <p><strong>Endereço:</strong> ${data.address}</p>
                <p><strong>Descrição:</strong> ${data.description}</p>
                <p><strong>Telefone:</strong> ${data.phone}</p>
              </div>`
            overlayRef.current.setPosition(evt.coordinate)
          }
        }
      })
      if (!found && overlayRef.current) {
        overlayRef.current.setPosition(undefined)
      }
    }

    mapRef.current.on('singleclick', handleClick)

    return () => {
      mapRef.current?.un('singleclick', handleClick)
      mapRef.current?.setTarget(undefined)
      mapRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // atualiza recursos quando o filtro muda
  useEffect(() => {
    const map = mapRef.current
    const layer = resourcesLayerRef.current
    if (!map || !layer) return

    const source = layer.getSource()
    source?.clear()

    const filtered =
      selectedCategory === 'Todos'
        ? resourcesData
        : resourcesData.filter(r => r.category === selectedCategory)

    filtered.forEach(r => {
      const f = new Feature({
        geometry: new Point(toMercator(r.position)),
        data: r
      })
      source?.addFeature(f)
    })
  }, [selectedCategory])

  // atualiza posição/zoom do usuário + círculo
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const userLayer = userLayerRef.current
    const circleLayer = circleLayerRef.current
    userLayer?.getSource()?.clear()
    circleLayer?.getSource()?.clear()

    if (userLocation) {
      const userFeature = new Feature({ geometry: new Point(toMercator(userLocation)) })
      userLayer?.getSource()?.addFeature(userFeature)

      // círculo de 5km
      const circle = new Feature({
        geometry: new CircleGeom(toMercator(userLocation), 5000)
      })
      circleLayer?.getSource()?.addFeature(circle)

      // move a câmera suavemente
      map.getView().animate({
        center: toMercator(userLocation),
        zoom: 12,
        duration: 500
      })
    }
  }, [userLocation])

  return (
    <>
      <div ref={mapEl} style={{ width: '100%', height: '100%' }} />
      <div ref={popupRef} className="ol-popup" />
      <style jsx global>{`
        .ol-popup {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.15);
          padding: 12px 14px;
          min-width: 220px;
          border: 1px solid #e5e7eb;
        }
        .popup-content h3 {
          margin: 0 0 6px 0;
          font-size: 1rem;
          font-weight: 700;
          color: #111827;
        }
        .popup-content p {
          margin: 4px 0;
          font-size: 0.9rem;
          color: #374151;
        }
      `}</style>
    </>
  )
}
