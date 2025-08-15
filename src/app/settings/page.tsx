'use client'

import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Map, User, Database } from 'lucide-react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import MapSettings from '@/components/Settings/MapSettings'
import GeneralSettings from '@/components/Settings/GeneralSettings'
import type { UserSettings, Unit, Campaign } from '@/types'
import { db } from '@/lib/supabase'

type SettingsTab = 'general' | 'map' | 'about'

const tabs = [
  { id: 'general' as SettingsTab, label: 'General', icon: User },
  { id: 'map' as SettingsTab, label: 'Map Settings', icon: Map },
  { id: 'about' as SettingsTab, label: 'About', icon: Database }
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [settingsData, unitsData, campaignsData] = await Promise.all([
        db.settings.get(),
        db.units.getAll(),
        db.campaigns.getAll()
      ])
      
      setSettings(settingsData)
      setUnits(unitsData)
      setCampaigns(campaignsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      const updatedSettings = await db.settings.upsert(newSettings)
      setSettings(updatedSettings)
    } catch (error) {
      throw error
    }
  }

  const handleClearAllData = async () => {
    try {
      // Delete all campaigns first (due to foreign key constraints)
      await Promise.all(campaigns.map(campaign => db.campaigns.delete(campaign.id)))
      
      // Delete all units
      await Promise.all(units.map(unit => db.units.delete(unit.id)))
      
      // Clear local state
      setUnits([])
      setCampaigns([])
    } catch (error) {
      throw error
    }
  }

  return (
    <DashboardLayout
      title="Settings"
      description="Configure your system preferences, map settings, and manage your data."
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      isActive
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'general' && (
            <GeneralSettings
              settings={settings}
              units={units}
              campaigns={campaigns}
              onSave={handleSaveSettings}
              onClearData={handleClearAllData}
              loading={loading}
            />
          )}

          {activeTab === 'map' && (
            <MapSettings
              settings={settings}
              onSave={handleSaveSettings}
              loading={loading}
            />
          )}

          {activeTab === 'about' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">About Super Unipole System</h3>
                <p className="text-sm text-gray-500">System information and technical details</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* System Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">System Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-900">Version</h5>
                      <p className="text-sm text-gray-600">1.0.0</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-900">Framework</h5>
                      <p className="text-sm text-gray-600">Next.js 14</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-900">Database</h5>
                      <p className="text-sm text-gray-600">Supabase (Free Tier)</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-900">Deployment</h5>
                      <p className="text-sm text-gray-600">Netlify (Free Tier)</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Full CRUD operations for units
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Excel import/export
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Interactive maps with Leaflet
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Campaign builder
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Shareable campaign maps
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Responsive design
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      HTTPS compatibility
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Free deployment
                    </div>
                  </div>
                </div>

                {/* Technology Stack */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Technology Stack</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Frontend</span>
                      <span className="text-gray-900">React 18, Next.js 14, TypeScript</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Styling</span>
                      <span className="text-gray-900">Tailwind CSS</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Maps</span>
                      <span className="text-gray-900">Leaflet + OpenStreetMap</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Database</span>
                      <span className="text-gray-900">Supabase PostgreSQL</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">File Processing</span>
                      <span className="text-gray-900">xlsx, PapaParse</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Deployment</span>
                      <span className="text-gray-900">Netlify Static Hosting</span>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Cost Breakdown</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-900">Total Monthly Cost</span>
                      <span className="text-lg font-bold text-green-900">$0.00</span>
                    </div>
                    <div className="space-y-1 text-sm text-green-700">
                      <div className="flex justify-between">
                        <span>Netlify Hosting</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Supabase Database</span>
                        <span>Free (up to 500MB)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>OpenStreetMap</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SSL Certificate</span>
                        <span>Free (Netlify)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
