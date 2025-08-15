'use client'

import { useState, useMemo } from 'react'
import { Edit, Trash2, Search, Filter, MapPin } from 'lucide-react'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import type { Unit } from '@/types'
import { parseLatLng } from '@/utils/validation'

interface UnitListProps {
  units: Unit[]
  onEdit: (unit: Unit) => void
  onDelete: (unit: Unit) => void
  loading?: boolean
}

export default function UnitList({ 
  units, 
  onEdit, 
  onDelete, 
  loading = false 
}: UnitListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGovernorate, setSelectedGovernorate] = useState('')
  const [sortField, setSortField] = useState<keyof Unit>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Get unique governorates for filter
  const governorates = useMemo(() => {
    const unique = Array.from(new Set(units.map(unit => unit.governorate)))
    return unique.sort()
  }, [units])

  // Filter and sort units
  const filteredAndSortedUnits = useMemo(() => {
    let filtered = units.filter(unit => {
      const matchesSearch = 
        unit.unit_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.location.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesGovernorate = 
        !selectedGovernorate || unit.governorate === selectedGovernorate

      return matchesSearch && matchesGovernorate
    })

    // Sort units
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // Handle date sorting
      if (sortField === 'created_at' || sortField === 'updated_at') {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [units, searchTerm, selectedGovernorate, sortField, sortDirection])

  const handleSort = (field: keyof Unit) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCoordinates = (latLng: string) => {
    const coords = parseLatLng(latLng)
    if (!coords) return latLng
    return `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 text-center">
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
        <div className="flex flex-col sm:flex-row gap-4">
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
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {filteredAndSortedUnits.length} of {units.length} units
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('unit_id')}
              >
                Unit ID
                {sortField === 'unit_id' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('location')}
              >
                Location
                {sortField === 'location' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('governorate')}
              >
                Governorate
                {sortField === 'governorate' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coordinates
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('created_at')}
              >
                Created
                {sortField === 'created_at' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedUnits.map((unit) => (
              <tr key={unit.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {unit.unit_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    {unit.location}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {unit.governorate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {formatCoordinates(unit.lat_lng)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(unit.created_at || '')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(unit)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onDelete(unit)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredAndSortedUnits.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No units found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedGovernorate 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first advertising unit.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
