// Core types for the Super Unipole System

export interface Unit {
  id: string;
  unit_id: string;
  location: string;
  governorate: string;
  lat_lng: string; // Format: "latitude,longitude"
  created_at?: string;
  updated_at?: string;
}

export interface Campaign {
  id: string;
  name: string;
  unit_ids: string[];
  created_at?: string;
  updated_at?: string;
  export_url?: string;
}

export interface ExcelImportResult {
  success: boolean;
  message: string;
  imported_count?: number;
  errors?: string[];
  skipped_count?: number;
}

export interface MapMarker {
  id: string;
  position: [number, number]; // [latitude, longitude]
  unit: Unit;
  selected?: boolean;
}

export interface UserSettings {
  id?: string;
  default_zoom: number;
  default_center: [number, number];
  preferred_governorate?: string;
  map_style?: string;
  marker_style?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExportMapConfig {
  campaign_id: string;
  campaign_name: string;
  units: Unit[];
  map_center?: [number, number];
  zoom_level?: number;
  marker_style?: string;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState {
  isSubmitting: boolean;
  errors: ValidationError[];
  success?: boolean;
  message?: string;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Excel import types
export interface ExcelRow {
  'Unit ID': string;
  'Location': string;
  'Governorate': string;
  'Latitude,Longitude': string;
}

// Navigation types
export type NavigationTab = 'location' | 'campaign' | 'settings';

export interface NavigationItem {
  id: NavigationTab;
  label: string;
  icon: string;
  href: string;
}
