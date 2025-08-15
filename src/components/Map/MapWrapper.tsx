'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { Unit } from '@/types'

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg border border-gray-200">
      <div className="text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  )
})

interface MapWrapperProps {
  units: Unit[]
  selectedUnits?: string[]
  onUnitClick?: (unit: Unit) => void
  center?: [number, number]
  zoom?: number
  height?: string
  showClustering?: boolean
  className?: string
}

export default function MapWrapper(props: MapWrapperProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }

  return <MapComponent {...props} />
}
