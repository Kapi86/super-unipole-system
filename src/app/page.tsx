'use client'

import Link from 'next/link'
import { MapPin, Target, Settings, ArrowRight, Download } from 'lucide-react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import Button from '@/components/UI/Button'
import { createSampleExcelFile } from '@/utils/excel'

const features = [
  {
    icon: MapPin,
    title: 'Location Management',
    description: 'Manage advertising units with full CRUD operations. Import from Excel or add manually.',
    href: '/location',
    color: 'bg-blue-500'
  },
  {
    icon: Target,
    title: 'Campaign Builder',
    description: 'Create campaigns, select units, and export shareable maps for your advertising campaigns.',
    href: '/campaign',
    color: 'bg-green-500'
  },
  {
    icon: Settings,
    title: 'Settings',
    description: 'Configure system preferences, map defaults, and export settings.',
    href: '/settings',
    color: 'bg-purple-500'
  }
]

const stats = [
  { label: 'Free Deployment', value: 'Netlify' },
  { label: 'Database', value: 'Supabase' },
  { label: 'Maps', value: 'OpenStreetMap' },
  { label: 'HTTPS', value: 'Enabled' }
]

export default function HomePage() {
  const handleDownloadSample = () => {
    createSampleExcelFile()
  }

  return (
    <DashboardLayout>
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            {process.env.NEXT_PUBLIC_APP_NAME || 'Super Unipole System'}
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            A fully online, map-based web application for managing and selling advertising locations (unipoles). 
            Built with modern web technologies and deployed on free services.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link href="/location">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleDownloadSample}
                className="w-full sm:w-auto"
              >
                <Download className="mr-2 w-4 h-4" />
                Sample Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Features */}
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="group relative bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
              >
                <div>
                  <span className={`inline-flex p-3 rounded-lg ${feature.color} text-white`}>
                    <Icon className="w-6 h-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                    {feature.title}
                    <span className="absolute inset-0" aria-hidden="true" />
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {feature.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center text-primary-600 group-hover:text-primary-700">
                  <span className="text-sm font-medium">Learn more</span>
                  <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Start Guide */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Quick Start Guide
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-full text-white text-sm font-medium">
                    1
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Set up your database
                  </h4>
                  <p className="text-sm text-gray-500">
                    Create a free Supabase account and run the provided SQL schema to set up your database.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-full text-white text-sm font-medium">
                    2
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Import your units
                  </h4>
                  <p className="text-sm text-gray-500">
                    Use the Location section to import your advertising units from Excel or add them manually.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-full text-white text-sm font-medium">
                    3
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Create campaigns
                  </h4>
                  <p className="text-sm text-gray-500">
                    Use the Campaign Builder to select units and create shareable campaign maps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
