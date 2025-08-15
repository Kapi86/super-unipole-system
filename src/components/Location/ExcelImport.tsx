'use client'

import { useState, useRef } from 'react'
import { Upload, Download, AlertCircle, CheckCircle, X } from 'lucide-react'
import Button from '@/components/UI/Button'
import Modal from '@/components/UI/Modal'
import type { ExcelImportResult } from '@/types'
import { parseExcelFile, convertExcelRowsToUnits, validateExcelFile, createSampleExcelFile } from '@/utils/excel'

interface ExcelImportProps {
  isOpen: boolean
  onClose: () => void
  onImport: (units: any[]) => Promise<ExcelImportResult>
}

export default function ExcelImport({ isOpen, onClose, onImport }: ExcelImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ExcelImportResult | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const validationError = validateExcelFile(selectedFile)
    if (validationError) {
      setResult({
        success: false,
        message: validationError
      })
      return
    }

    setFile(selectedFile)
    setResult(null)

    try {
      const rows = await parseExcelFile(selectedFile)
      const { units, errors } = convertExcelRowsToUnits(rows)
      
      setPreviewData(units.slice(0, 5)) // Show first 5 rows as preview
      
      if (errors.length > 0) {
        setResult({
          success: false,
          message: `Found ${errors.length} validation errors`,
          errors: errors.slice(0, 10) // Show first 10 errors
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to parse Excel file'
      })
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      const rows = await parseExcelFile(file)
      const { units, errors } = convertExcelRowsToUnits(rows)
      
      if (errors.length > 0) {
        setResult({
          success: false,
          message: `Cannot import due to ${errors.length} validation errors`,
          errors: errors.slice(0, 10)
        })
        return
      }

      const importResult = await onImport(units)
      setResult(importResult)
      
      if (importResult.success) {
        // Clear form after successful import
        setTimeout(() => {
          handleClose();
        }, 2000);
    } } catch (error) {
  setResult({
    success: false,
    message: error instanceof Error ? error.message : undefined
  });
}
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setResult(null)
    setPreviewData([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  const handleDownloadSample = () => {
    createSampleExcelFile()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Units from Excel" size="lg">
      <div className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Excel File Requirements
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• File must contain columns: Unit ID, Location, Governorate, Latitude,Longitude</li>
            <li>• Coordinates format: "30.0444,31.2357" (latitude,longitude)</li>
            <li>• Unit IDs must be unique</li>
            <li>• Maximum file size: 5MB</li>
          </ul>
          <div className="mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadSample}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Sample File
            </Button>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="form-label">Select Excel File</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                >
                  <span>Upload a file</span>
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                Excel files (.xlsx, .xls) or CSV up to 5MB
              </p>
            </div>
          </div>
          
          {file && (
            <div className="mt-2 text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        {/* Preview Data */}
        {previewData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Preview (first 5 rows)
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit ID</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Governorate</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Coordinates</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((unit, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-900">{unit.unit_id}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-900">{unit.location}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-900">{unit.governorate}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500 font-mono">{unit.lat_lng}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Result Messages */}
        {result && (
          <div className={`border rounded-md p-4 ${
            result.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 mr-3" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.message}
                </p>
                
                {result.imported_count && (
                  <p className="text-sm text-green-700 mt-1">
                    Successfully imported {result.imported_count} units
                  </p>
                )}
                
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-red-700 font-medium">Errors:</p>
                    <ul className="text-sm text-red-600 mt-1 space-y-1">
                      {result.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isProcessing}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || isProcessing || (result && !result.success)}
            loading={isProcessing}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Units
          </Button>
        </div>
      </div>
    </Modal>
  )
}
