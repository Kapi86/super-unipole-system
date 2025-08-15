'use client'

import { useState, useEffect } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import type { UserSettings, ValidationError } from '@/types'
import { validateLatLng } from '@/utils/validation'

interface MapSettingsProps {
  settings: UserSettings | null
  onSave: (settings: Partial<UserSettings>) => Promise<void>
  loading?: boolean
}

export default function MapSettings({ settings, onSave, loading = false }: MapSettingsProps) {
  const [formData, setFormData] = useState({
    default_zoom: 10,
    default_center_lat: 30.0444,
    default_center_lng: 31.2357,
    map_style: 'default',
    marker_style: 'default'
  })
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (settings) {
      setFormData({
        default_zoom: settings.default_zoom,
        default_center_lat: settings.default_center_lat,
        default_center_lng: settings.default_center_lng,
        map_style: settings.map_style || 'default',
        marker_style: settings.marker_style || 'default'
      })
    }
  }, [settings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors: ValidationError[] = []
    
    // Validate zoom level
    if (formData.default_zoom < 1 || formData.default_zoom > 20) {
      validationErrors.push({ field: 'default_zoom', message: 'Zoom level must be between 1 and 20' })
    }
    
    // Validate coordinates
    const latLng = `${formData.default_center_lat},${formData.default_center_lng}`
    if (!validateLatLng(latLng)) {
      validationErrors.push({ field: 'coordinates', message: 'Invalid coordinates' })
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onSave(formData)
      setErrors([])
    } catch (error) {
      console.error('Error saving settings:', error)
      setErrors([{ field: 'general', message: 'Failed to save settings. Please try again.' }])
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      default_zoom: 10,
      default_center_lat: 30.0444,
      default_center_lng: 31.2357,
      map_style: 'default',
      marker_style: 'default'
    })
    setErrors([])
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field-specific errors
    setErrors(prev => prev.filter(error => error.field !== field))
  }

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message
  }

  const generalError = errors.find(error => error.field === 'general')?.message

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Map Settings</h3>
        <p className="text-sm text-gray-500">Configure default map behavior and appearance</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {generalError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{generalError}</p>
          </div>
        )}

        {/* Default Map Center */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Default Map Center</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="0.000001"
              value={formData.default_center_lat}
              onChange={(e) => handleChange('default_center_lat', parseFloat(e.target.value))}
              error={getFieldError('coordinates')}
              placeholder="30.0444"
            />
            <Input
              label="Longitude"
              type="number"
              step="0.000001"
              value={formData.default_center_lng}
              onChange={(e) => handleChange('default_center_lng', parseFloat(e.target.value))}
              placeholder="31.2357"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Default coordinates for map center (Cairo, Egypt: 30.0444, 31.2357)
          </p>
        </div>

        {/* Default Zoom Level */}
        <div>
          <Input
            label="Default Zoom Level"
            type="number"
            min="1"
            max="20"
            value={formData.default_zoom}
            onChange={(e) => handleChange('default_zoom', parseInt(e.target.value))}
            error={getFieldError('default_zoom')}
            helperText="Zoom level from 1 (world view) to 20 (street level)"
          />
        </div>

        {/* Map Style */}
        <div>
          <label className="form-label">Map Style</label>
          <select
            value={formData.map_style}
            onChange={(e) => handleChange('map_style', e.target.value)}
            className="form-input"
          >
            <option value="default">Default (OpenStreetMap)</option>
            <option value="satellite" disabled>Satellite (Coming Soon)</option>
            <option value="terrain" disabled>Terrain (Coming Soon)</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Choose the default map style for all maps
          </p>
        </div>

        {/* Marker Style */}
        <div>
          <label className="form-label">Marker Style</label>
          <select
            value={formData.marker_style}
            onChange={(e) => handleChange('marker_style', e.target.value)}
            className="form-input"
          >
            <option value="default">Default (Blue pins)</option>
            <option value="red">Red pins</option>
            <option value="green">Green pins</option>
            <option value="custom" disabled>Custom (Coming Soon)</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Choose the default marker style for unit locations
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting || loading}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  )
}
