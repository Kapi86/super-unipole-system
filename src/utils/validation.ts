// Validation utilities for the Super Unipole System

import type { Unit, ValidationError } from '@/types'

export function validateLatLng(latLng: string): boolean {
  if (!latLng || typeof latLng !== 'string') return false
  
  const parts = latLng.split(',')
  if (parts.length !== 2) return false
  
  const lat = parseFloat(parts[0].trim())
  const lng = parseFloat(parts[1].trim())
  
  return !isNaN(lat) && !isNaN(lng) && 
         lat >= -90 && lat <= 90 && 
         lng >= -180 && lng <= 180
}

export function parseLatLng(latLng: string): [number, number] | null {
  if (!validateLatLng(latLng)) return null
  
  const parts = latLng.split(',')
  const lat = parseFloat(parts[0].trim())
  const lng = parseFloat(parts[1].trim())
  
  return [lat, lng]
}

export function formatLatLng(lat: number, lng: number): string {
  return `${lat.toFixed(6)},${lng.toFixed(6)}`
}

export function validateUnit(unit: Partial<Unit>): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!unit.unit_id || unit.unit_id.trim().length === 0) {
    errors.push({ field: 'unit_id', message: 'Unit ID is required' })
  }
  
  if (!unit.location || unit.location.trim().length === 0) {
    errors.push({ field: 'location', message: 'Location is required' })
  }
  
  if (!unit.governorate || unit.governorate.trim().length === 0) {
    errors.push({ field: 'governorate', message: 'Governorate is required' })
  }
  
  if (!unit.lat_lng || !validateLatLng(unit.lat_lng)) {
    errors.push({ field: 'lat_lng', message: 'Valid coordinates are required (format: latitude,longitude)' })
  }
  
  return errors
}

export function validateExcelRow(row: any, rowIndex: number): ValidationError[] {
  const errors: ValidationError[] = []
  const prefix = `Row ${rowIndex + 1}: `
  
  if (!row['Unit ID'] || String(row['Unit ID']).trim().length === 0) {
    errors.push({ field: 'unit_id', message: `${prefix}Unit ID is required` })
  }
  
  if (!row['Location'] || String(row['Location']).trim().length === 0) {
    errors.push({ field: 'location', message: `${prefix}Location is required` })
  }
  
  if (!row['Governorate'] || String(row['Governorate']).trim().length === 0) {
    errors.push({ field: 'governorate', message: `${prefix}Governorate is required` })
  }
  
  const latLng = row['Latitude,Longitude']
  if (!latLng || !validateLatLng(String(latLng))) {
    errors.push({ 
      field: 'lat_lng', 
      message: `${prefix}Valid coordinates are required (format: latitude,longitude)` 
    })
  }
  
  return errors
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/\s+/g, ' ')
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Campaign validation
export function validateCampaignName(name: string): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!name || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Campaign name is required' })
  } else if (name.trim().length < 3) {
    errors.push({ field: 'name', message: 'Campaign name must be at least 3 characters long' })
  } else if (name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Campaign name must be less than 100 characters' })
  }
  
  return errors
}

export function validateUnitSelection(unitIds: string[]): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!unitIds || unitIds.length === 0) {
    errors.push({ field: 'unit_ids', message: 'At least one unit must be selected' })
  }
  
  return errors
}
