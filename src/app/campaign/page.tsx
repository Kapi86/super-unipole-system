'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Eye, ExternalLink } from 'lucide-react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import Button from '@/components/UI/Button'
import Modal from '@/components/UI/Modal'
import MapWrapper from '@/components/Map/MapWrapper'
import CampaignForm from '@/components/Campaign/CampaignForm'
import CampaignList from '@/components/Campaign/CampaignList'
import UnitSelector from '@/components/Campaign/UnitSelector'
import type { Campaign, Unit } from '@/types'
import { db } from '@/lib/supabase'

export default function CampaignPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showCampaignForm, setShowCampaignForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showMapView, setShowMapView] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null)
  const [viewingCampaign, setViewingCampaign] = useState<Campaign | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [campaignsData, unitsData] = await Promise.all([
        db.campaigns.getAll(),
        db.units.getAll()
      ])
      setCampaigns(campaignsData)
      setUnits(unitsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCampaign = async (campaignData: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newCampaign = await db.campaigns.create(campaignData)
      setCampaigns(prev => [newCampaign, ...prev])
      setSelectedUnitIds([]) // Clear selection after creating campaign
    } catch (error) {
      throw error
    }
  }

  const handleUpdateCampaign = async (campaignData: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingCampaign) return

    try {
      const updatedCampaign = await db.campaigns.update(editingCampaign.id, campaignData)
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === editingCampaign.id ? updatedCampaign : campaign
      ))
      setEditingCampaign(null)
    } catch (error) {
      throw error
    }
  }

  const handleDeleteCampaign = async () => {
    if (!deletingCampaign) return

    try {
      await db.campaigns.delete(deletingCampaign.id)
      setCampaigns(prev => prev.filter(campaign => campaign.id !== deletingCampaign.id))
      setDeletingCampaign(null)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Error deleting campaign:', error)
    }
  }

  const handleExportCampaign = async (campaign: Campaign) => {
    try {
      // Generate export URL
      const exportUrl = `${window.location.origin}/campaign/${campaign.id}`
      
      // Update campaign with export URL
      await db.campaigns.update(campaign.id, { export_url: exportUrl })
      
      // Update local state
      setCampaigns(prev => prev.map(c => 
        c.id === campaign.id ? { ...c, export_url: exportUrl } : c
      ))
      
      // Open the exported map in a new tab
      window.open(exportUrl, '_blank')
    } catch (error) {
      console.error('Error exporting campaign:', error)
    }
  }

  const handleViewCampaign = (campaign: Campaign) => {
    setViewingCampaign(campaign)
    setShowMapView(true)
  }

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setSelectedUnitIds(campaign.unit_ids)
    setShowCampaignForm(true)
  }

  const handleDeleteClick = (campaign: Campaign) => {
    setDeletingCampaign(campaign)
    setShowDeleteConfirm(true)
  }

  const handleCloseCampaignForm = () => {
    setShowCampaignForm(false)
    setEditingCampaign(null)
    if (!editingCampaign) {
      setSelectedUnitIds([]) // Only clear selection when not editing
    }
  }

  const selectedUnits = units.filter(unit => selectedUnitIds.includes(unit.id))
  const viewingUnits = viewingCampaign 
    ? units.filter(unit => viewingCampaign.unit_ids.includes(unit.id))
    : []

  return (
    <DashboardLayout
      title="Campaign Builder"
      description="Create and manage advertising campaigns by selecting units and visualizing them on interactive maps."
    >
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => setShowCampaignForm(true)}
              disabled={selectedUnitIds.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            {selectedUnitIds.length} unit{selectedUnitIds.length !== 1 ? 's' : ''} selected • {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Unit Selection */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Select Units for Campaign
              </h2>
              <UnitSelector
                units={units}
                selectedUnitIds={selectedUnitIds}
                onSelectionChange={setSelectedUnitIds}
                loading={loading}
              />
            </div>
          </div>

          {/* Right Column: Map Preview */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Map Preview
              </h2>
              <MapWrapper
                units={units}
                selectedUnits={selectedUnitIds}
                height="400px"
                showClustering={false}
              />
              {selectedUnitIds.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  Showing {selectedUnitIds.length} selected unit{selectedUnitIds.length !== 1 ? 's' : ''} in red
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Your Campaigns
          </h2>
          <CampaignList
            campaigns={campaigns}
            units={units}
            onEdit={handleEditCampaign}
            onDelete={handleDeleteClick}
            onExport={handleExportCampaign}
            onView={handleViewCampaign}
            loading={loading}
          />
        </div>

        {/* Campaign Form Modal */}
        <CampaignForm
          isOpen={showCampaignForm}
          onClose={handleCloseCampaignForm}
          onSave={editingCampaign ? handleUpdateCampaign : handleCreateCampaign}
          campaign={editingCampaign}
          selectedUnitIds={selectedUnitIds}
          title={editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
        />

        {/* Map View Modal */}
        <Modal
          isOpen={showMapView}
          onClose={() => setShowMapView(false)}
          title={`Campaign Map: ${viewingCampaign?.name}`}
          size="xl"
        >
          <div className="space-y-4">
            <MapWrapper
              units={viewingUnits}
              selectedUnits={viewingCampaign?.unit_ids || []}
              height="500px"
              showClustering={false}
            />
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {viewingUnits.length} unit{viewingUnits.length !== 1 ? 's' : ''} in this campaign
              </span>
              
              {viewingCampaign?.export_url && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(viewingCampaign.export_url!, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Exported Map
                </Button>
              )}
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Confirm Delete"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the campaign "{deletingCampaign?.name}"? 
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
                onClick={handleDeleteCampaign}
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
