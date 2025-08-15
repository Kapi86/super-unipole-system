'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MapPin, Calendar, ExternalLink, Home, Share2, Download } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/UI/Button'
import MapWrapper from '@/components/Map/MapWrapper'
import type { Campaign, Unit } from '@/types'
import { db } from '@/lib/supabase'

export default function CampaignMapPage() {
  const params = useParams()
  const campaignId = params.id as string
  
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (campaignId) {
      loadCampaignData()
    }
  }, [campaignId])

  const loadCampaignData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load campaign and all units
      const [campaignData, allUnits] = await Promise.all([
        db.campaigns.getById(campaignId),
        db.units.getAll()
      ])
      
      if (!campaignData) {
        setError('Campaign not found')
        return
      }
      
      // Filter units that belong to this campaign
      const campaignUnits = allUnits.filter(unit => 
        campaignData.unit_ids.includes(unit.id)
      )
      
      setCampaign(campaignData)
      setUnits(campaignUnits)
    } catch (error) {
      console.error('Error loading campaign:', error)
      setError('Failed to load campaign data')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${campaign?.name} - Campaign Map`,
          text: `View the advertising campaign "${campaign?.name}" with ${units.length} locations`,
          url: url
        })
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard(url)
      }
    } else {
      copyToClipboard(url)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
      alert('Link copied to clipboard!')
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Link copied to clipboard!')
    }
  }

  const handleDownloadData = () => {
    const data = {
      campaign: campaign,
      units: units,
      exported_at: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${campaign?.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_data.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-gray-500">Loading campaign map...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <MapPin className="w-full h-full" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Campaign not found'}
          </h1>
          <p className="text-gray-500 mb-6">
            The campaign you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/">
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  Super Unipole System
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadData}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Campaign Info */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {campaign.name}
                </h1>
                <div className="mt-1 flex items-center text-sm text-gray-500 space-x-4">
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {units.length} location{units.length !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Created {new Date(campaign.created_at || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500">Campaign ID</div>
                <div className="text-sm font-mono text-gray-900">{campaign.id}</div>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{units.length}</div>
                <div className="text-sm text-gray-500">Total Units</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {new Set(units.map(u => u.governorate)).size}
                </div>
                <div className="text-sm text-gray-500">Governorates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {campaign.updated_at ? new Date(campaign.updated_at).toLocaleDateString() : 'N/A'}
                </div>
                <div className="text-sm text-gray-500">Last Updated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">Active</div>
                <div className="text-sm text-gray-500">Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Campaign Map
            </h2>
            <p className="text-sm text-gray-500">
              Interactive map showing all advertising locations in this campaign
            </p>
          </div>
          
          <div className="p-6">
            <MapWrapper
              units={units}
              selectedUnits={units.map(u => u.id)}
              height="600px"
              showClustering={true}
            />
          </div>
        </div>

        {/* Units List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Campaign Locations
            </h2>
            <p className="text-sm text-gray-500">
              Detailed list of all advertising units in this campaign
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Governorate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coordinates
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {units.map((unit) => (
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
                      {unit.lat_lng}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Powered by Super Unipole System
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-sm text-primary-600 hover:text-primary-700">
                <Home className="w-4 h-4 inline mr-1" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
