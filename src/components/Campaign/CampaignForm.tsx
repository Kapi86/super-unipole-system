'use client'

import { useState, useEffect } from 'react'
import { Save, X } from 'lucide-react'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import Modal from '@/components/UI/Modal'
import type { Campaign, ValidationError } from '@/types'
import { validateCampaignName, validateUnitSelection } from '@/utils/validation'

interface CampaignFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  campaign?: Campaign | null
  selectedUnitIds: string[]
  title: string
}

export default function CampaignForm({ 
  isOpen, 
  onClose, 
  onSave, 
  campaign, 
  selectedUnitIds,
  title 
}: CampaignFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    unit_ids: [] as string[]
  })
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        unit_ids: campaign.unit_ids
      })
    } else {
      setFormData({
        name: '',
        unit_ids: selectedUnitIds
      })
    }
    setErrors([])
  }, [campaign, selectedUnitIds, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const nameErrors = validateCampaignName(formData.name)
    const unitErrors = validateUnitSelection(formData.unit_ids)
    const allErrors = [...nameErrors, ...unitErrors]
    
    if (allErrors.length > 0) {
      setErrors(allErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving campaign:', error)
      setErrors([{ field: 'general', message: 'Failed to save campaign. Please try again.' }])
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
          label="Campaign Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={getFieldError('name')}
          placeholder="e.g., Summer 2024 Campaign"
          required
        />

        <div>
          <label className="form-label">Selected Units</label>
          <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm text-gray-600">
              {formData.unit_ids.length} unit{formData.unit_ids.length !== 1 ? 's' : ''} selected
            </p>
            {getFieldError('unit_ids') && (
              <p className="mt-1 text-sm text-red-600">
                {getFieldError('unit_ids')}
              </p>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Select units from the list below to include them in this campaign
          </p>
        </div>

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
            {campaign ? 'Update' : 'Create'} Campaign
          </Button>
        </div>
      </form>
    </Modal>
  )
}
