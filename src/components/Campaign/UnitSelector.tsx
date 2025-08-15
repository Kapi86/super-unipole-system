'use client'

import { useState, useMemo } from 'react'
import { Search, MapPin, CheckSquare, Square } from 'lucide-react'
import Input from '@/components/UI/Input'
import Button from '@/components/UI/Button'
import type { Unit } from '@/types'

interface UnitSelectorProps {
  units: Unit[]
  selectedUnitIds: string[]
  onSelectionChange: (unitIds: string[]) => void
  loading?: boolean
}

export default function UnitSelector({ 
  units, 
  selectedUnitIds, 
  onSelectionChange, 
  loading = false 
}: UnitSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGovernorate, setSelectedGovernorate] = useState('')

  // Get unique governorates for filter
  const governorates = useMemo(() => {
    const unique = Array.from(new Set(units.map(unit => unit.governorate)))
    return unique.sort()
  }, [units])

  // Filter units
  const filteredUnits = useMemo(() => {
    return units.filter(unit => {
      const matchesSearch = 
        unit.unit_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.location.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesGovernorate = 
        !selectedGovernorate || unit.governorate === selectedGovernorate

      return matchesSearch && matchesGovernorate
    })
  }, [units, searchTerm, selectedGovernorate])

  const handleUnitToggle = (unitId: string) => {
    const newSelection = selectedUnitIds.includes(unitId)
      ? selectedUnitIds.filter(id => id !== unitId)
      : [...selectedUnitIds, unitId]
    
    onSelectionChange(newSelection)
  }

  const handleSelectAll = () => {
    const allFilteredIds = filteredUnits.map(unit => unit.id)
    const allSelected = allFilteredIds.every(id => selectedUnitIds.includes(id))
    
    if (allSelected) {
      // Deselect all filtered units
      const newSelection = selectedUnitIds.filter(id => !allFilteredIds.includes(id))
      onSelectionChange(newSelection)
    } else {
      // Select all filtered units
      const newSelection = Array.from(new Set([...selectedUnitIds, ...allFilteredIds]))
      onSelectionChange(newSelection)
    }
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  const isAllFilteredSelected = filteredUnits.length > 0 && 
    filteredUnits.every(unit => selectedUnitIds.includes(unit.id))

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-gray-500">Loading units...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header with search and filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by Unit ID or Location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <select
              value={selectedGovernorate}
              onChange={(e) => setSelectedGovernorate(e.target.value)}
              className="form-input"
            >
              <option value="">All Governorates</option>
              {governorates.map(gov => (
                <option key={gov} value={gov}>{gov}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSelectAll}
              disabled={filteredUnits.length === 0}
            >
              {isAllFilteredSelected ? (
                <>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Deselect All
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Select All
                </>
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearAll}
              disabled={selectedUnitIds.length === 0}
            >
              Clear Selection
            </Button>
          </div>
          
          <p className="text-sm text-gray-500">
            {selectedUnitIds.length} selected • {filteredUnits.length} of {units.length} shown
          </p>
        </div>
      </div>

      {/* Unit List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredUnits.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No units found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUnits.map((unit) => {
              const isSelected = selectedUnitIds.includes(unit.id)
              
              return (
                <div
                  key={unit.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => handleUnitToggle(unit.id)}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {unit.unit_id}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {unit.location}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-900">
                            {unit.governorate}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            {unit.lat_lng}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
