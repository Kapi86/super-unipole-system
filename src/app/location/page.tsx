'use client'

import { useState, useEffect } from 'react'
import { Plus, Upload, Download, Trash2 } from 'lucide-react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import Button from '@/components/UI/Button'
import UnitList from '@/components/Location/UnitList'
import UnitForm from '@/components/Location/UnitForm'
import ExcelImport from '@/components/Location/ExcelImport'
import Modal from '@/components/UI/Modal'
import type { Unit, ExcelImportResult } from '@/types'
import { db } from '@/lib/supabase'
import { exportUnitsToExcel } from '@/utils/excel'

export default function LocationPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [showUnitForm, setShowUnitForm] = useState(false)
  const [showExcelImport, setShowExcelImport] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null)

  useEffect(() => {
    loadUnits()
  }, [])

  const loadUnits = async () => {
    try {
      setLoading(true)
      const data = await db.units.getAll()
      setUnits(data)
    } catch (error) {
      console.error('Error loading units:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUnit = async (unitData: Omit<Unit, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Check if unit_id already exists
      const existing = await db.units.getByUnitId(unitData.unit_id)
      if (existing) {
        throw new Error('Unit ID already exists')
      }

      const newUnit = await db.units.create(unitData)
      setUnits(prev => [newUnit, ...prev])
    } catch (error) {
      throw error
    }
  }

  const handleUpdateUnit = async (unitData: Omit<Unit, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingUnit) return

    try {
      // Check if unit_id already exists (excluding current unit)
      const existing = await db.units.getByUnitId(unitData.unit_id)
      if (existing && existing.id !== editingUnit.id) {
        throw new Error('Unit ID already exists')
      }

      const updatedUnit = await db.units.update(editingUnit.id, unitData)
      setUnits(prev => prev.map(unit => 
        unit.id === editingUnit.id ? updatedUnit : unit
      ))
      setEditingUnit(null)
    } catch (error) {
      throw error
    }
  }

  const handleDeleteUnit = async () => {
    if (!deletingUnit) return

    try {
      await db.units.delete(deletingUnit.id)
      setUnits(prev => prev.filter(unit => unit.id !== deletingUnit.id))
      setDeletingUnit(null)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Error deleting unit:', error)
    }
  }

  const handleExcelImport = async (importUnits: any[]): Promise<ExcelImportResult> => {
    try {
      const result = await db.units.bulkUpsert(importUnits)
      await loadUnits() // Reload to get updated data
      
      return {
        success: true,
        message: 'Units imported successfully',
        imported_count: result.length
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Import failed'
      }
    }
  }

  const handleExportExcel = () => {
    exportUnitsToExcel(units, `units-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit)
    setShowUnitForm(true)
  }

  const handleDeleteClick = (unit: Unit) => {
    setDeletingUnit(unit)
    setShowDeleteConfirm(true)
  }

  const handleCloseUnitForm = () => {
    setShowUnitForm(false)
    setEditingUnit(null)
  }

  return (
    <DashboardLayout
      title="Location Management"
      description="Manage your advertising units with full CRUD operations, Excel import/export, and real-time updates."
    >
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowUnitForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Unit
            </Button>
            <Button variant="outline" onClick={() => setShowExcelImport(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import Excel
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportExcel}
              disabled={units.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            Total Units: {units.length}
          </div>
        </div>

        {/* Units List */}
        <UnitList
          units={units}
          onEdit={handleEditUnit}
          onDelete={handleDeleteClick}
          loading={loading}
        />

        {/* Unit Form Modal */}
        <UnitForm
          isOpen={showUnitForm}
          onClose={handleCloseUnitForm}
          onSave={editingUnit ? handleUpdateUnit : handleCreateUnit}
          unit={editingUnit}
          title={editingUnit ? 'Edit Unit' : 'Add New Unit'}
        />

        {/* Excel Import Modal */}
        <ExcelImport
          isOpen={showExcelImport}
          onClose={() => setShowExcelImport(false)}
          onImport={handleExcelImport}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Confirm Delete"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the unit "{deletingUnit?.unit_id}"? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteUnit}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
