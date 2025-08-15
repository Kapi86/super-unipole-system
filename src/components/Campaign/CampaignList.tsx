'use client'

import { useState } from 'react'
import { Edit, Trash2, ExternalLink, Eye, Calendar, MapPin } from 'lucide-react'
import Button from '@/components/UI/Button'
import type { Campaign, Unit } from '@/types'

interface CampaignListProps {
  campaigns: Campaign[]
  units: Unit[]
  onEdit: (campaign: Campaign) => void
  onDelete: (campaign: Campaign) => void
  onExport: (campaign: Campaign) => void
  onView: (campaign: Campaign) => void
  loading?: boolean
}

export default function CampaignList({ 
  campaigns, 
  units,
  onEdit, 
  onDelete, 
  onExport,
  onView,
  loading = false 
}: CampaignListProps) {
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null)

  const getUnitsForCampaign = (campaign: Campaign) => {
    return units.filter(unit => campaign.unit_ids.includes(unit.id))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const toggleExpanded = (campaignId: string) => {
    setExpandedCampaign(expandedCampaign === campaignId ? null : campaignId)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-gray-500">Loading campaigns...</p>
        </div>
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first advertising campaign.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="divide-y divide-gray-200">
        {campaigns.map((campaign) => {
          const campaignUnits = getUnitsForCampaign(campaign)
          const isExpanded = expandedCampaign === campaign.id
          
          return (
            <div key={campaign.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {campaign.name}
                    </h3>
                    {campaign.export_url && (
                      <span title="Campaign exported">
  <<span title="Campaign exported">
  <ExternalLink className="ml-2 w-4 h-4 text-green-500" />
</span>
>
</span>

                    )}
                  </div>
                  
                  <div className="mt-1 flex items-center text-sm text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {campaignUnits.length} unit{campaignUnits.length !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Created {formatDate(campaign.created_at || '')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleExpanded(campaign.id)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onView(campaign)}
                  >
                    View Map
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onExport(campaign)}
                  >
                    Export
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(campaign)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onDelete(campaign)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Campaign Units ({campaignUnits.length})
                  </h4>
                  
                  {campaignUnits.length === 0 ? (
                    <p className="text-sm text-gray-500">No units selected for this campaign.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {campaignUnits.map((unit) => (
                        <div
                          key={unit.id}
                          className="bg-gray-50 rounded-md p-3 text-sm"
                        >
                          <div className="font-medium text-gray-900">
                            {unit.unit_id}
                          </div>
                          <div className="text-gray-600 flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {unit.location}
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            {unit.governorate}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {campaign.export_url && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            Campaign Map Exported
                          </p>
                          <p className="text-sm text-green-600">
                            Shareable map is available at the exported URL
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(campaign.export_url!, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
