'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Unit } from '@/types'
import { parseLatLng } from '@/utils/validation'

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface MapComponentProps {
  units: Unit[]
  selectedUnits?: string[] // Array of unit IDs
  onUnitClick?: (unit: Unit) => void
  center?: [number, number]
  zoom?: number
  height?: string
  showClustering?: boolean
  className?: string
}

export default function MapComponent({
  units,
  selectedUnits = [],
  onUnitClick,
  center = [30.0444, 31.2357], // Default to Cairo, Egypt
  zoom = 6,
  height = '500px',
  showClustering = true,
  className = ''
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      dragging: true,
    })

    // Add OpenStreetMap tiles (HTTPS compatible)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    // Create markers layer group
    const markersLayer = L.layerGroup().addTo(map)
    markersRef.current = markersLayer
    mapInstanceRef.current = map
    setIsLoaded(true)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markersRef.current = null
        setIsLoaded(false)
      }
    }
  }, [center, zoom])

  // Update markers when units or selectedUnits change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current || !isLoaded) return

    // Clear existing markers
    markersRef.current.clearLayers()

    if (units.length === 0) return

    const markers: L.Marker[] = []
    const bounds = L.latLngBounds([])

    units.forEach((unit) => {
      const coords = parseLatLng(unit.lat_lng)
      if (!coords) return

      const [lat, lng] = coords
      const isSelected = selectedUnits.includes(unit.id)

      // Create custom icon for selected units
      const icon = isSelected
        ? L.divIcon({
            className: 'custom-marker selected-marker',
            html: `<div class="marker-pin selected">
                     <div class="marker-content">
                       <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                       </svg>
                     </div>
                   </div>`,
            iconSize: [30, 40],
            iconAnchor: [15, 40],
            popupAnchor: [0, -40],
          })
        : L.divIcon({
            className: 'custom-marker default-marker',
            html: `<div class="marker-pin default">
                     <div class="marker-content">
                       <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                       </svg>
                     </div>
                   </div>`,
            iconSize: [24, 32],
            iconAnchor: [12, 32],
            popupAnchor: [0, -32],
          })

      const marker = L.marker([lat, lng], { icon })
        .bindPopup(`
          <div class="unit-popup">
            <h3 class="font-semibold text-gray-900 mb-2">${unit.unit_id}</h3>
            <div class="space-y-1 text-sm">
              <div><strong>Location:</strong> ${unit.location}</div>
              <div><strong>Governorate:</strong> ${unit.governorate}</div>
              <div><strong>Coordinates:</strong> ${unit.lat_lng}</div>
              ${unit.created_at ? `<div><strong>Created:</strong> ${new Date(unit.created_at).toLocaleDateString()}</div>` : ''}
            </div>
          </div>
        `)

      if (onUnitClick) {
        marker.on('click', () => onUnitClick(unit))
      }

      markers.push(marker)
      bounds.extend([lat, lng])
    })

    // Add markers to map
    if (showClustering && markers.length > 50) {
      // For large datasets, we could implement clustering here
      // For now, just add all markers
      markers.forEach(marker => markersRef.current?.addLayer(marker))
    } else {
      markers.forEach(marker => markersRef.current?.addLayer(marker))
    }

    // Fit map to show all markers if there are any
    if (markers.length > 0 && bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [units, selectedUnits, onUnitClick, showClustering, isLoaded])

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapRef}
        style={{ height, width: '100%' }}
        className="rounded-lg overflow-hidden shadow-sm border border-gray-200"
      />
      
      {/* Custom marker styles */}
      <style jsx global>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
        
        .marker-pin {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .marker-pin.default {
          background: #3b82f6;
          width: 24px;
          height: 24px;
        }
        
        .marker-pin.selected {
          background: #ef4444;
          width: 30px;
          height: 30px;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
        }
        
        .marker-content {
          transform: rotate(45deg);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .unit-popup {
          min-width: 200px;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .leaflet-popup-content {
          margin: 12px 16px;
          font-family: 'Inter', system-ui, sans-serif;
        }
        
        .leaflet-container {
          font-family: 'Inter', system-ui, sans-serif;
        }
      `}</style>
    </div>
  )
}
