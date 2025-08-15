// Excel import/export utilities

import * as XLSX from 'xlsx'
import type { Unit, ExcelImportResult, ExcelRow } from '@/types'
import { validateExcelRow, sanitizeString } from './validation'

export function parseExcelFile(file: File): Promise<ExcelRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        if (jsonData.length < 2) {
          throw new Error('Excel file must contain at least a header row and one data row')
        }
        
        const headers = jsonData[0] as string[]
        const requiredHeaders = ['Unit ID', 'Location', 'Governorate', 'Latitude,Longitude']
        
        // Validate headers
        const missingHeaders = requiredHeaders.filter(header => 
          !headers.some(h => h?.toString().trim().toLowerCase() === header.toLowerCase())
        )
        
        if (missingHeaders.length > 0) {
          throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`)
        }
        
        // Convert to objects
        const rows: ExcelRow[] = []
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[]
          if (row.some(cell => cell !== null && cell !== undefined && cell !== '')) {
            const rowObj: any = {}
            headers.forEach((header, index) => {
              if (header) {
                rowObj[header] = row[index]
              }
            })
            rows.push(rowObj)
          }
        }
        
        resolve(rows)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

export function convertExcelRowsToUnits(rows: ExcelRow[]): { units: Omit<Unit, 'id' | 'created_at' | 'updated_at'>[], errors: string[] } {
  const units: Omit<Unit, 'id' | 'created_at' | 'updated_at'>[] = []
  const errors: string[] = []
  
  rows.forEach((row, index) => {
    const validationErrors = validateExcelRow(row, index)
    
    if (validationErrors.length > 0) {
      errors.push(...validationErrors.map(e => e.message))
    } else {
      units.push({
        unit_id: sanitizeString(String(row['Unit ID'])),
        location: sanitizeString(String(row['Location'])),
        governorate: sanitizeString(String(row['Governorate'])),
        lat_lng: sanitizeString(String(row['Latitude,Longitude']))
      })
    }
  })
  
  return { units, errors }
}

export function exportUnitsToExcel(units: Unit[], filename: string = 'units.xlsx'): void {
  const data = units.map(unit => ({
    'Unit ID': unit.unit_id,
    'Location': unit.location,
    'Governorate': unit.governorate,
    'Latitude,Longitude': unit.lat_lng,
    'Created At': new Date(unit.created_at || '').toLocaleDateString(),
    'Updated At': new Date(unit.updated_at || '').toLocaleDateString()
  }))
  
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Units')
  
  // Auto-size columns
  const colWidths = [
    { wch: 15 }, // Unit ID
    { wch: 30 }, // Location
    { wch: 20 }, // Governorate
    { wch: 25 }, // Latitude,Longitude
    { wch: 15 }, // Created At
    { wch: 15 }  // Updated At
  ]
  worksheet['!cols'] = colWidths
  
  XLSX.writeFile(workbook, filename)
}

export function createSampleExcelFile(): void {
  const sampleData = [
    {
      'Unit ID': 'UNI001',
      'Location': 'Downtown Cairo',
      'Governorate': 'Cairo',
      'Latitude,Longitude': '30.0444,31.2357'
    },
    {
      'Unit ID': 'UNI002',
      'Location': 'Alexandria Corniche',
      'Governorate': 'Alexandria',
      'Latitude,Longitude': '31.2001,29.9187'
    },
    {
      'Unit ID': 'UNI003',
      'Location': 'Giza Pyramids Road',
      'Governorate': 'Giza',
      'Latitude,Longitude': '29.9792,31.1342'
    },
    {
      'Unit ID': 'UNI004',
      'Location': 'Luxor Temple Area',
      'Governorate': 'Luxor',
      'Latitude,Longitude': '25.6872,32.6396'
    },
    {
      'Unit ID': 'UNI005',
      'Location': 'Aswan High Dam',
      'Governorate': 'Aswan',
      'Latitude,Longitude': '24.0889,32.8998'
    },
    {
      'Unit ID': 'UNI006',
      'Location': 'Hurghada Marina',
      'Governorate': 'Red Sea',
      'Latitude,Longitude': '27.2579,33.8116'
    },
    {
      'Unit ID': 'UNI007',
      'Location': 'Sharm El Sheikh',
      'Governorate': 'South Sinai',
      'Latitude,Longitude': '27.9158,34.3300'
    },
    {
      'Unit ID': 'UNI008',
      'Location': 'Mansoura University',
      'Governorate': 'Dakahlia',
      'Latitude,Longitude': '31.0364,31.3801'
    },
    {
      'Unit ID': 'UNI009',
      'Location': 'Tanta City Center',
      'Governorate': 'Gharbia',
      'Latitude,Longitude': '30.7865,31.0004'
    },
    {
      'Unit ID': 'UNI010',
      'Location': 'Port Said Harbor',
      'Governorate': 'Port Said',
      'Latitude,Longitude': '31.2653,32.3019'
    }
  ]
  
  const worksheet = XLSX.utils.json_to_sheet(sampleData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample Units')
  
  // Auto-size columns
  const colWidths = [
    { wch: 15 }, // Unit ID
    { wch: 30 }, // Location
    { wch: 20 }, // Governorate
    { wch: 25 }  // Latitude,Longitude
  ]
  worksheet['!cols'] = colWidths
  
  XLSX.writeFile(workbook, 'sample-units.xlsx')
}

export function validateExcelFile(file: File): string | null {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv' // .csv
  ]
  
  if (!validTypes.includes(file.type)) {
    return 'Please select a valid Excel file (.xlsx, .xls) or CSV file'
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    return 'File size must be less than 5MB'
  }
  
  return null
}
