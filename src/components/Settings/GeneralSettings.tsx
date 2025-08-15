'use client'

import { useState, useEffect } from 'react'
import { Save, Download, Upload, Trash2 } from 'lucide-react'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import type { UserSettings, Unit, Campaign } from '@/types'
import { exportUnitsToExcel, createSampleExcelFile } from '@/utils/excel'

interface GeneralSettingsProps {
  settings: UserSettings | null
  units: Unit[]
  campaigns: Campaign[]
  onSave: (settings: Partial<UserSettings>) => Promise<void>
  onClearData: () => Promise<void>
  loading?: boolean
}

export default function GeneralSettings({ 
  settings, 
  units, 
  campaigns, 
  onSave, 
  onClearData, 
  loading = false 
}: GeneralSettingsProps) {
  const [formData, setFormData] = useState({
    preferred_governorate: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Get unique governorates from units
  const governorates = Array.from(new Set(units.map(unit => unit.governorate))).sort()

  useEffect(() => {
    if (settings) {
      setFormData({
        preferred_governorate: settings.preferred_governorate || ''
      })
    }
  }, [settings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExportAllData = () => {
    const data = {
      units,
      campaigns,
      settings,
      exported_at: new Date().toISOString(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `super_unipole_backup_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportUnits = () => {
    exportUnitsToExcel(units, `all_units_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleDownloadSample = () => {
    createSampleExcelFile()
  }

  const handleClearData = async () => {
    try {
      await onClearData()
      setShowClearConfirm(false)
    } catch (error) {
      console.error('Error clearing data:', error)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* User Preferences */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">User Preferences</h3>
          <p className="text-sm text-gray-500">Configure your personal preferences</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="form-label">Preferred Governorate</label>
            <select
              value={formData.preferred_governorate}
              onChange={(e) => handleChange('preferred_governorate', e.target.value)}
              className="form-input"
            >
              <option value="">No preference</option>
              {governorates.map(gov => (
                <option key={gov} value={gov}>{gov}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Default governorate filter for unit lists
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting || loading}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </form>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Data Management</h3>
          <p className="text-sm text-gray-500">Export, import, and manage your data</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Export Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Export Data</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={handleExportAllData}
                disabled={units.length === 0 && campaigns.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export All Data
              </Button>
              
              <Button
                variant="outline"
                onClick={handleExportUnits}
                disabled={units.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Units (Excel)
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDownloadSample}
              >
                <Download className="w-4 h-4 mr-2" />
                Sample Excel File
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Export your data for backup or sharing purposes
            </p>
          </div>

          {/* System Stats */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">System Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary-600">{units.length}</div>
                <div className="text-xs text-gray-500">Total Units</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary-600">{campaigns.length}</div>
                <div className="text-xs text-gray-500">Campaigns</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary-600">{governorates.length}</div>
                <div className="text-xs text-gray-500">Governorates</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">Free</div>
                <div className="text-xs text-gray-500">Plan</div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-red-900 mb-3">Danger Zone</h4>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-red-900">Clear All Data</h5>
                  <p className="text-sm text-red-700">
                    Permanently delete all units, campaigns, and settings. This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="danger"
                  onClick={() => setShowClearConfirm(true)}
                  disabled={units.length === 0 && campaigns.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Data Confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Clear All Data
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete all data? This will permanently remove:
                      </p>
                      <ul className="mt-2 text-sm text-gray-500 list-disc list-inside">
                        <li>{units.length} advertising units</li>
                        <li>{campaigns.length} campaigns</li>
                        <li>All user settings</li>
                      </ul>
                      <p className="mt-2 text-sm text-red-600 font-medium">
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  variant="danger"
                  onClick={handleClearData}
                  className="w-full sm:ml-3 sm:w-auto"
                >
                  Yes, Clear All Data
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowClearConfirm(false)}
                  className="mt-3 w-full sm:mt-0 sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
