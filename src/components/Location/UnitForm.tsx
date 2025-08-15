'use client'

import { useState, useEffect } from 'react'
import { Save, X } from 'lucide-react'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import Modal from '@/components/UI/Modal'
import type { Unit, ValidationError } from '@/types'
import { validateUnit } from '@/utils/validation'

interface UnitFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (unit: Omit<Unit, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  unit?: Unit | null
  title: string
}

export default function UnitForm({
  isOpen,
  onClose,
  onSave,
  unit,
  title
}: UnitFormProps) {
  const [formData, setFormData] = useState({
    unit_id: '',
    location: '',
    governorate: '',
    lat_lng: ''
  })
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (unit) {
      setFormData({
        unit_id: unit.unit_id,
        location: unit.location,
        governorate: unit.governorate,
        lat_lng: unit.lat_lng
      })
    } else {
      setFormData({
        unit_id: '',
        location: '',
        governorate: '',
        lat_lng: ''
      })
    }
    setErrors([])
  }, [unit, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateUnit(formData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving unit:', error)
      setErrors([{ field: 'general', message: 'Failed to save unit. Please try again.' }])
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field-specific errors
    setErrors(prev => prev.filter(error => error.field !== field))
  }

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message
  }

  const generalError = errors.find(error => error.field === 'general')?.message

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {generalError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{generalError}</p>
          </div>
        )}

        <Input
          label="Unit ID"
          value={formData.unit_id}
          onChange={(e) => handleChange('unit_id', e.target.value)}
          error={getFieldError('unit_id')}
          placeholder="e.g., UNI001"
          required
        />

        <Input
          label="Location"
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          error={getFieldError('location')}
          placeholder="e.g., Downtown Cairo"
          required
        />

        <Input
          label="Governorate"
          value={formData.governorate}
          onChange={(e) => handleChange('governorate', e.target.value)}
          error={getFieldError('governorate')}
          placeholder="e.g., Cairo"
          required
        />

        <Input
          label="Coordinates"
          value={formData.lat_lng}
          onChange={(e) => handleChange('lat_lng', e.target.value)}
          error={getFieldError('lat_lng')}
          placeholder="e.g., 30.0444,31.2357"
          helperText="Format: latitude,longitude"
          required
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            {unit ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
